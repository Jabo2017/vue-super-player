# vue-super-player

**多内核视频播放器组件（Vue 3 + TypeScript）**：原生 / hls.js / flv.js / Aliplayer 四个内核可插拔，按播放地址自动检测内核，统一 props / 事件 / 方法。

> Vue 2 时代的 [1.x 版本](https://github.com/Jabo2017/vue-super-player/tree/1.x)（`npm i vue-super-player@1`）已停止维护。v2 是全新重写。

## 在线演示

https://jabo2017.github.io/vue-super-player/

## 为什么是多内核

没有单一内核能同时优雅覆盖所有场景：

| 场景 | 内核 | 说明 |
|---|---|---|
| mp4 / webm 点播 | `native` | 原生 video，零依赖 |
| m3u8 点播/直播 | `hls` | hls.js（Safari 自动回退原生 HLS） |
| HTTP-FLV 直播 | `flv` | flv.js（需 MSE） |
| 阿里云 vid+playauth / 私有加密流 | `ali` | 复用 [vue-aliplay-player](https://github.com/Jabo2017/vue-aliplay-player)（可选安装） |

hls.js / flv.js 均为 **CDN 懒加载**：用到哪个内核才加载哪个脚本，主包 gzip 仅 ~4KB。

## 安装

```bash
npm install vue-super-player
```

`vue`（^3.2）为 peer dependency；使用 `ali` 内核需另装 `vue-aliplay-player`（可选 peer）。

组件自带样式（`.vsp-root` 容器）在引入时自动注入，**无需额外 `import` CSS 文件**。

## 快速上手

```vue
<script setup lang="ts">
import { ref } from 'vue'
import SuperPlayer from 'vue-super-player'

const source = ref('https://example.com/live.m3u8') // 自动选中 hls 内核
</script>

<template>
  <SuperPlayer
    :source="source"
    is-live
    play-style="width:100%;aspect-ratio:16/9"
    @error="(e) => console.error(e)"
  />
</template>
```

手动指定内核（如阿里云加密流）：

```vue
<SuperPlayer :source="src" kernel="ali" :ali-license="license" />
```

自定义内核（实现 `Kernel` 接口注入即可）：

```ts
const myKernel: Kernel = {
  name: 'my-kernel',
  canPlay: (src) => src.endsWith('.ext'),
  create: (options) => myPlayerInstance,
}
// <SuperPlayer :kernels="{ 'my-kernel': myKernel }" kernel="my-kernel" />
```

## Props

| Prop | 类型 | 默认 | 说明 |
|---|---|---|---|
| `source` | `string` | 必填 | 播放地址，变化时自动重建 |
| `kernel` | `string` | `'auto'` | `'auto'` 按扩展名检测；或 `native` / `hls` / `flv` / `ali` / 自定义内核名 |
| `autoplay` | `boolean` | `false` | 自动播放（受浏览器策略限制，常配合 `muted`） |
| `muted` | `boolean` | `false` | 静音 |
| `loop` | `boolean` | `false` | 循环 |
| `poster` | `string` | `''` | 封面 |
| `isLive` | `boolean` | `false` | 直播模式（flv/ali 内核行为不同） |
| `playsinline` | `boolean` | `true` | 移动端内联播放 |
| `kernels` | `Record<string, Kernel>` | `{}` | 注入自定义内核 |
| `hlsJsUrl` / `flvJsUrl` | `string` | jsdelivr | hls.js / flv.js CDN 地址，可换自托管 |
| `aliSdkUrl` / `aliSdkCssUrl` / `aliLicense` | — | 2.27.1 | Aliplayer SDK 与 License 配置，见 [vue-aliplay-player README](https://github.com/Jabo2017/vue-aliplay-player#license-说明) |

## 事件

`ready` `play` `playing` `pause` `ended` `waiting` `error(err?)` `timeupdate(currentTime, duration)` `kernelchange(name)`

## 暴露方法

`play` `pause` `replay` `seek(t)` `getCurrentTime` `getDuration` `getVolume` `setVolume(v)` `setSpeed(s)` `getStatus` `dispose`

## 本地开发

```bash
pnpm install
pnpm dev          # demo 页
pnpm typecheck    # vue-tsc
pnpm test         # vitest
pnpm build        # 库产物（ES + UMD + d.ts）
pnpm build:demo   # Pages 演示页
```

## License

[MIT](./LICENSE)
