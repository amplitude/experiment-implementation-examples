# Nuxt.js Server-side Rendering Example

This repository is an example for running Amplitude Experiment in a server-side rendered nuxt.js app.

## How it works

This example works by using a [nuxt plugin](`./plugins/experiment.ts`) to evaluate the user when the server receives a request, passing the result to the `nuxtState` so that the client can use the results. We boostrap a client-side experiment SDK to access the variant values and automatically track exposure from the browser.

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

| Replace                 | Description                                                                                                          |
|-------------------------|----------------------------------------------------------------------------------------------------------------------|
| `SERVER_DEPLOYMENT_KEY` | Your Amplitude Experiment server type deployment key. Used to initialize server-side SDK.                            |
| `CLIENT_DEPLOYMENT_KEY` | Your Amplitude Experiment client type deployment key. Used to initialize client-side SDK used for exposure tracking. |
| `ID_COOKIE_KEY`         | The key for the cookie used to store the user's identity.                                                            |
| `LOCAL_EVALUATION`      | Set to `true` if you want to evaluate using local evaluation, `false` if you want to use remote evaluation           |

