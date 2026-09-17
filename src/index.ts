import type { App } from 'vue'
import SuperPlayer from './SuperPlayer.vue'
import { nativeKernel } from './kernels/native'
import { hlsKernel, ensureHlsJs } from './kernels/hls'
import { flvKernel, ensureFlvJs } from './kernels/flv'
import { aliKernel } from './kernels/ali'
import { HLS_JS_URL, FLV_JS_URL } from './types'
import { extOf } from './kernels/native'

export default SuperPlayer
export {
  SuperPlayer,
  nativeKernel,
  hlsKernel,
  flvKernel,
  aliKernel,
  ensureHlsJs,
  ensureFlvJs,
  HLS_JS_URL,
  FLV_JS_URL,
  extOf,
}
export type {
  Kernel,
  KernelCreateOptions,
  KernelEvents,
  KernelInstance,
  PlayerStatus,
} from './types'

/** 全局安装：app.use(SuperPlayer) 后可用 <super-player /> */
SuperPlayer.install = (app: App): void => {
  app.component('SuperPlayer', SuperPlayer)
  app.component('super-player', SuperPlayer)
}
