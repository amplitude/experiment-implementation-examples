# Cloudflare Worker Example

This repository is an example for running Amplitude Experiment local evaluation on the edge, in a Cloudflare Worker. You should already be familiar with Cloudflare Workers and have a development environment (account, worker, cli, etc.) already set up.

## How it works

This setup relies on using Cloudflare's Edge KV to store flag configs, written by the worker using a trigger scheduled once per minute.
The worker handles incoming requests containing the user ID and device ID as query parameters `user_id` and `device_id` respectively. The user is then evaluated for all flags contained in the KV store.

## Getting started

This guide assumes you have already:
1. Create a server deployment in Amplitude Experiment
2. Created a flag in Amplitude experiment, added the deployment, allocated users, and activated the flag.

First, install project dependencies, then configure the `wrangler.toml` and finally run the worker.

### Install dependencies

```
yarn install
```

### Configure the worker

In `wrangler.toml`, replace:

| Replace               | Description                                                     |
|-----------------------|-----------------------------------------------------------------|
| `WORKER_NAME`         | The name of your Cloudflare Worker.                             |
| `ACCOUNT_ID`          | Your cloudflare account ID.                                     |
| `DEPLOYMENT_KEY`      | Your Amplitude Experiment deployment key (must be server type)  |
| `FLAGS_KV_PREVIEW_ID` | The preview ID for the KV used to store flag configs.           |
| `FLAGS_KV_ID`         | The ID for the KV used to store flag configs.                   |

### Run the worker

Run the worker locally with the option to test triggers

```
wrangler dev --test-scheduled
```

In a different terminal trigger the scheduled task to write flag configs to the KV.

```
curl "http://localhost:8787/__scheduled?cron=*+*+*+*+*"
```

Finally, send a request with a user ID.

```
curl "http://localhost:8787?user_id=brian"
```

If everything is set up correctly, you should see your flag key and the assigned variant in the response.
