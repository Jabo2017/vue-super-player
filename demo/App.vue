<script setup lang="ts">
import { ref } from 'vue'
import SuperPlayer from '../src/index'
import type { Kernel } from '../src/types'

const SAMPLES = {
  'mp4 · native': 'https://player.alicdn.com/video/aliyunmedia.mp4',
  'm3u8 · hls.js': 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
} as const

type SampleKey = keyof typeof SAMPLES | 'ali 内核' | '自定义'

const current = ref<string>(SAMPLES['mp4 · native'])
const activeKey = ref<SampleKey>('mp4 · native')
const kernel = ref<'auto' | 'native' | 'hls' | 'flv' | 'ali'>('auto')
const customUrl = ref('')
const autoplay = ref(false)
const isLive = ref(false)

const playerRef = ref<InstanceType<typeof SuperPlayer> | null>(null)
const activeKernel = ref('')
const logs = ref<string[]>([])

function log(line: string) {
  logs.value.unshift(`${new Date().toLocaleTimeString()}  ${line}`)
  if (logs.value.length > 30) logs.value.pop()
}
function onEvent(name: string) {
  return (...args: unknown[]) => {
    const t = playerRef.value?.getCurrentTime() ?? 0
    log(args.length && typeof args[0] === 'number' ? `${name}（t=${(args[0] as number).toFixed(1)}s）` : name)
    void t
  }
}

function switchSample(key: SampleKey) {
  activeKey.value = key
  if (key === 'ali 内核') {
    kernel.value = 'ali'
    current.value = SAMPLES['mp4 · native']
  } else if (key === '自定义') {
    if (!customUrl.value) return
    kernel.value = 'auto'
    isLive.value = /\.flv$/.test(customUrl.value.split('?')[0])
    current.value = customUrl.value
  } else {
    kernel.value = 'auto'
    isLive.value = false
    current.value = SAMPLES[key]
  }
}

/** 自定义内核注入示例：包一层 native 并改名，证明内核可插拔 */
const spyKernel: Record<string, Kernel> = {
  probe: {
    name: 'probe',
    canPlay: () => false,
    async create(options) {
      log('[自定义内核 probe] create()')
      const m = await import('../src/kernels/native')
      return m.createNativeKernelInstance(options)
    },
  },
}
</script>

<template>
  <div class="page">
    <header>
      <h1>vue-super-player <span class="ver">v2 · 多内核</span></h1>
      <p class="sub">native / hls.js / mpegts.js / ali 可插拔内核 · 按格式自动检测 · CDN 懒加载</p>
    </header>

    <main>
      <section class="stage">
        <div class="toolbar">
          <button
            v-for="key in (['mp4 · native', 'm3u8 · hls.js', 'ali 内核', '自定义'] as SampleKey[])"
            :key="key"
            :class="{ active: activeKey === key }"
            @click="switchSample(key)"
          >
            {{ key }}
          </button>
          <select v-model="kernel" title="内核">
            <option value="auto">内核：auto</option>
            <option value="native">内核：native</option>
            <option value="hls">内核：hls</option>
            <option value="flv">内核：flv</option>
            <option value="ali">内核：ali</option>
          </select>
        </div>

        <div class="player-box">
          <SuperPlayer
            ref="playerRef"
            :source="current"
            :kernel="kernel"
            :autoplay="autoplay"
            :is-live="isLive"
            :kernels="spyKernel"
            play-style="width:100%;height:100%;aspect-ratio:16/9"
            @ready="onEvent('ready')"
            @play="onEvent('play')"
            @playing="onEvent('playing')"
            @pause="onEvent('pause')"
            @ended="onEvent('ended')"
            @error="(e) => log(`error ${JSON.stringify(e ?? '')}`)"
            @waiting="onEvent('waiting')"
            @timeupdate="(t) => onEvent('timeupdate')(t)"
            @kernelchange="(n) => { activeKernel = n; log(`内核切换 → ${n}`) }"
          />
        </div>

        <div class="meta">
          当前内核：<b>{{ activeKernel || '—' }}</b>
        </div>

        <div class="controls">
          <button @click="playerRef?.play()">播放</button>
          <button @click="playerRef?.pause()">暂停</button>
          <button @click="playerRef?.replay()">重播</button>
          <button @click="playerRef?.seek(30)">跳到 30s</button>
          <button @click="playerRef?.setVolume(0.5)">音量 50%</button>
          <label><input v-model="autoplay" type="checkbox" /> autoplay</label>
        </div>

        <form class="custom" @submit.prevent="switchSample('自定义')">
          <input v-model="customUrl" type="url" placeholder="输入视频地址（mp4 / m3u8 / flv 直播）" />
          <button type="submit">加载</button>
        </form>
      </section>

      <aside class="panel">
        <h2>事件日志</h2>
        <ul>
          <li v-for="(item, i) in logs" :key="i">{{ item }}</li>
          <li v-if="!logs.length" class="empty">等待事件…</li>
        </ul>
      </aside>
    </main>

    <footer>
      <a href="https://github.com/Jabo2017/vue-super-player" target="_blank" rel="noopener">GitHub</a>
      ·
      <a href="https://www.npmjs.com/package/vue-super-player" target="_blank" rel="noopener">npm</a>
      · ali 内核需另行安装 vue-aliplay-player
    </footer>
  </div>
