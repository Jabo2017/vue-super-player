import type { Kernel } from '../types'
import { HLS_JS_URL } from '../types'
import { createNativeKernelInstance, loadScript } from './native'

declare global {
  interface Window {
    Hls?: HlsJsStatic
  }
}

interface HlsJsStatic {
  isSupported(): boolean
  new (config?: Record<string, unknown>): HlsJsInstance
}

interface HlsJsInstance {
  loadSource(url: string): void
  attachMedia(video: HTMLMediaElement): void
  on(event: string, cb: (event: { data?: unknown; type?: string }) => void): void
  destroy(): void
  readonly ErrorTypes: Record<string, string>
  readonly Events: Record<string, string>
}

/**
 * hls.js 内核：m3u8。
 * 优先 hls.js（MSE），环境不支持时回退原生（Safari 11+ 原生支持 HLS）。
 */
export const hlsKernel: Kernel = {
  name: 'hls',
  canPlay(source) {
    return source.split(/[?#]/)[0].toLowerCase().endsWith('.m3u8')
  },
  async create(options) {
    await loadScript(options.hlsJsUrl || HLS_JS_URL, () => !!window.Hls)
    const Hls = window.Hls
    const canNativeHls =
      typeof document !== 'undefined' &&
      document.createElement('video').canPlayType('application/vnd.apple.mpegurl') !== ''

    if (!Hls?.isSupported() && !canNativeHls) {
      throw new Error('当前环境不支持 HLS 播放（无 MSE 且无原生 HLS）')
    }

    // 原生 HLS（Safari）或 MSE 不可用：直接用原生 video
    if (!Hls?.isSupported()) {
      return createNativeKernelInstance(options)
    }

    const video = createVideoEl(options)
    const hls = new Hls({ liveDurationInfinity: options.isLive })
    hls.loadSource(options.source)
    hls.attachMedia(video)
    bindHlsEvents(hls, options, video)
    options.container.appendChild(video)

    return {
      play: () => void video.play().catch(() => options.events.onError('play() rejected')),
      pause: () => video.pause(),
      replay: () => {
        video.currentTime = 0
        void video.play().catch(() => options.events.onError('play() rejected'))
      },
      seek: (t) => {
        video.currentTime = t
      },
      getCurrentTime: () => video.currentTime,
      getDuration: () => video.duration || 0,
      getVolume: () => video.volume,
      setVolume: (v) => {
        video.volume = Math.min(1, Math.max(0, v))
      },
      setSpeed: (s) => {
        video.playbackRate = s
      },
      getStatus: () => {
        if (video.ended) return 'ended'
        return video.paused ? 'paused' : 'playing'
      },
      dispose: () => {
        hls.destroy()
        video.remove()
      },
    }
  },
}

/** hls.js CDN 懒加载（已并入 create 内部，导出仅供外部手动预热） */
export async function ensureHlsJs(customUrl?: string): Promise<void> {
  await loadScript(customUrl || HLS_JS_URL, () => !!window.Hls)
}

function createVideoEl(options: Parameters<typeof createNativeKernelInstance>[0]): HTMLVideoElement {
  const { autoplay, muted, loop, poster, playsinline } = options
  const video = document.createElement('video')
  video.controls = true
  video.autoplay = autoplay
  video.muted = muted
  video.loop = loop
  if (poster) video.poster = poster
  if (playsinline) {
    video.setAttribute('playsinline', '')
    video.setAttribute('webkit-playsinline', '')
  }
  video.style.cssText = 'width:100%;height:100%;display:block;background:#000'
  return video
}

function bindHlsEvents(
  hls: HlsJsInstance,
  options: Parameters<typeof createNativeKernelInstance>[0],
  video: HTMLVideoElement,
): void {
  const { events } = options
  hls.on(hls.Events.MANIFEST_PARSED, () => {
    events.onReady()
    if (options.autoplay) void video.play().catch(() => events.onError('play() rejected'))
  })
  hls.on(hls.Events.ERROR, (data) => {
    if (!data || data.type !== hls.ErrorTypes.NETWORK_ERROR) return
    events.onError(data)
  })
  video.addEventListener('play', () => events.onPlay())
  video.addEventListener('playing', () => events.onPlaying())
  video.addEventListener('pause', () => events.onPause())
  video.addEventListener('ended', () => events.onEnded())
  video.addEventListener('waiting', () => events.onWaiting())
  video.addEventListener('timeupdate', () => events.onTimeupdate(video.currentTime, video.duration || 0))
}
