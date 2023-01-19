import { Context } from "@nuxt/types";
import { Inject } from "@nuxt/types/app";
import {Experiment, LocalEvaluationClient, RemoteEvaluationClient, Variant} from "@amplitude/experiment-node-server";

const ID_COOKIE_KEY = 'ID_COOKIE_KEY'
const DEPLOYMENT_KEY = 'DEPLOYMENT_KEY'
const LOCAL_EVALUATION = true
let experimentLocal: LocalEvaluationClient
let experimentRemote: RemoteEvaluationClient

export default async function (context: Context, inject: Inject) {

  // Chose which evaluation mode to use. You may remove the other.
  if (process.server) {
    if (!experimentLocal && LOCAL_EVALUATION) {
      experimentLocal = Experiment.initializeLocal(DEPLOYMENT_KEY, {debug: true})
      await experimentLocal.start()
    }
    if (!experimentRemote && !LOCAL_EVALUATION) {
      experimentRemote = Experiment.initializeRemote(DEPLOYMENT_KEY, {debug: true})
    }
  }

  let experiments: Record<string, Variant> = {}

  // Server-side
  if (process.server) {
    // Parse device id from cookie, or generate if the cookie is not set.
    const { req, res, beforeNuxtRender } = context
    const cookie = req.headers?.cookie
    let deviceId: string | undefined;
    if (cookie) {
      deviceId = cookie.split(';').find(value => {
        const pair: string[] = value.split('=')
        if (pair && pair.length > 1 && pair[0].trim() === ID_COOKIE_KEY) {
          return true
        } else {
          return false
        }
      })
    }
    if (!deviceId) {
      deviceId = randomString(32)
      res.setHeader('set-cookie', `${ID_COOKIE_KEY}=${deviceId}`)
    }
    // Evaluate the user.
    const user = { device_id: deviceId }
    if (LOCAL_EVALUATION) {
      experiments = await experimentLocal.evaluate(user)
    } else {
      experiments = await experimentRemote.fetch(user)
    }
    // Set the result in the nuxt state.
    beforeNuxtRender(({ nuxtState }) => {
      nuxtState.experiments = experiments
    })
  }

  // Client-side
  if (process.client) {
    // Access experiments from the nuxt state
    const { nuxtState } = context
    experiments = nuxtState.experiments
  }

  // Inject the experiments to be used in components
  inject('experiments', experiments)
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

