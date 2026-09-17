/**
 * vue-aliplay-player（可选 peer 依赖）的类型垫片。
 * 该包以动态 import 方式在 ali 内核创建时才加载；
 * 真实类型以 vue-aliplay-player@4 的 d.ts 为准，此处仅声明本仓库用到的 API。
 */
declare module 'vue-aliplay-player' {
  export const DEFAULT_SDK_JS: string
  export const DEFAULT_SDK_CSS: string
  export function loadAliplayerSdk(jsUrl: string, cssUrl: string): Promise<void>
  const VueAliPlayer: unknown
  export default VueAliPlayer
}
