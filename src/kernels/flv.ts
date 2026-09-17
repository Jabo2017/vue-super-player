import type { Kernel } from '../types'
import { FLV_JS_URL } from '../types'
import { loadScript } from './native'

declare global {
  interface Window {
    flvjs?: {
      isSupported(): boolean
      readonly Events: Record<string, string>
      readonly ErrorTypes: Record<string, string>
      new (): {
        attachMediaElement(video: HTMLMediaElement): void
        loadSource(url: string): void
        on(event: string, cb: (event: { type?: string; data?: unknown }) => void): void
        destroy(): void
        unload(): void
        play(): Promise<void>
        pause(): void
      }
    }
  }
}

/** flv.js 内核：flv（HTTP-FLV 直播 / 点播），依赖 MSE */
export const flvKernel: Kernel = {
  name: 'flv',
  canPlay(source) {
    return source.split(/[?#]/)[0].toLowerCase().endsWith('.flv')
  },
  async create(options) {
    await loadScript(options.flvJsUrl || FLV_JS_URL, () => !!window.flvjs)
    const flvjs = window.flvjs
    if (!flvjs?.isSupported()) {
      throw new Error('当前环境不支持 FLV 播放（需要 MSE）')
    }

    const { container, source, autoplay, muted, loop, poster, playsinline, events } = options
    const video = document.createElement('video')
    video.controls = true
    video.autoplay = autoplay
    video.muted = muted // 直播通常需要静音自动播
    video.loop = loop
    if (poster) video.poster = poster
    if (playsinline) {
      video.setAttribute('playsinline', '')
      video.setAttribute('webkit-playsinline', '')
    }
    video.style.cssText = 'width:100%;height:100%;display:block;background:#000'

    const player = new flvjs()
    player.attachMediaElement(video)
    player.loadSource(source)

    let ready = false
    player.on(flvjs.Events.MEDIA_INFO, () => {
      if (ready) return
      ready = true
      events.onReady()
    })
    player.on(flvjs.Events.ERROR, (data) => {
      events.onError(data)
    })
    video.addEventListener('play', () => events.onPlay())
    video.addEventListener('playing', () => {
      if (!ready) {
        ready = true
        events.onReady()
      }
      events.onPlaying()
    })
    video.addEventListener('pause', () => events.onPause())
    video.addEventListener('ended', () => events.onEnded())
    video.addEventListener('waiting', () => events.onWaiting())
    video.addEventListener('timeupdate', () => events.onTimeupdate(video.currentTime, video.duration || 0))

    container.appendChild(video)
    if (autoplay || options.isLive) void player.play().catch(() => events.onError('play() rejected'))

    return {
      play: () => void player.play().catch(() => events.onError('play() rejected')),
      pause: () => player.pause(),
      replay: () => {
        player.unload()
        player.loadSource(source)
        void player.play().catch(() => events.onError('play() rejected'))
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
        player.destroy()
        video.remove()
      },
    }
  },
}

/** flv.js CDN 懒加载（已并入 create 内部，导出仅供外部手动预热） */
export async function ensureFlvJs(customUrl?: string): Promise<void> {
  await loadScript(customUrl || FLV_JS_URL, () => !!window.flvjs)
}
