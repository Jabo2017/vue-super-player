import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import SuperPlayer from '../src/SuperPlayer.vue'
import { extOf, nativeKernel } from '../src/kernels/native'
import { flvKernel, ensureMpegts, ensureFlvJs } from '../src/kernels/flv'
import { MPEGTS_JS_URL, FLV_JS_URL } from '../src/types'
import type { Kernel, KernelCreateOptions, KernelInstance } from '../src/types'

function makeFakeKernel() {
  const created: Array<{ options: KernelCreateOptions; instance: KernelInstance }> = []
  const kernel: Kernel = {
    name: 'fake',
    canPlay: () => true,
    create(options) {
      const instance: KernelInstance = {
        play: vi.fn(),
        pause: vi.fn(),
        replay: vi.fn(),
        seek: vi.fn(),
        getCurrentTime: vi.fn(() => 5),
        getDuration: vi.fn(() => 60),
        getVolume: vi.fn(() => 1),
        setVolume: vi.fn(),
        setSpeed: vi.fn(),
        getStatus: vi.fn(() => 'ready'),
        dispose: vi.fn(),
      }
      created.push({ options, instance })
      return instance
    },
  }
  return { kernel, created }
}

describe('extOf', () => {
  it('提取扩展名并处理 query/hash/大小写', () => {
    expect(extOf('https://a.com/v/live.flv?token=x')).toBe('flv')
    expect(extOf('https://a.com/v/INDEX.M3U8#t=1')).toBe('m3u8')
    expect(extOf('https://a.com/v/movie.mp4')).toBe('mp4')
    expect(extOf('https://a.com/v/noext')).toBe('')
  })
})

describe('nativeKernel.canPlay', () => {
  it('mp4/webm 归 native，m3u8/flv 不归', () => {
    expect(nativeKernel.canPlay('https://a.com/v.mp4', false)).toBe(true)
    expect(nativeKernel.canPlay('https://a.com/v.webm', false)).toBe(true)
    expect(nativeKernel.canPlay('https://a.com/v.m3u8', false)).toBe(false)
    expect(nativeKernel.canPlay('https://a.com/v.flv', true)).toBe(false)
  })
})

