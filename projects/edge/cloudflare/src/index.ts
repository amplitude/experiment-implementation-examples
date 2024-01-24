/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `wrangler dev src/index.ts` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `wrangler publish src/index.ts --name my-worker` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

import {
  EvaluationEngine,
  EvaluationFlag,
  EvaluationVariant,
  HttpRequest,
  HttpResponse,
  HttpClient,
  SdkFlagApi,
  topologicalSort
} from "@amplitude/experiment-core";

export interface Env {
  DEPLOYMENT_KEY: string;
  FLAGS_KV: KVNamespace;
}

// Implementation of the core HttpClient interface using cloudflare APIs.
const httpClient: HttpClient = {
  async request(request: HttpRequest): Promise<HttpResponse> {
    const response = await fetch(request.requestUrl, {
      headers: request.headers,
    });
    const body = await response.text();
    return { status: response.status, body }
  }
}

// The evaluation engine.
const engine = new EvaluationEngine();

export default {
  async fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext
  ): Promise<Response> {
    // Parse user id and flags from query parameters.
    const url = new URL(request.url);
    const userId = url.searchParams.get("user_id");
    const deviceId = url.searchParams.get("device_id");
    if (!userId && !deviceId) {
      return new Response(
        `request must contain 'user_id' or 'device_id' query parameters asdf`
      );
    }
    try {
      // Get flag configs from the KV. Validate, and map to object of flag keys
      // to flag config objects.
      const flags = await env.FLAGS_KV.get<Record<string, EvaluationFlag>>(env.DEPLOYMENT_KEY, {
        type: "json",
      });
      if (!flags || Object.keys(flags).length === 0) {
        return new Response("{}");
      }
      // Build the user object
      const user = { user_id: userId, device_id: deviceId };
      // Evaluate user for flag configs
      const results: Record<string, EvaluationVariant> = engine.evaluate(
          { user: user },
          topologicalSort(flags)
      );
      return new Response(JSON.stringify(results));
    } catch (e) {
      // Evaluation failed.
      console.error("evaluation failure:", e);
      return new Response(null, {
        status: 500,
        statusText: `evaluation failed: ${e}`,
      });
    }
  },
  async scheduled(
    controller: ScheduledController,
    env: Env,
    ctx: ExecutionContext
  ): Promise<void> {
    const client = new SdkFlagApi(
        env.DEPLOYMENT_KEY,
        "https://flag.lab.amplitude.com",
        httpClient
    );
    // Get the flag configurations.
    let flags: Record<string, EvaluationFlag>;
    try {
      flags = await client.getFlags();
    } catch (e) {
      console.error("get flag configs - failure:", e);
      return;
    }
    // Write the flag configs to the KV. The KV key is the deployment key, and
    // the value is all the flags configs.
    try {
      await env.FLAGS_KV.put(env.DEPLOYMENT_KEY, JSON.stringify(flags));
    } catch (e) {
      console.error("put kv - failure:", env.DEPLOYMENT_KEY, e);
    }
  },
};
