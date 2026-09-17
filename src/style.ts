import css from './style.css?inline'

const STYLE_ID = 'vue-super-player-style'

/**
 * 把组件自带样式注入到 document.head（仅浏览器环境，执行一次）。
 * 打包产物因此无需使用者手动 `import 'xxx.css'`。
 */
export function injectStyle(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID)) return
  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = css
  document.head.appendChild(style)
}

/** 移除已注入的样式（测试 / 卸载场景） */
export function removeStyle(): void {
  if (typeof document === 'undefined') return
  document.getElementById(STYLE_ID)?.remove()
}
