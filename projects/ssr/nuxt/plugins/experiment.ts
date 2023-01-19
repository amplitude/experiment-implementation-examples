import { Context } from "@nuxt/types";
import { Inject } from "@nuxt/types/app";
import {
  Experiment as ExperimentServer,
  LocalEvaluationClient,
  RemoteEvaluationClient,
  Variant
} from "@amplitude/experiment-node-server";
import {Experiment, ExperimentClient, Exposure, Source} from "@amplitude/experiment-js-client";

// TODO Customize key used to reference ID in cookie.
const ID_COOKIE_KEY = 'ID_COOKIE_KEY'

// TODO Update server and client deployment key.
const SERVER_DEPLOYMENT_KEY = 'SERVER_DEPLOYMENT_KEY'
const CLIENT_DEPLOYMENT_KEY = 'CLIENT_DEPLOYMENT_KEY'
const LOCAL_EVALUATION = true

let experimentLocal: LocalEvaluationClient
let experimentRemote: RemoteEvaluationClient

export default async function (context: Context, inject: Inject) {

  // Chose which evaluation mode to use. You may remove the other.
  if (process.server) {
    if (!experimentLocal && LOCAL_EVALUATION) {
      experimentLocal = ExperimentServer.initializeLocal(SERVER_DEPLOYMENT_KEY, {debug: true})
      await experimentLocal.start()
    }
    if (!experimentRemote && !LOCAL_EVALUATION) {
      experimentRemote = ExperimentServer.initializeRemote(SERVER_DEPLOYMENT_KEY, {debug: true})
    }
  }

  let variants: Record<string, Variant> = {}

  /*
   * Server-side
   */
  if (process.server) {
    // Parse device id from cookie, or generate if the cookie is not set.
    const { req, res, beforeNuxtRender } = context
    const cookie = req.headers?.cookie
    let deviceId: string | undefined;
    if (cookie) {
      deviceId = cookie.split(';').find(value => {
        const pair: string[] = value.split('=')
        return pair && pair.length > 1 && pair[0].trim() === ID_COOKIE_KEY;
      })
    }
    if (!deviceId) {
      deviceId = randomString(32)
      res.setHeader('set-cookie', `${ID_COOKIE_KEY}=${deviceId}`)
    }
    // Evaluate the user.
    const user = { device_id: deviceId }
    if (LOCAL_EVALUATION) {
      variants = await experimentLocal.evaluate(user)
    } else {
      variants = await experimentRemote.fetch(user)
    }
    // Set the result in the nuxt state to be used on the client side.
    beforeNuxtRender(({ nuxtState }) => {
      nuxtState.variants = variants
    })
  }

  /*
   * Client-side
   */
  if (process.client) {
    // Access variants from the nuxt state
    const { nuxtState } = context
    variants = nuxtState.variants
  }

  // Initialize the experiment client and inject to be used in components.
  const experiment = Experiment.initialize(CLIENT_DEPLOYMENT_KEY, {
    initialVariants: variants,
    source: Source.InitialVariants,
    exposureTrackingProvider: {
      track(exposure: Exposure)  {
        // TODO Track exposure, but only on client-side.
        if (process.client) {
          console.log('Exposure:', exposure)
        }
      }
    }
  })
  // Client side experiment SDK can be accessed from via this.$experiment
  // See: ../components/Experiment.vue
  inject('experiment', experiment)
}

const randomString = (length: number): string => {
  let result = '';
  const characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

