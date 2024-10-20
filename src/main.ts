import './global.scss'

import {createApp} from 'vue'
import ElementPlus from 'element-plus'
import zhCn from 'element-plus/dist/locale/zh-cn'

import App from './App.vue'

let app = createApp(App)

app.use(ElementPlus, {
  locale: zhCn
})

app.mount('#app')
  .$nextTick(() => {
    postMessage({payload: 'removeLoading'}, '*')
  })
  .then()
