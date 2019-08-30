
const Store = app.Store
const dispatch = Store.dispatch
Page({
  data: {
    sourceImg: null,
    resultImg: null,
    resultImgSize: null,
    foo: ''
  },
  onLoad () {
    const updateDate = () => {
      const foo = Store.getState().myText
      this.setData({ foo })
    }

    updateDate();
    this.unsubStore = Store.subscribe(() => updateDate())
  },
  onUnload() {
    this.unsubStore()
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
