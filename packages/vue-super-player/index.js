import superPlayer from './src/player.vue'

 /**
  * 预览做全局组件使用，按需加载组件可以不需要这个install
  */
superPlayer.install = function(vue) { 
	Vue.component(superPlayer.name, superPlayer)
}
export default superPlayer