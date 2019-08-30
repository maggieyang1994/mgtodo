// components/audio.js
var self;
let recordManager = wx.getRecorderManager();
recordManager.onStart(function(){
  this.setData({
    isRecording: true
  })
})
recordManager.onStart(function(){
  this.setData({
    isRecording: false
  })
})
Component({
  /**
   * 组件的属性列表
   */
  properties: {

  },
  created(){
    self = this
  },

  /**
   * 组件的初始数据
   */
  data: {
    isRecording: false
  },

  /**
   * 组件的方法列表
   */
  methods: {
    touchstart(){
      recordManager.start()
    },
    touchend(){
      recordManager.stop()
    }
  }
})
