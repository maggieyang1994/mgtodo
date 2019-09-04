// components/visualList/visualList.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    data: {
      type: Array,
      require: true,
      observer: function (newVal, oldVal) {
        // 计算总高度
        let data = newVal.filter(x => !x.isComplete);
        let total = 0;
        let height = this.getContentHeight()
      }
    },
    clientHeight: {
      type: Number,
      value: 300
    },
    userList: {
      type: Array,
      require: true
    },
    active: {
      type: Object,
      value: null
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    totalHeight: 0,
    visibleData: [],
    scrollTop: 0,
    lastMeasuredIndex: -1,
    sizeAndOffsetCahce: {},
    fadeObj: {
      title: 'rinima',
      expireAt: null,
      content: '',
      isComplete: false

    }
  },
  attached() {
    this.getVisibleData()
  },
  /**
   * 组件的方法列表
   */
  methods: {
    scroll(e) {
      this.setData({
        scrollTop: e.detail.scrollTop
      });
      this.getVisibleData()
    },
    getVisibleData() {
      let scrollTop = this.data.scrollTop || 0;

    },
    getItemHeight(item, index) {
      this.setData({
        fadeObj: {
          ...this.data.fadeObj,
          value: item.title
        }
      });
      // 设置成功之后获取dom高度
      return new Promise((resolve, reject) => {
        const query = wx.createSelectorQuery()
        query.select('.visualDom').boundingClientRect();
        query.exec(function (res) {
          resolve(res.height)
        })
      })

    },
    async getContentHeight(arr) {
      for(let i = 0; i< arr.length; i++){
        let temp = await this.g
      }
    },
    async getItemOffset(index){
      let total = 0; 
      let {sizeAndOffsetCahce, lastMeasuredIndex} = this.data
      if(index <= lastMeasuredIndex) return sizeAndOffsetCahce[index];
      if(lastMeasuredIndex > 0){
        const lastMeasured = sizeAndOffsetCahce[lastMeasuredIndex]
      };
      if(lastMeasured){
        total = lastMeasured.offset + lastMeasured.size
      }
      for(let i = lastMeasuredIndex; i<index;i++){
        let temp = await this.getItemHeight()
      }
    },
    onCompleteStateChange(e) {
      this.triggerEvent("complete", { id: e.detail.id })
    },
    onActive(e) {
      this.triggerEvent("active", { id: e.detail.id })
    },
    onTodoChange(e) {
      this.triggerEvent("change", { id: e.detail.id, todo: e.detail.todo })
    },
    onDelete(e) {
      this.triggerEvent("delete", { id: e.detail.id })
    },
  }
})
