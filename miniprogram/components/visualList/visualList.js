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
        // 如何解决先后问题？
        // 新增的时候  才没更新高度就 开始计算visibleData()了
        setTimeout(() => {
          if (newVal.length) {
            this.getTotalHeight(newVal);
            this.getVisibleData()
          }
        })

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
    },
    bufferSize: {
      type: Number,
      default: 2
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    totalHeight: 0,
    visibleData: [],
    scrollTop: 0,
    lastMeasuredIndex: 0,
    sizeAndOffsetCahce: {},
    offset: 0
  },
  ready() {
    console.log(this.properties.data)
    setTimeout(() => {
      this.getVisibleData()
    })
  },
  observers: {
    "data.data": function (newVal) {
      console.log('observers', newVal);
      // this.totalHeight = 
    }
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
      let buffer = this.properties.bufferSize
      let { index: startIndex, offset } = this.getNearestIndex(this.data.scrollTop);
      let { index: endIndex } = this.getNearestIndex(this.data.scrollTop + this.properties.clientHeight);
      console.log(startIndex, endIndex)
      startIndex = startIndex - buffer <= 0 ? startIndex : startIndex - buffer;
      endIndex = endIndex + buffer;
      // slice 左闭右开
      this.data.visibleData = this.properties.data.slice(startIndex, endIndex + 1);
      this.data.offset = offset;
      this.setData({
        visibleData: this.data.visibleData,
        offset: this.data.offset
      })
    },
    getNearestIndex(height) {
      if (!height) return { index: 0, offset: 0 };
      let len = this.properties.data.length;
      let temp = 0, size = 0
      for (var i = 0; i < len; i++) {
        size = this.getItemHeight(i);
        temp += size
        if (temp >= height) return { index: i, offset: temp - size }
      }
      return {
        index: i,
        offset: temp - size
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
    getItemHeight(index) {
      return this.properties.data[index].height
    },
    setHeightByopenId({ detail }) {
      this.triggerEvent("setHeight", { ...detail });
      this.setData({
        totalHeight: this.data.totalHeight + detail.height
      })
    },
    getTotalHeight(val) {
      this.setData({
        totalHeight: val.map(x => x.height).reduce((o, item) => o += item || 0)
      })
    }
  }
})
