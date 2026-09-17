/**
 * Vite 的 `?inline` CSS 导入声明（项目 tsconfig 未引入 vite/client 类型，
 * 这里补上最小声明，使 `import css from './style.css?inline'` 通过类型检查）。
 */
declare module '*.css?inline' {
  const css: string
  export default css
}
