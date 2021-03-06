// components/editPhoto/editPhoto.js
import { adapterImage } from '../../utils/adaptiveImage.js';
import adapter from '../../adapters/index'
import { getBaiduAuth } from '../../utils/getBaiduAuth.js'
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    sourceImg: {
      type: String
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    outview: null,
    scale: null,
    imageLoaded: false,
    direction: '',
    startPosition: null,
    temp: [0, 0, 0, 0],
    movablePosotion: null,
    showCut: false,
    resultImg: null,
    showLoading: false,
    popMessage: '',
    showPop: false
  },

  /**
   * 组件的方法列表
   */
  methods: {
    async imageOnload(e) {
      let res = await this.getElement(".imageWrapper");
      wx.hideLoading();
      // 根据outer view 和 image view 算出比例
      let scale = adapterImage(res, e.detail);
      let tempObj = {
        top: res.top || 0,
        left: res.left || 0,
        width: Math.floor(e.detail.width * scale),
        height: Math.floor(e.detail.height * scale)
      }
      this.setData({
        imageLoaded: true,
        outview: tempObj,
        scale,
        movablePosotion: tempObj
      })
    },
    cut() {
      this.setData({
        showCut: true
      })
      //获取到image-cropper对象
      this.cropper = this.selectComponent("#image-cropper");
      //开始裁剪
      this.setData({
        cropprSrc: "https://raw.githubusercontent.com/1977474741/image-cropper/dev/image/code.jpg",
      });
    },
    cropperload() {
      console.log("cropperload")
    },
    cancelCut() {
      this.setData({
        movablePosotion: this.data.outview,
        showCut: false
      })
    },
    handleCut() {
      console.log(e.detail);
      //点击裁剪框阅览图片
      wx.previewImage({
        current: e.detail.url, // 当前显示图片的http链接
        urls: [e.detail.url] // 需要预览的图片http链接列表
      })
    },
    loadimage() {
      console.log("图片加载完成", e.detail);
      wx.hideLoading();
      //重置图片角度、缩放、位置
      this.cropper.imgReset();
    },
    async image2Text() {
      if (this.data.movablePosotion.width <= 15 || this.data.movablePosotion.height <= 15) {
        //baidu api 最短边至少15px
        this.setData({
          popMessage: "图片最短边应大于15px"
        })
        return false;
      }
      this.setData({
        showLoading: true
      })
      let image = this.data.resultImg || this.data.sourceImg
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
        console.log('res.......................', res)
        // 为什么必须要开通 本地调试才会有效果？？？？？  ---->还不是因为你没更新云端代码 因为开通了本地调试用的是本地代码  没开通用的云端代码 
        if (res.result.error_code === 110) this.setData({ popMessage: '权限已经过期', showPop: true, showLoading: false })
        else {
          this.setData({
            translatedText: res.result.words_result.map(x => x.words).join("\r\n"),
            showLoading: false
          });
        }

      }).catch(e => {
        console.log('e.......................', e)
        this.setData({ popMessage: e.message, showPop: true, showLoading: false })
      })
    },
    cancelTodo() {
      wx.navigateTo({ url: "/pages/index/index" })
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
        url: "/pages/index/index?data=" + JSON.stringify(todoObj),
        // success: function (res) {
        //   // 通过eventChannel向被打开页面传送数据
        //   res.eventChannel.emit('onCreateTodo', { data: todoObj })
        // }
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
    }
  }


})
