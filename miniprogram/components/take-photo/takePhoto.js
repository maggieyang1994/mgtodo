// components/takePhoto.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {

  },

  /**
   * 组件的初始数据
   */
  data: {
   flash: false
  },

  /**
   * 组件的方法列表
   */
  methods: {
    chooseImage() {
      wx.chooseImage({
        count: 1,
       sourceType: ['album'],
        success: (res) => {
          // tempFilePath可以作为img标签的src属性显示图片
          const tempFilePaths = res.tempFilePaths[0];
          this.triggerEvent("takePhoto", { path: tempFilePaths })
        }
      })
    },
    handerflash() {
      this.setData({
        flash: !this.data.flash
      })
    },
    takePhoto() {
      let cameraContext = wx.createCameraContext();
      cameraContext.takePhoto({
        success: (res) => {
          const tempFilePaths = res.tempImagePath;
          this.triggerEvent("takePhoto", { path: tempFilePaths })
        }
      })
    }
  }
})
