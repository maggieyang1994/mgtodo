// miniprogram/pages/audio/audio.js
// const app = getApp()
import { getVoice2TextUrl } from "../../utils/getVoice2TextUrl"
import Notify from 'vant-weapp/notify/notify'
// import { showAudio } from '../../store/action.js'
import ArrayBufferToBase64 from '../../utils/arrayBufferToBase64'
// import QuickTodo from '../../models/quickTodo'
var self;
let appId = '5d5caf64';
let isFirst = true
let recordManager = wx.getRecorderManager();
let socketManager;
let audioManager = wx.createInnerAudioContext()
const sendData = (audioData, status) => {
  // console.log(ArrayBufferToBase64(audioData))
  var params = {
    'common': {
      'app_id': appId
    },
    'business': {
      'language': 'zh_cn', //小语种可在控制台--语音听写（流式）--方言/语种处添加试用
      'domain': 'iat',
      'accent': 'mandarin', //中文方言可在控制台--语音听写（流式）--方言/语种处添加试用
    },
    'data': {
      'status': status,
      'format': 'audio/L16;rate=16000',
      'encoding': 'raw',
      'audio': wx.arrayBufferToBase64(audioData)
    }
  }
  socketManager.send({
    data: JSON.stringify(params)
  })
}
recordManager.onStart(function () {
  console.log('start recording')
  // app.store.dispatch(showAudio(true));

  self.setData({
    isRecording: true
  })
  if (!self.data.isLastStoped) self.touchend()


  // 开启websocket
  let url = getVoice2TextUrl();
  console.log(url);
  socketManager = wx.connectSocket({ url });
  socketManager.onError(function () {
    console.log('onError')
  })
  socketManager.onClose(function () {
    console.log('onClose')
  })
  socketManager.onOpen(function () {
    console.log('onOpen')
  })
  socketManager.onMessage(function (res) {
    console.log('onMessage', res.data);
    // let result = JSON.parse(res);
    // console.log(result)
    // if(result.data.status === 2){
    //   // 识别结束
    //   let word
    // }
    // if (res) {
    //   let result = JSON.parse(res);
    //   let words = result.data.result.ws[0].cw.map(x => x.w).join("");
    //   console.log(words)
    //   this.setData({
    //     translatedText: 'rinimaei'
    //   })
    // }
    console.log(res)

  })

})
recordManager.onStop(

  function (res) {
    console.log('end recording')
    // app.store.dispatch(showAudio(false));
    self.setData({
      isRecording: false,
      isLastStoped: true,
      canPlayAudio: true,
      audioPath: res.tempFilePath,
      translatedText: 'rinima'
    });
    

  })

// 监听已经录制完的制定帧的大小
recordManager.onFrameRecorded(function (res) {
  let { frameBuffer, isLastFrame } = res;

  let status;
  if (isFirst) {
    status = 0;
    isFirst = false
  } else status = isLastFrame ? 2 : 1;
  console.log(frameBuffer, isLastFrame);
  wx.cloud.callFunction({
    name: 'mp3towav',
    data: {
      buffer: frameBuffer
    }
  }).then(res => {
    console.log(res)
  }).catch(e => {
    console.log(e)
  })
  // 如何确认 sendData的时候已经链接成功
  // sendData(frameBuffer, status)
})
Page({

  data: {
    isRecording: false,
    isLastStoped: true,
    isPress: false,
    canPlayAudio: false,
    audioPath: '',
    translatedText: ''
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
      frameSize: 4,
      format: 'mp3'
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
    audioManager.src = this.data.audioPath;
    audioManager.play();
  },
  addTodo() {
    let todoObj = {
      title: this.data.translatedText || 'rinima',
      expireAt: null,
      content: '',
      isComplete: false
    };
  wx.navigateTo({
      url: "/pages/index/index?data="+JSON.stringify(todoObj),
      // success: function (res) {
      //   // 通过eventChannel向被打开页面传送数据
      //   res.eventChannel.emit('onCreateTodo', { data: todoObj })
      // }
    })
   
  },
  cancelTodo() {
    wx.navigateTo({ url: "/pages/index/index" })
  }
})