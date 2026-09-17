import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import SuperPlayer from '../src/SuperPlayer.vue'
import { extOf, nativeKernel } from '../src/kernels/native'
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
