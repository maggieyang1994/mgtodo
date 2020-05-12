//app.ts
import store from './store/index.js'
App({
  store,
  onLaunch() {
    console.log('...............', wx.cloud)
    wx.cloud.init({
      traceUser: true,
      env: 'main-li3wm'
    })
  },
  globalData: {}
})