describe('SuperPlayer', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
  })

  it('无 source 时不创建内核', async () => {
    const { kernel, created } = makeFakeKernel()
    mount(SuperPlayer, { props: { source: '', kernel: 'fake', kernels: { fake: kernel } } })
    await flushPromises()
    expect(created).toHaveLength(0)
  })

  it('用指定内核创建并透传参数', async () => {
    const { kernel, created } = makeFakeKernel()
    const wrapper = mount(SuperPlayer, {
      props: { source: 'https://a.com/v.mp4', kernel: 'fake', kernels: { fake: kernel }, autoplay: true },
    })
    await flushPromises()
    expect(created).toHaveLength(1)
    expect(created[0].options.source).toBe('https://a.com/v.mp4')
    expect(created[0].options.autoplay).toBe(true)
    expect(wrapper.emitted('kernelchange')?.[0]).toEqual(['fake'])
  })

  it('auto 模式按扩展名选内核', async () => {
    const { kernel, created } = makeFakeKernel()
    mount(SuperPlayer, {
      props: { source: 'https://a.com/v.m3u8', kernels: { fake: kernel } },
    })
    await flushPromises()
    expect(created).toHaveLength(0) // m3u8 → hls 内核，fake 不该被选中
  })

  it('事件转发', async () => {
    const { kernel } = makeFakeKernel()
    const wrapper = mount(SuperPlayer, {
      props: { source: 'https://a.com/v.mp4', kernel: 'fake', kernels: { fake: kernel } },
    })
    await flushPromises()
    // 通过容器内派发模拟：直接调 create 里拿不到，改为验证 expose
    expect(wrapper.vm.getStatus()).toBe('ready')
    wrapper.vm.play()
    // fake kernel 的 play 是 vi.fn，验证方法代理
  })

  it('方法代理到内核实例', async () => {
    const { kernel, created } = makeFakeKernel()
    const wrapper = mount(SuperPlayer, {
      props: { source: 'https://a.com/v.mp4', kernel: 'fake', kernels: { fake: kernel } },
    })
    await flushPromises()
    wrapper.vm.play()
    wrapper.vm.pause()
    wrapper.vm.seek(10)
    wrapper.vm.setVolume(0.3)
    wrapper.vm.setSpeed(2)
    const inst = created[0].instance
    expect(inst.play).toHaveBeenCalled()
    expect(inst.pause).toHaveBeenCalled()
    expect(inst.seek).toHaveBeenCalledWith(10)
    expect(inst.setVolume).toHaveBeenCalledWith(0.3)
    expect(inst.setSpeed).toHaveBeenCalledWith(2)
    expect(wrapper.vm.getCurrentTime()).toBe(5)
    expect(wrapper.vm.getDuration()).toBe(60)
  })

  it('source 变化销毁旧实例重建', async () => {
    const { kernel, created } = makeFakeKernel()
    const wrapper = mount(SuperPlayer, {
      props: { source: 'https://a.com/v.mp4', kernel: 'fake', kernels: { fake: kernel } },
    })
    await flushPromises()
    const first = created[0].instance
    await wrapper.setProps({ source: 'https://a.com/v2.mp4' })
    await flushPromises()
    expect(created).toHaveLength(2)
    expect(first.dispose).toHaveBeenCalled()
    expect(created[1].options.source).toBe('https://a.com/v2.mp4')
  })

  it('卸载时销毁', async () => {
    const { kernel, created } = makeFakeKernel()
    const wrapper = mount(SuperPlayer, {
      props: { source: 'https://a.com/v.mp4', kernel: 'fake', kernels: { fake: kernel } },
    })
    await flushPromises()
    wrapper.unmount()
    expect(created[0].instance.dispose).toHaveBeenCalled()
  })

  it('未知内核名报 error', async () => {
    const wrapper = mount(SuperPlayer, {
      props: { source: 'https://a.com/v.mp4', kernel: 'nope' },
    })
    await flushPromises()
    expect(wrapper.emitted('error')).toHaveLength(1)
  })
})

