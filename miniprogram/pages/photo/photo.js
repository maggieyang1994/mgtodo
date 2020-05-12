import { adapterImage } from '../../utils/adaptiveImage.js';
import adapter from '../../adapters/index'
import { getBaiduAuth } from '../../utils/getBaiduAuth.js'
Page({
  data: {
    sourceImg: null,
    cropprSrc: null,
    showCut: false,
    translatedText: "",
    cropperWidth: null,
    cropperHeight: null
  },
  onLoad() {

  },
  onUnload() {

  },
  async sourceImageOnload(e) {
    // 算出图片的缩放比例
    let res = await this.getElement(".imageWrapper");
    let scale = adapterImage(res, e.detail);
    this.setData({
      cropperWidth: Math.floor(e.detail.width * scale),
      cropperHeight: Math.floor(e.detail.height * scale)
    })
    wx.hideLoading();
  },
  handlerTakePhoto(e) {
    wx.showLoading({
      title: '加载中'
    })
    this.setData({
      sourceImg: e.detail.path
    })
  },

  cropperload(e) {
    this.cropper = this.selectComponent("#image-cropper");
    console.log("cropper", this.cropper)
  },
  loadCropperimage(e) {
    console.log("图片加载完成", e.detail);
    wx.hideLoading();
    this.cropper = this.selectComponent("#image-cropper");
    //重置图片角度、缩放、位置
    this.cropper && this.cropper.imgReset()
  },
  clickcut(e) {
    console.log(e.detail);
    //点击裁剪框阅览图片
    wx.previewImage({
      current: e.detail.url, // 当前显示图片的http链接
      urls: [e.detail.url] // 需要预览的图片http链接列表
    })
  },
  handleCut() {
    // 确认裁剪
    this.cropper.getImg((obj) => {
      this.setData(({
        sourceImg: obj.url,
        cropprSrc: null,
        showCut: false
      }))
    });
  },
  cancelCut() {
    // 取消裁剪
    this.setData({
      cropprSrc: null,
      showCut: false
    })
  },
  getElement(selector) {
    return new Promise((resolve, reject) => {
      try {
        const query = this.createSelectorQuery()
        query.select(selector).boundingClientRect()
        query.exec(res => {
          const { width, height, left, top } = res[0]
          resolve({ width, height, left, top })
        })
      } catch (e) {
        reject(e)
      }
    })
  },
  cut() {
    //开始裁剪
    this.setData({
      cropprSrc: this.data.sourceImg,
      showCut: true
    });
  },
  async image2Text() {
    this.setData({
      showLoading: true
    })
    let image = this.data.cropprSrc || this.data.sourceImg
    let imageData = wx.getFileSystemManager().readFileSync(image, 'base64');
    let [auth, err] = await getBaiduAuth("https://aip.baidubce.com/oauth/2.0/token", 'image2TextToken', 'image').then(res => {
      console.log(res);
      return [res, null]
    }).catch(e => [null, e]);
    console.log(auth, err)
    if (err) {
      this.setData({
        showLoading: false,
        popMessage: err.errMsg,
        showPop: true
      })
      return;
    }
    adapter.image2Text(auth, imageData).then(res => {
      console.log('res.............', res)
      // 为什么必须要开通 本地调试才会有效果？？？？？  ---->还不是因为你没更新云端代码 因为开通了本地调试用的是本地代码  没开通用的云端代码 
      if (res.result.error_code === 110) this.setData({ popMessage: '权限已经过期', showPop: true, showLoading: false })
      else {
        this.setData({
          translatedText: res.result.words_result.map(x => x.words).join("\r\n"),
          showLoading: false
        });
      }

    }).catch(e => {
      console.log('e.............', e)
      this.setData({ popMessage: e.message || e.msg, showPop: true, showLoading: false })
    })
  },
  onClose() {
    this.setData({
      showPop: false
    })
  },
  handleInput({ detail }) {
    console.log(detail)
    this.data.translatedText = detail.value
  },
  addTodo() {
    let todoObj = {
      // url参数中有特殊字符的时候 需要encode
      title: encodeURIComponent(this.data.translatedText),
      expireAt: null,
      content: '',
      isComplete: false
    };
    wx.navigateTo({
      url: "/pages/index/index?data=" + JSON.stringify(todoObj)
    })
  },
  cancelTodo() {
    wx.navigateTo({ url: "/pages/index/index" })
  }
})