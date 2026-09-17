# Changelog

## 2.0.0 (2026-09-17)

Vue 3 全量重写，多内核架构。

### 新增

- 内核抽象层 `Kernel` 接口：native / hls.js / flv.js / ali（复用 vue-aliplay-player v4）四个内置内核，支持自定义内核注入
- `auto` 内核自动检测（按播放地址扩展名），也可手动指定
- hls.js / flv.js CDN 懒加载（jsdelivr，可换自托管地址），主包 gzip ~4KB
- 统一事件模型：ready / play / playing / pause / ended / waiting / error / timeupdate / kernelchange
- TypeScript 全类型输出；vitest 单测（内核检测 + 编排行为）
- GitHub Actions CI + Pages demo

### 变更

- Vue 2.6 + vue-cli 4 → Vue 3.5 + Vite 7 + TypeScript
- 1.x 的四内核（ali/ck/tc/bd）收敛为 native/hls/flv/ali：ckplayer、百度 cyberplayer、TcPlayer 2.x 均为 flash 时代产物，不再维护；1.x 版本仍可从 npm 安装

### 移除

- Vue 2 支持（1.x 停维，历史版本 npm 可用）
- ckplayer / 百度 / TcPlayer 2.x 内核
