// miniprogram/pages/audio/audio.js
// const app = getApp()
import { getBaiduAuth } from '../../utils/getBaiduAuth.js'
var self;
let appId = '5d5caf64';
let recordManager = wx.getRecorderManager();
let audioManager = wx.createInnerAudioContext();
let fileManager = wx.getFileSystemManager()
audioManager.onPlay(function () {
  console.log("onPlay");
  self.setData({
    isPlaying: true
  })
})
audioManager.onEnded(function () {
  console.log("onEnded");
  // 监听录音自动 结束
  self.setData({
    isPlaying: false
  })
})
audioManager.onPause(function () {
  console.log("onEnded");
  // 监听录音自动 暂停
  self.setData({
    isPlaying: false
  })
})
audioManager.onStop(function () {
  console.log("stoped")
  self.setData({
    isPlaying: false
  })
})
recordManager.onStart(async function () {
  console.log('start recording')
  // app.store.dispatch(showAudio(true));

  self.setData({
    isRecording: true
  })
  if (!self.data.isLastStoped) self.touchend()
})
recordManager.onStop(
  async function (res) {
    console.log('end recording')
    // app.store.dispatch(showAudio(false));
    audioManager.src = res.tempFilePath
    self.setData({
      isRecording: false,
      isLastStoped: true,
      canPlayAudio: true,
      showLoading: true
    });
    let [auth, err] = await getBaiduAuth('https://openapi.baidu.com/oauth/2.0/token', 'voice2TextToken', 'voice').then(res => [res, null]).catch(e => [null, e])
    if (err) {
      self.setData({
        showLoading: false,
        popMessage: err.errMsg,
        showPop: true
      });
      return;
    }
    let base64 = fileManager.readFileSync(res.tempFilePath, 'base64');
    wx.cloud.callFunction({
      name: 'voice2Text',
      data: {
        // auth: { token: "24.23d6e40a8e5bdba40a5680da9378c809.2592000.1570592293.282335-17049972" },
        auth,
        fileContent: base64,
        fileSize: res.fileSize
      },
      success: function (res) {
        res.result.err_msg === "success." ? self.setData({ translatedText: res.result.result.join("") }) : self.setData({ popMessage: res.result.err_msg, showPop: true })
      },
      fail: function (err) {
        self.setData({ popMessage: '转换失败', showPop: true })
      },
      complete: function () {
        self.setData({
          showLoading: false
        })

      }
    })


  })
Page({

  data: {
    isRecording: false,
    isLastStoped: true,
    isPress: false,
    canPlayAudio: false,
    translatedText: '',
    showLoading: false,
    popMessage: '',
    showPop: false,
    isPlaying: false
  },
  onLoad: function (options) {
    self = this
  },

  touchstart() {
    console.log('start');
    this.setData({
      isPress: true
    })
    recordManager.start({
      format: 'aac',
      sampleRate: 16000,
      numberOfChannels: 1
    })
  },
  touchend() {
    console.log('end');
    this.setData({
      isPress: false
    })
    if (this.data.isRecording) recordManager.stop();
    else this.data.isLastStoped = false

  },
  playAudio() {
    this.data.isPlaying ? audioManager.pause() : audioManager.play();
  },
  addTodo() {
    let todoObj = {
      title: this.data.translatedText || 'rinima',
      expireAt: null,
      content: '',
      isComplete: false
    };
    wx.navigateTo({
      url: "/pages/index/index?data=" + JSON.stringify(todoObj),
    })

  },
  cancelTodo() {
    wx.navigateTo({ url: "/pages/index/index" })
  },
  onClose() {
    this.setData({
      showPop: false
    })
  }
})