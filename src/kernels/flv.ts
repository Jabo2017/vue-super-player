import type { Kernel } from '../types'
import { MPEGTS_JS_URL } from '../types'
import { loadScript } from './native'

/**
 * mpegts.js（flv.js 官方继任者，同作者 xqq）的全局类型声明。
 * 相比 flv.js 的差异：
 *   - 全局对象 `mpegts` 而非 `flvjs`
 *   - 工厂函数 `mpegts.createPlayer(dataSource, config)` 而非 `new flvjs()`
 *   - **没有 `loadSource()`**：播放地址在 createPlayer 时通过 MediaDataSource 传入
 *   - 媒体信息事件 `MEDIA_INFO` / 错误事件 `ERROR` 名称与 flv.js 一致
 */
declare global {
  interface Window {
    mpegts?: {
      isSupported(): boolean
      readonly Events: Record<string, string>
      readonly ErrorTypes: Record<string, string>
      readonly ErrorDetails: Record<string, string>
      createPlayer(
        mediaDataSource: { type: string; url: string; isLive?: boolean; cors?: boolean },
        config?: Record<string, unknown>,
      ): {
        attachMediaElement(video: HTMLMediaElement): void
        load(): void
        on(event: string, cb: (...args: unknown[]) => void): void
        off(event: string, cb?: (...args: unknown[]) => void): void
        destroy(): void
        unload(): void
        play(): Promise<void> | void
        pause(): void
      }
    }
  }
}

/** flv 内核：HTTP-FLV 直播 / 点播，底层使用 mpegts.js，依赖 MSE */
export const flvKernel: Kernel = {
  name: 'flv',
  canPlay(source) {
    return source.split(/[?#]/)[0].toLowerCase().endsWith('.flv')
  },
  async create(options) {
    await loadScript(options.mpegtsJsUrl || options.flvJsUrl || MPEGTS_JS_URL, () => !!window.mpegts)
    const mpegts = window.mpegts
    if (!mpegts?.isSupported()) {
      throw new Error('当前环境不支持 FLV 播放（需要 MSE）')
    }

    const { container, source, autoplay, muted, loop, poster, playsinline, isLive, events } = options
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

    // mpegts.js：地址在 createPlayer 时传入（无 loadSource）
    const player = mpegts.createPlayer(
      { type: 'flv', url: source, isLive, cors: true },
      { enableWorker: true, enableStashBuffer: !isLive },
    )
    player.attachMediaElement(video)
    player.load()

    let ready = false
    player.on(mpegts.Events.MEDIA_INFO, () => {
      if (ready) return
      ready = true
      events.onReady()
    })
    player.on(mpegts.Events.ERROR, (data) => {
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
    if (autoplay || isLive) void Promise.resolve(player.play()).catch(() => events.onError('play() rejected'))

    return {
      play: () => void Promise.resolve(player.play()).catch(() => events.onError('play() rejected')),
      pause: () => player.pause(),
      replay: () => {
        // mpegts.js 无 loadSource：unload + load 会复用 createPlayer 时传入的地址重新加载
        player.unload()
        player.load()
        void Promise.resolve(player.play()).catch(() => events.onError('play() rejected'))
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

/** mpegts.js CDN 懒加载（已并入 create 内部，导出仅供外部手动预热） */
export async function ensureMpegts(customUrl?: string): Promise<void> {
  await loadScript(customUrl || MPEGTS_JS_URL, () => !!window.mpegts)
}

/** @deprecated 请改用 `ensureMpegts` */
export const ensureFlvJs = ensureMpegts
