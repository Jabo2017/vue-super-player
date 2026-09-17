import type { Kernel, KernelInstance } from '../types'
import { extOf } from './native'

declare global {
  interface Window {
    Aliplayer?: new (
      options: Record<string, unknown>,
      ready?: (player: KernelInstance) => void,
    ) => KernelInstance & {
      on(event: string, cb: () => void): void
      off(event: string, cb: () => void): void
    }
  }
}

/**
 * Aliplayer 内核：复用 vue-aliplay-player v4 的 SDK 加载器（动态 import，
 * 只有选中 ali 内核时才要求安装该 peer 依赖）。
 */
export const aliKernel: Kernel = {
  name: 'ali',
  canPlay(source) {
    // ali 内核不参与 auto 检测，只手动指定（vid+playauth 模式无 url 可判）
    void source
    return false
  },
  async create(options) {
    let mod: typeof import('vue-aliplay-player')
    try {
      // 可选 peer：用变量 + @vite-ignore 阻止构建期静态解析，未安装时运行时才报错（catch 转友好提示）
      const pkg = 'vue-aliplay-player'
      mod = await import(/* @vite-ignore */ pkg)
    } catch {
      throw new Error('使用 ali 内核需要先安装 vue-aliplay-player：npm i vue-aliplay-player')
    }

    const holder = document.createElement('div')
    holder.id = `vsp_ali_${Math.random().toString(36).slice(2)}`
    holder.style.cssText = 'width:100%;height:100%'
    options.container.appendChild(holder)

    await mod.loadAliplayerSdk(
      options.aliSdkUrl ?? mod.DEFAULT_SDK_JS,
      options.aliSdkCssUrl ?? mod.DEFAULT_SDK_CSS,
    )
    const Player = window.Aliplayer
    if (!Player) throw new Error('Aliplayer SDK 加载失败')

    const { events } = options
    const player = new Player(
      {
        id: holder.id,
        source: options.source,
        autoplay: options.autoplay,
        isLive: options.isLive,
        rePlay: options.loop,
        playsinline: options.playsinline,
        cover: options.poster,
        useH5Prism: true,
        width: '100%',
        height: '100%',
        ...(options.aliLicense ? { license: options.aliLicense } : {}),
      },
      () => events.onReady(),
    )

    const fwd = (evt: string, cb: () => void) => player.on(evt, cb)
    fwd('play', () => events.onPlay())
    fwd('playing', () => events.onPlaying())
    fwd('pause', () => events.onPause())
    fwd('ended', () => events.onEnded())
    fwd('error', () => events.onError('aliplayer error'))
    fwd('waiting', () => events.onWaiting())
    fwd('timeupdate', () => events.onTimeupdate(player.getCurrentTime() ?? 0, player.getDuration() ?? 0))

    return {
      play: () => player.play(),
      pause: () => player.pause(),
      replay: () => player.replay(),
      seek: (t) => player.seek(t),
      getCurrentTime: () => player.getCurrentTime() ?? 0,
      getDuration: () => player.getDuration() ?? 0,
      getVolume: () => player.getVolume() ?? 1,
      setVolume: (v) => player.setVolume(v),
      setSpeed: (s) => player.setSpeed(s),
      getStatus: () => player.getStatus() ?? 'ready',
      dispose: () => {
        try {
          player.dispose()
        } catch {
          /* 可能已销毁 */
        }
        holder.remove()
      },
    }
  },
}

/** ali 内核专属的扩展创建参数（由 SuperPlayer 透传） */
export interface AliKernelExtras {
  aliSdkUrl?: string
  aliSdkCssUrl?: string
  aliLicense?: Record<string, unknown>
}

/** ali 的 canPlay 恒 false，这里给出它支持的格式说明（文档用） */
export const aliSupportedExts = ['mp4', 'm3u8', 'flv', 'mp3']
void extOf
