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
    dragStart(e) {
      this.setData({
        startPosition: {
          startX: e.touches[0].pageX,
          startY: e.touches[0].pageY
        },
        direction: e.target.dataset.type
      })
    },
    async dragMove(e) {
      let direction = this.data.direction;
      let { pageX, pageY, clientX, clientY } = e.touches[0];
      let { startX, startY } = this.data.startPosition;
      let temp = this.data.temp;
      let { left, width, height, top } = await this.getElement(".movableArea");
      // 必须在区域内移动
      if (this.data.startPosition && clientX >= left && clientX <= left + width && clientY >= top && clientY <= height + top) {
        if (direction.indexOf("top") !== -1) {
          // 向下- 向上 +
          temp[0] = startY - pageY
        }
        if (direction.indexOf("left") !== -1) {
          // 向右-  向左 +
          temp[1] = startX - pageX
        }
        if (direction.indexOf("bottom") !== -1) {
          // 向下- 向上 +
          temp[2] = startY - pageY
        }
        if (direction.indexOf("right") !== -1) {
          // 向右-  向左 +
          temp[3] = startX - pageX
        }
        this.setData({
          temp
        })
      }


    },
    dragEnd(e) {
      // 放开的时候记录当前位置
      let { left, top, height, width } = this.data.movablePosotion;
      let temp = this.data.temp
      this.setData({
        movablePosotion: {
          left: left - temp[1],
          top: top - temp[0],
          width: width + temp[1] - temp[3],
          height: height + temp[0] - temp[2]
        },
        temp: [0, 0, 0, 0]
      })
    },
    onChange(e) {
      // 如果是拖拽 e.detail.source = touches
      if (!e.detail.source) return
      const { x, y } = e.detail
      this.setData({
        movablePosotion: {
          ...this.data.movablePosotion,
          left: x,
          top: y
        }
      })
    },
    cut() {
      this.setData({
        showCut: true
      })
    },
    cancelCut() {
      this.setData({
        movablePosotion: this.data.outview,
        showCut: false
      })
    },
    handleCut() {
      let self = this;
      let ctx = wx.createCanvasContext('canvas1', this);
      // 等比例放大图片
      // 不能画网络图片
      wx.getImageInfo({
        src: this.data.sourceImg,
        success: (res) => {
          ctx.drawImage(res.path, (this.data.movablePosotion.left - this.data.outview.left) / this.data.scale, (this.data.movablePosotion.top - this.data.outview.top) / this.data.scale, this.data.movablePosotion.width / this.data.scale, this.data.movablePosotion.height / this.data.scale, 0, 0, this.data.movablePosotion.width / this.data.scale, this.data.movablePosotion.height / this.data.scale)
          ctx.draw(false, () => {
            wx.canvasToTempFilePath({
              quality: 1,
              canvasId: 'canvas1',
              success(res) {
                self.setData({
                  resultImg: res.tempFilePath,
                  showCut: false
                })
              },
              fail(err) {
                console.log(err)
              }
            }, this)
          });
        }
      })
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
        // 为什么必须要开通 本地调试才会有效果？？？？？  ---->还不是因为你没更新云端代码 因为开通了本地调试用的是本地代码  没开通用的云端代码 
        if (res.result.error_code === 110) this.setData({ popMessage: '权限已经过期', showPop: true ,showLoading: false})
        else {
          this.setData({
            translatedText: res.result.words_result.map(x => x.words).join("\r\n"),
            showLoading: false
          });
        }

      }).catch(e => {
        this.setData({ popMessage: e.message, showPop: true, showLoading: false })
      })
    },
    cancelTodo() {
      wx.navigateTo({ url: "/pages/index/index" })
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
    handleInput({detail}){
      console.log(detail)
      this.data.translatedText = detail.value
    }
  }


})