</template>

<style>
* {
  margin: 0;
  box-sizing: border-box;
}
body {
  background: #101418;
  color: #e8eaed;
  font-family: 'PingFang SC', 'Microsoft YaHei', system-ui, sans-serif;
}
.page {
  max-width: 1180px;
  margin: 0 auto;
  padding: 24px 20px 40px;
}
header h1 {
  font-size: 22px;
  font-weight: 600;
}
.ver {
  font-size: 13px;
  color: #82aaff;
  border: 1px solid #3a5f9e;
  border-radius: 4px;
  padding: 2px 8px;
  margin-left: 8px;
  vertical-align: 2px;
}
.sub {
  color: #8a9199;
  font-size: 13px;
  margin-top: 6px;
}
main {
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 16px;
  margin-top: 18px;
}
@media (max-width: 860px) {
  main {
    grid-template-columns: 1fr;
  }
}
.toolbar {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 10px;
}
.toolbar button,
.controls button,
.custom button {
  background: #1c232b;
  color: #e8eaed;
  border: 1px solid #333c46;
  border-radius: 6px;
  padding: 6px 14px;
  font-size: 13px;
  cursor: pointer;
}
.toolbar button.active {
  border-color: #82aaff;
  color: #82aaff;
}
.toolbar select {
  margin-left: auto;
  background: #1c232b;
  color: #e8eaed;
  border: 1px solid #333c46;
  border-radius: 6px;
  padding: 6px 10px;
  font-size: 13px;
}
.player-box :deep(.vsp-root) {
  aspect-ratio: 16/9;
}
.controls {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  align-items: center;
  margin-top: 12px;
  font-size: 13px;
}
.controls label {
  color: #8a9199;
  margin-left: 4px;
}
.meta {
  margin-top: 10px;
  font-size: 13px;
  color: #8a9199;
}
.meta b {
  color: #82aaff;
}
.custom {
  display: flex;
  gap: 8px;
  margin-top: 12px;
}
.custom input {
  flex: 1;
  background: #1c232b;
  border: 1px solid #333c46;
  border-radius: 6px;
  color: #e8eaed;
  padding: 6px 12px;
  font-size: 13px;
}
.panel {
  background: #151b22;
  border: 1px solid #232c35;
  border-radius: 8px;
  padding: 14px;
  max-height: 520px;
  overflow: auto;
}
.panel h2 {
  font-size: 14px;
  color: #8a9199;
  font-weight: 500;
  margin-bottom: 10px;
}
.panel ul {
  list-style: none;
  padding: 0;
  font-size: 12px;
  line-height: 1.9;
  color: #b9c1c9;
  font-family: Consolas, monospace;
}
.panel .empty {
  color: #566068;
}
footer {
  margin-top: 24px;
  font-size: 13px;
  color: #8a9199;
}
footer a {
  color: #82aaff;
  text-decoration: none;
}
</style>
