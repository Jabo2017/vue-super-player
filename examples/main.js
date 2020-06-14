import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

Vue.config.productionTip = false

// 导入组件库 全局
// import vueAliplayer from './../packages/index'
// Vue.use(vueAliplayer)



new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
