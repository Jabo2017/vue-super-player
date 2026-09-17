/** 内核统一事件回调集合 */
export interface KernelEvents {
  onReady(): void
  onPlay(): void
  onPlaying(): void
  onPause(): void
  onEnded(): void
  onError(err?: unknown): void
  onTimeupdate(currentTime: number, duration: number): void
  onWaiting(): void
}

/** 内核创建参数 */
export interface KernelCreateOptions {
  container: HTMLElement
  source: string
  autoplay: boolean
  muted: boolean
  loop: boolean
  poster: string
  isLive: boolean
  playsinline: boolean
  events: KernelEvents
  /** hls.js CDN 地址（hls 内核自加载），可换自托管 */
  hlsJsUrl?: string
  /** flv.js CDN 地址（flv 内核自加载），可换自托管 */
  flvJsUrl?: string
  /** Aliplayer SDK js 地址（ali 内核） */
  aliSdkUrl?: string
  /** Aliplayer SDK css 地址（ali 内核） */
  aliSdkCssUrl?: string
  /** Aliplayer License 配置（SDK ≥2.28 必需） */
  aliLicense?: Record<string, unknown>
}

/** 内核实例统一接口（对齐 v4 ali 内核与原生能力） */
export interface KernelInstance {
  play(): void
  pause(): void
  replay(): void
  seek(time: number): void
  getCurrentTime(): number
  getDuration(): number
  getVolume(): number
  setVolume(vol: number): void
  setSpeed(speed: number): void
  getStatus(): 'ready' | 'playing' | 'paused' | 'ended' | string
  dispose(): void
}

/** 可插拔内核接口 */
export interface Kernel {
  name: string
  /** 是否能播放该地址（auto 模式检测用） */
  canPlay(source: string, isLive: boolean): boolean
  /** 创建实例；允许内部异步加载 CDN 脚本 */
  create(options: KernelCreateOptions): Promise<KernelInstance> | KernelInstance
}

/** 播放器状态 */
export type PlayerStatus = 'idle' | 'ready' | 'playing' | 'paused' | 'ended' | (string & {})

/** CDN 脚本地址（jsdelivr），可替换为自托管 */
export const HLS_JS_URL = 'https://cdn.jsdelivr.net/npm/hls.js@1/dist/hls.min.js'
export const FLV_JS_URL = 'https://cdn.jsdelivr.net/npm/flv.js@1/dist/flv.min.js'
