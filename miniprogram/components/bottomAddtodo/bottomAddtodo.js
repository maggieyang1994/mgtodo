// components/bottomAddtodo/bottomAddtodo.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    isShow:{
      type: Boolean,
      default: true
    }
  },

  /**
   * 组件的初始数据
   */
  data: {

  },

  /**
   * 组件的方法列表
   */
  methods: {
    addTodo(){
      this.triggerEvent("addTodo")
    },
    cancelTodo(){
      this.triggerEvent("cancelTodo")
    }
  }
})
