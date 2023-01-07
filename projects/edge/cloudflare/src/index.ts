/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `wrangler dev src/index.ts` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `wrangler publish src/index.ts --name my-worker` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */
import { evaluate } from "@amplitude/evaluation-js";

export interface Env {
  DEPLOYMENT_KEY: string;
  FLAGS_KV: KVNamespace;
}

type FlagConfig = Record<string, unknown>;

type Variant = {
  value: string;
  payload?: string;
};

type EvaluationResult = Record<string, Variant>;

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
        `request must contain 'user_id' or 'device_id' query parameters`
      );
    }
    try {
      // Get flag configs from the KV.
      const flags = await env.FLAGS_KV.get<FlagConfig[]>(env.DEPLOYMENT_KEY, {
        type: "json",
      });
      if (!flags || flags.length === 0) {
        return new Response("{}");
      }
      // Evaluate user for flag configs
      const results: EvaluationResult = evaluate(flags, { user_id: userId });
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
    // Fetch the flag configs from Amplitude
    const response = await fetch(
      "https://api.lab.amplitude.com/sdk/rules?eval_mode=local",
      {
        headers: {
          Authorization: `Api-Key ${env.DEPLOYMENT_KEY}`,
        },
      }
    );
    if (response.status != 200) {
      console.error(
        "fetch flag configs - failed:",
        response.status,
        response.statusText
      );
      return;
    }
    // Write the flag configs to the KV. The KV key is the deployment key, and
    // the value is all the flags configs.
    const flags: FlagConfig[] = await response.json();
    try {
      await env.FLAGS_KV.put(env.DEPLOYMENT_KEY, JSON.stringify(flags));
    } catch (e) {
      console.log("put kv - error:", env.DEPLOYMENT_KEY);
    }
  },
};
