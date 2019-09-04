
// const Store = app.Store
// const dispatch = Store.dispatch
Page({
  data: {
    sourceImg: null,
    resultImg: null,
    resultImgSize: null
  },
  onLoad () {
    
  },
  onUnload() {
   
  },
  handlerTakePhoto(e) {
    this.setData({
      sourceImg: e.detail.path
    })
  },
  handerEditPhoto(e) {
    this.setData({
      resultImg: e.detail.path,
      resultImgSize: { width: e.detail.width, height: e.detail.height }
    })
  }

})
