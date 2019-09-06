// miniprogram/pages/audio/audio.js
// const app = getApp()
import { getBaiduAuth } from '../../utils/getBaiduAuth.js'
var self;
let appId = '5d5caf64';
let recordManager = wx.getRecorderManager();
let audioManager = wx.createInnerAudioContext();
let fileManager = wx.getFileSystemManager()

recordManager.onStart(function () {
  console.log('start recording')
  // app.store.dispatch(showAudio(true));

  self.setData({
    isRecording: true
  })
  if (!self.data.isLastStoped) self.touchend()
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
    // getBaiduAuth('http://openapi.baidu.com/oauth/2.0/token', 'voice2TextToken', 'voice').then(auth => {
    //   console.log(auth);
    //   let base64 = fileManager.readFileSync(res.tempFilePath, 'base64');
    //   console.log(base64);
    //   wx.cloud.callFunction({
    //     name: 'voice2Text',
    //     data: {
    //       fileContent: base64,
    //       auth,
    //       fileSize: res.fileSize
    //     }
    //   })
    // })
    let base64 = fileManager.readFileSync(res.tempFilePath, 'base64');
    console.log(base64);
    wx.cloud.callFunction({
      name: 'voice2Text',
      data: {
        fileContent: base64,
        auth: JSON.parse('{"expires":2592000,"access_token":"24.cbff936cf75d454cad4f992f24c7bca6.2592000.1570346128.282335-17049972","firstGetTime":1567754141000,"scope":"audio_voice_assistant_get brain_enhanced_asr audio_tts_post public brain_ocr_general_basic brain_ocr_webimage brain_all_scope picchain_test_picchain_api_scope wise_adapt lebo_resource_base lightservice_public hetu_basic lightcms_map_poi kaidian_kaidian ApsMisTest_Test权限 vis-classify_flower lpq_开放 cop_helloScope ApsMis_fangdi_permission smartapp_snsapi_base iop_autocar oauth_tp_app smartapp_smart_game_openapi oauth_sessionkey smartapp_swanid_verify smartapp_opensource_openapi smartapp_opensource_recapi fake_face_detect_开放Scope"}'),
        fileSize: res.fileSize
      }
    })
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
      url: "/pages/index/index?data=" + JSON.stringify(todoObj),
    })

  },
  cancelTodo() {
    wx.navigateTo({ url: "/pages/index/index" })
  }
})