import type { App } from 'vue'
import SuperPlayer from './SuperPlayer.vue'
import { nativeKernel } from './kernels/native'
import { hlsKernel, ensureHlsJs } from './kernels/hls'
import { flvKernel, ensureMpegts, ensureFlvJs } from './kernels/flv'
import { aliKernel } from './kernels/ali'
import { HLS_JS_URL, MPEGTS_JS_URL, FLV_JS_URL } from './types'
import { extOf } from './kernels/native'
import { injectStyle } from './style'

// 组件自带样式在运行时注入，无需使用者手动 import CSS
injectStyle()

export default SuperPlayer
export {
  SuperPlayer,
  nativeKernel,
  hlsKernel,
  flvKernel,
  aliKernel,
  ensureHlsJs,
  ensureMpegts,
  /** @deprecated 请改用 `ensureMpegts` */
  ensureFlvJs,
  HLS_JS_URL,
  MPEGTS_JS_URL,
  /** @deprecated 请改用 `MPEGTS_JS_URL` */
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