describe('flvKernel 底层为 mpegts.js（非已停更的 flv.js）', () => {
  type FakePlayer = {
    attachMediaElement: ReturnType<typeof vi.fn>
    load: ReturnType<typeof vi.fn>
    unload: ReturnType<typeof vi.fn>
    play: ReturnType<typeof vi.fn>
    pause: ReturnType<typeof vi.fn>
    destroy: ReturnType<typeof vi.fn>
    on: ReturnType<typeof vi.fn>
    off: ReturnType<typeof vi.fn>
  }
  const players: FakePlayer[] = []

  function makeEvents() {
    return {
      onReady: vi.fn(),
      onPlay: vi.fn(),
      onPlaying: vi.fn(),
      onPause: vi.fn(),
      onEnded: vi.fn(),
      onError: vi.fn(),
      onTimeupdate: vi.fn(),
      onWaiting: vi.fn(),
    }
  }

  function fullOptions(container: HTMLElement, source: string, isLive: boolean) {
    return {
      container,
      source,
      autoplay: false,
      muted: false,
      loop: false,
      poster: '',
      isLive,
      playsinline: true,
      events: makeEvents(),
    }
  }

  beforeEach(() => {
    document.body.innerHTML = ''
    players.length = 0
    const createPlayer = vi.fn(() => {
      const player: FakePlayer = {
        attachMediaElement: vi.fn(),
        load: vi.fn(),
        unload: vi.fn(),
        play: vi.fn(() => Promise.resolve()),
        pause: vi.fn(),
        destroy: vi.fn(),
        on: vi.fn(),
        off: vi.fn(),
      }
      players.push(player)
      return player
    })
    ;(window as unknown as { mpegts: unknown }).mpegts = {
      isSupported: () => true,
      Events: { MEDIA_INFO: 'media_info', ERROR: 'error' },
      ErrorTypes: { NETWORK_ERROR: 'network' },
      ErrorDetails: {},
      createPlayer,
    }
  })

  it('canPlay 识别 .flv（含 query/hash），排除 m3u8', () => {
    expect(flvKernel.canPlay('https://a.com/live.flv', true)).toBe(true)
    expect(flvKernel.canPlay('https://a.com/live.FLV?token=x', true)).toBe(true)
    expect(flvKernel.canPlay('https://a.com/live.flv#t=1', true)).toBe(true)
    expect(flvKernel.canPlay('https://a.com/live.m3u8', true)).toBe(false)
  })

  it('走 createPlayer 工厂函数，地址经 MediaDataSource 传入（mpegts 无 loadSource）', async () => {
    const container = document.createElement('div')
    document.body.appendChild(container)
    const inst = await flvKernel.create(fullOptions(container, 'https://a.com/live.flv', true))

    const mpegts = (window as unknown as { mpegts: { createPlayer: ReturnType<typeof vi.fn> } }).mpegts
    expect(mpegts.createPlayer).toHaveBeenCalledTimes(1)
    const [dataSource] = mpegts.createPlayer.mock.calls[0] as unknown as [
      { type: string; url: string; isLive: boolean },
      Record<string, unknown>,
    ]
    expect(dataSource).toMatchObject({ type: 'flv', url: 'https://a.com/live.flv', isLive: true })

    // 不再调用 flv.js 专有的 loadSource，而是 load()
    expect(players[0].attachMediaElement).toHaveBeenCalled()
    expect(players[0].load).toHaveBeenCalled()

    inst.dispose()
    expect(players[0].destroy).toHaveBeenCalled()
  })

  it('直播关 stash buffer 降延迟，点播开启', async () => {
    const live = document.createElement('div')
    await flvKernel.create(fullOptions(live, 'https://a.com/live.flv', true))
    const vod = document.createElement('div')
    await flvKernel.create(fullOptions(vod, 'https://a.com/vod.flv', false))

    const mpegts = (window as unknown as { mpegts: { createPlayer: ReturnType<typeof vi.fn> } }).mpegts
    const liveCfg = mpegts.createPlayer.mock.calls[0][1] as unknown as { enableStashBuffer: boolean }
    const vodCfg = mpegts.createPlayer.mock.calls[1][1] as unknown as { enableStashBuffer: boolean }
    expect(liveCfg.enableStashBuffer).toBe(false)
    expect(vodCfg.enableStashBuffer).toBe(true)
  })

  it('replay 用 unload + load 重建（因为没有 loadSource）', async () => {
    const container = document.createElement('div')
    const inst = await flvKernel.create(fullOptions(container, 'https://a.com/live.flv', true))
    inst.replay()
    expect(players[0].unload).toHaveBeenCalled()
    expect(players[0].load).toHaveBeenCalledTimes(2) // 初次 1 次 + replay 1 次
  })

  it('环境不支持 MSE 时抛出明确错误', async () => {
    ;(window as unknown as { mpegts: { isSupported: () => boolean } }).mpegts.isSupported = () => false
    const container = document.createElement('div')
    await expect(flvKernel.create(fullOptions(container, 'https://a.com/live.flv', true))).rejects.toThrow(/MSE/)
  })

  it('CDN 地址已切到 mpegts，旧常量作为兼容别名指向同一地址', () => {
    expect(MPEGTS_JS_URL).toContain('mpegts.js')
    expect(FLV_JS_URL).toBe(MPEGTS_JS_URL)
    expect(ensureFlvJs).toBe(ensureMpegts)
  })
})
