<template>
  <div ref="boxRef" class="vsp-root" :style="playStyle" />
</template>

<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref, shallowRef, watch } from 'vue'
import type { Kernel, KernelCreateOptions, KernelEvents, KernelInstance } from './types'
import { nativeKernel } from './kernels/native'
import { hlsKernel } from './kernels/hls'
import { flvKernel } from './kernels/flv'
import { aliKernel } from './kernels/ali'
import { extOf } from './kernels/native'

const props = withDefaults(
  defineProps<{
    /** 播放地址；变化时自动切换内核并重建 */
    source: string
    /** 内核：'auto' 按扩展名检测，或指定 'native' / 'hls' / 'flv' / 'ali' / 自定义内核名 */
    kernel?: string
    autoplay?: boolean
    muted?: boolean
    loop?: boolean
    poster?: string
    isLive?: boolean
    playsinline?: boolean
    /** 组件根元素内联样式（常用 width/height/aspect-ratio） */
    playStyle?: string
    /** 自定义/注入内核（测试或扩展），与内置内核合并，同名覆盖 */
    kernels?: Record<string, Kernel>
    hlsJsUrl?: string
    flvJsUrl?: string
    aliSdkUrl?: string
    aliSdkCssUrl?: string
    /** Aliplayer License 配置（SDK ≥2.28 必需） */
    aliLicense?: Record<string, unknown>
  }>(),
  {
    kernel: 'auto',
    autoplay: false,
    muted: false,
    loop: false,
    poster: '',
    isLive: false,
    playsinline: true,
    playStyle: '',
    kernels: () => ({}),
    hlsJsUrl: undefined,
    flvJsUrl: undefined,
    aliSdkUrl: undefined,
    aliSdkCssUrl: undefined,
    aliLicense: undefined,
  },
)

const emit = defineEmits<{
  (e: 'ready'): void
  (e: 'play'): void
  (e: 'playing'): void
  (e: 'pause'): void
  (e: 'ended'): void
  (e: 'error', err?: unknown): void
  (e: 'timeupdate', currentTime: number, duration: number): void
  (e: 'waiting'): void
  (e: 'kernelchange', name: string): void
}>()

const BUILTIN: Record<string, Kernel> = {
  native: nativeKernel,
  hls: hlsKernel,
  flv: flvKernel,
  ali: aliKernel,
}

const boxRef = ref<HTMLDivElement | null>(null)
const instance = shallowRef<KernelInstance | null>(null)
const kernelName = ref<string>('')
let initSeq = 0

function registry(): Record<string, Kernel> {
  return { ...BUILTIN, ...props.kernels }
}

/** auto 模式按扩展名检测内核 */
function detectKernelName(source: string): string {
  const ext = extOf(source)
  if (ext === 'm3u8') return 'hls'
  if (ext === 'flv') return 'flv'
  return 'native'
}

async function init(source?: string): Promise<void> {
  dispose()
  const seq = ++initSeq

  const src = source ?? props.source
  if (!src) return

  const reg = registry()
  const name = props.kernel === 'auto' ? detectKernelName(src) : props.kernel
  const kernel = reg[name]
  if (!kernel) {
    emit('error', new Error(`未知内核: ${name}（可用: ${Object.keys(reg).join(', ')}）`))
    return
  }
  kernelName.value = name
  emit('kernelchange', name)

  await nextTick()
  if (seq !== initSeq || !boxRef.value) return

  const handlers: KernelEvents = {
    onReady: () => seq === initSeq && emit('ready'),
    onPlay: () => seq === initSeq && emit('play'),
    onPlaying: () => seq === initSeq && emit('playing'),
    onPause: () => seq === initSeq && emit('pause'),
    onEnded: () => seq === initSeq && emit('ended'),
    onError: (err) => seq === initSeq && emit('error', err),
    onTimeupdate: (t, d) => seq === initSeq && emit('timeupdate', t, d),
    onWaiting: () => seq === initSeq && emit('waiting'),
  }
  const options: KernelCreateOptions = {
    container: boxRef.value,
    source: src,
    autoplay: props.autoplay,
    muted: props.muted,
    loop: props.loop,
    poster: props.poster,
    isLive: props.isLive,
    playsinline: props.playsinline,
    events: handlers,
    hlsJsUrl: props.hlsJsUrl,
    flvJsUrl: props.flvJsUrl,
    aliSdkUrl: props.aliSdkUrl,
    aliSdkCssUrl: props.aliSdkCssUrl,
    aliLicense: props.aliLicense,
  }

  try {
    const inst = await kernel.create(options)
    if (seq !== initSeq) {
      // 初始化期间已被替换/卸载
      inst.dispose()
      return
    }
    instance.value = inst
  } catch (err) {
    if (seq === initSeq) emit('error', err)
  }
}

function dispose(): void {
  initSeq++
  instance.value?.dispose()
  instance.value = null
}

// ---------- 对外方法 ----------
function play(): void {
  instance.value?.play()
}
function pause(): void {
  instance.value?.pause()
}
function replay(): void {
  instance.value?.replay()
}
function seek(time: number): void {
  instance.value?.seek(time)
}
function getCurrentTime(): number {
  return instance.value?.getCurrentTime() ?? 0
}
function getDuration(): number {
  return instance.value?.getDuration() ?? 0
}
function getVolume(): number {
  return instance.value?.getVolume() ?? 1
}
function setVolume(vol: number): void {
  instance.value?.setVolume(vol)
}
function setSpeed(speed: number): void {
  instance.value?.setSpeed(speed)
}
function getStatus(): string {
  return instance.value?.getStatus() ?? 'idle'
}

defineExpose({
  play,
  pause,
  replay,
  seek,
  getCurrentTime,
  getDuration,
  getVolume,
  setVolume,
  setSpeed,
  getStatus,
  dispose,
})

watch(
  () => [props.source, props.kernel],
  ([nextSource], [prevSource]) => {
    if (nextSource !== prevSource) void init(nextSource as string)
  },
)

onMounted(() => {
  void init()
})

onBeforeUnmount(() => {
  dispose()
})
</script>
