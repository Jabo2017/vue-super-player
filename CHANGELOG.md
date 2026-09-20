# Changelog

## 2.1.0 (2026-09-20)

FLV 内核底层从 flv.js 切换为 mpegts.js。

### 变更

- `flv` 内核底层库：flv.js → [mpegts.js](https://github.com/xqq/mpegts.js)。两者同作者（xqq）、API 基本一致，但 **flv.js 最后发布于 2021-09，已停止维护**，mpegts.js 是其官方继任者且至今仍在发版
- 直播场景默认 `enableStashBuffer: false` 降低延迟，并开启 `enableWorker` 多线程转封装

### 新增

- `mpegtsJsUrl` prop 与 `MPEGTS_JS_URL` / `ensureMpegts` 导出，可换成自托管 CDN 地址

### 废弃

- `flvJsUrl` prop 与 `FLV_JS_URL` / `ensureFlvJs` 导出保留为兼容别名（内核仍会读取），计划在 3.0 移除

## 2.0.0 (2026-09-17)

Vue 3 全量重写，多内核架构。

### 新增

- 内核抽象层 `Kernel` 接口：native / hls.js / flv.js / ali（复用 vue-aliplay-player v4）四个内置内核，支持自定义内核注入
- `auto` 内核自动检测（按播放地址扩展名），也可手动指定
- hls.js / flv.js CDN 懒加载（jsdelivr，可换自托管地址），主包 gzip ~4KB
- 统一事件模型：ready / play / playing / pause / ended / waiting / error / timeupdate / kernelchange
- 组件样式运行时自动注入，使用者无需 `import 'vue-super-player/dist/*.css'`
- TypeScript 全类型输出；vitest 单测（内核检测 + 编排行为）
- GitHub Actions CI + Pages demo

### 变更

- Vue 2.6 + vue-cli 4 → Vue 3.5 + Vite 7 + TypeScript
- 1.x 的四内核（ali/ck/tc/bd）收敛为 native/hls/flv/ali：ckplayer、百度 cyberplayer、TcPlayer 2.x 均为 flash 时代产物，不再维护；1.x 版本仍可从 npm 安装，源码见 [1.x 分支](https://github.com/Jabo2017/vue-super-player/tree/1.x)

### 移除

- Vue 2 支持（1.x 停维，历史版本 npm 可用）
- ckplayer / 百度 / TcPlayer 2.x 内核
