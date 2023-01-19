# Nuxt.js Server-side Rendering Example

This repository is an example for running Amplitude Experiment in a server-side rendered nuxt.js app.

## How it works

This example works by using a [nuxt plugin](`./plugins/experiment.ts`) to evaluate the user when the server receives a request, passing the result to the `nuxtState` so that the client can use the results, and further injecting the results to used when rendering server-side.

The plugin attempts to access the user identity in a cookie in order to evaluate the user. If the cookie is missing, the plugin generates an ID to evaluate, and sets the `set-cookie` header in the response to use the same ID in subsequent requests.

## Getting started

> 🚧 **Warning:** This is just an example. You should do your due diligence before running any of this code in production. We recommend tailoring the code for your specific system and application.

First, install dependencies and test that the server starts. Next, configure the code with your experiment deployment key and which evaluation mode to use, then determine the cookie to use to pass identity between the client and the server.

### Install, build, and run

```bash
# install dependencies
$ yarn install

# serve with hot reload at localhost:3000
$ yarn dev

# build for production and launch server
$ yarn build
$ yarn start
```

For detailed explanation on how Nuxt.js works, check out the [documentation](https://nuxtjs.org).

### Configure deployment, cookie, and evaluation mode

In `./plugins/experiment.ts`:

| Replace           | Description                                                                                                |
|-------------------|------------------------------------------------------------------------------------------------------------|
| `DEPLOYMENT_KEY`  | Your Amplitude Experiment deployment key (must be server type)                                             |
| `ID_COOKIE_KEY`   | The key for the cookie used to store the user's identity.                                                  |
| `LOCAL_EVALUATION` | Set to `true` if you want to evaluate using local evaluation, `false` if you want to use remote evaluation |

