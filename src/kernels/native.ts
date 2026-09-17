import type { Kernel, KernelCreateOptions, KernelInstance } from '../types'

/** 从 url 提取小写扩展名（取最后一段路径，去 query/hash） */
export function extOf(url: string): string {
  const clean = url.split(/[?#]/)[0]
  const seg = clean.slice(clean.lastIndexOf('/') + 1)
  const index = seg.lastIndexOf('.')
  return index > 0 ? seg.slice(index + 1).toLowerCase() : ''
}

/** 脚本懒加载（同 url 并发共享 Promise） */
const pending = new Map<string, Promise<void>>()

export function loadScript(url: string, test: () => boolean): Promise<void> {
  if (test()) return Promise.resolve()
  const cached = pending.get(url)
  if (cached) return cached
  const task = new Promise<void>((resolve, reject) => {
    const script = document.createElement('script')
    script.src = url
    script.charset = 'utf-8'
    script.addEventListener('load', () => resolve(), { once: true })
    script.addEventListener('error', () => reject(new Error(`脚本加载失败: ${url}`)), { once: true })
    document.head.appendChild(script)
  })
  pending.set(url, task)
  return task
}

/** 原生 <video> 内核：mp4 / webm 等，也是 hls/flv 内核的兜底播放层 */
export function createNativeKernelInstance(options: KernelCreateOptions): KernelInstance {
  const { container, source, autoplay, muted, loop, poster, playsinline, events } = options
  const video = document.createElement('video')
  video.src = source
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
  container.appendChild(video)

  const on = <K extends keyof HTMLMediaElementEventMap>(
    evt: K,
    fn: (e: HTMLMediaElementEventMap[K]) => void,
  ) => {
    video.addEventListener(evt, fn as EventListener)
  }
  const off = <K extends keyof HTMLMediaElementEventMap>(
    evt: K,
    fn: (e: HTMLMediaElementEventMap[K]) => void,
  ) => {
    video.removeEventListener(evt, fn as EventListener)
  }

  let firstPlay = true
  const handlePlay = () => {
    if (firstPlay) {
      firstPlay = false
      events.onReady()
    }
    events.onPlay()
  }
  on('play', handlePlay)
  on('playing', () => events.onPlaying())
  on('pause', () => events.onPause())
  on('ended', () => events.onEnded())
  on('error', () => events.onError(video.error ?? undefined))
  on('waiting', () => events.onWaiting())
  on('timeupdate', () => events.onTimeupdate(video.currentTime, video.duration || 0))
  on('loadedmetadata', () => {
    if (firstPlay && video.readyState >= 1) {
      firstPlay = false
      events.onReady()
    }
  })

  const status = (): 'playing' | 'paused' | 'ended' => {
    if (video.ended) return 'ended'
    if (video.paused) return 'paused'
    return 'playing'
  }

  return {
    play: () => void video.play().catch(() => events.onError('play() rejected')),
    pause: () => video.pause(),
    replay: () => {
      video.currentTime = 0
      void video.play().catch(() => events.onError('play() rejected'))
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
    getStatus: status,
    dispose: () => {
      video.pause()
      video.removeAttribute('src')
      video.load()
      video.remove()
      void off
    },
  }
}

/** 原生内核（mp4/webm） */
export const nativeKernel: Kernel = {
  name: 'native',
  canPlay(source) {
    const ext = extOf(source)
    return ['mp4', 'webm', 'mov', 'm4v'].includes(ext) || !ext
  },
  create(options) {
    return createNativeKernelInstance(options)
  },
}
