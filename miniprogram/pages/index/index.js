import Notify from 'vant-weapp/notify/notify'
import adapter from '../../adapters/index'
import QuickTodo from '../../models/QuickTodo'
import BaseTodo from '../../models/BaseTodo'
import User from '../../models/User'
import regeneratorRuntime from '../../utils/runtime'
// import decrypto from '../../utils/decrypto.js'

const getDefaultTodo = () => ({
  title: '',
  expireAt: null,
  content: '',
  isComplete: false
})

const indexPageData = {
  login: false,
  user: null,
  active: null,
  todoList: [],
  currentUser: {},
  userList: [],
  createTodo: getDefaultTodo(),
  completeTodo: [],
  unCompleteTodo: []
}

Page({
  data: indexPageData,
  async onLoad(options) {
    var self = this;
    console.log('Start inital ...')
    const result = await this.inital()
    console.log(`Inital ${result ? 'done' : 'fail'}`);
    if (options.data) {
      let temp = JSON.parse(options.data);
      temp.title = decodeURIComponent(temp.title)
      this.onCreateTodo(temp)
    }
  },
  onunload() {
    // subscribeId()
  },
  async onPullDownRefresh() {
    console.log('Down refresh.')
    await this.networkInital();
    wx.stopPullDownRefresh()
  },

  inital() {
    console.log('Inital index Page: ', this)
    const cache = wx.getStorageSync('cache')

    if (cache) {
      console.log('Find cache', cache)
      return this.cacheInital(cache)
    } else {
      console.log('Not find cache, inital from network.')
      return this.networkInital()
    }
  },

  cacheInital(cache) {
    const { login, currentUser, active, todoList, createTodo, userList,completeTodo, unCompleteTodo } = cache
    const data = {
      login,
      currentUser: new User(currentUser),
      userList,
      active,
      todoList: todoList.map(x => new BaseTodo(x)),
      createTodo,
      completeTodo,
      unCompleteTodo
    }

    adapter.login(currentUser)
    this.setData(data)
    return true
  },

  async networkInital() {
    console.log('Inital userinfo ...')
    const userInfoMeta = await this.initalUser()
    if (!userInfoMeta) return false

    console.log('Userinfo:', userInfoMeta)
    this.data.login = true
    this.data.currentUser = new User(userInfoMeta)
    adapter.login(userInfoMeta)

    console.log('Inital todolist ...')
    await this.initalTodolist()
    this.updateData()
    return true
  },

  async initalUser() {
    const result = await this.checkUserInfoPermission()

    if (result) {
      // 有权限，获取 UserInfo
      console.log('Have userinfo permission')
      return this.getUserInfo()
    } else {
      // 无权限，跳转 Welcome 页面
      console.log('Not have userinfo permission.')
      wx.redirectTo({
        url: '/pages/welcome/index'
      })
      return false
    }
  },

  checkUserInfoPermission() {
    return new Promise((resolve, reject) => {
      wx.getSetting({
        success: res => {
          resolve(res.authSetting['scope.userInfo'])
        }
      })
    })
  },

  getUserInfo() {
    return new Promise((resolve, reject) => {
      wx.getUserInfo({
        success: res => {
          resolve(User.mapping(res.userInfo))
        }
      })
    })
  },

  async initalTodolist() {
    const res = await adapter.getTodoList()
    const { users, list } = res.result
    this.data.userList = users.length ? users.map(x => new User(x)) : [this.data.currentUser]
    console.log('Todolist:', res.result)
    this.data.todoList = this.sortTodoList(list).map(x => new BaseTodo(x))
  },

  sortTodoList(list) {
    //  降序
    return list.sort((x, y) => y.lastModify - x.lastModify)
  },

  // 更新 data 并按照修改时间排序
  updateData(sort = true) {
    const todoList = sort ? this.sortTodoList(this.data.todoList) : null
    this.setData({
      ...this.data,
      ...sort && { todoList },
      completeTodo: this.data.todoList.filter(x => x.isComplete),
      unCompleteTodo: this.data.todoList.filter(x => !x.isComplete)
    })

    const cache = {
      ...this.data,
      currentUser: User.mapping(this.data.currentUser),
      userList: this.data.userList,
      todoList: this.data.todoList.map(x => BaseTodo.mapping(x)),
      completeTodo: this.data.todoList.map(x => BaseTodo.mapping(x)).filter(x => x.isComplete),
      unCompleteTodo: this.data.todoList.map(x => BaseTodo.mapping(x)).filter(x => !x.isComplete)
    }

    wx.setStorage({
      key: 'cache',
      data: cache
    })
    console.log('Update data and caching.', cache);
    console.log(this.data.completeTodo, this.data.unCompleteTodo)
  },

  // Todo input 内容 change
  onCreateChange(e) {
    this.setData({
      createTodo: e.detail
    })
  },

  // 创建 Todo
  onCreateTodo(data) {
    const todo = data.title ? data : this.data.createTodo
    // todo.creator = this.data.user

    const quickTodo = new QuickTodo(QuickTodo.mapping(todo))


    // 马上添加一条 todo 到 list 并更新视图
    this.data.todoList
      .unshift(quickTodo)
    this.data.createTodo = getDefaultTodo()
    this.updateData();
    // setTimeout(() => {
    //   debbuger;
    //   console.log(this.data.todoList)
    // })

  },

  // Complete
  onCompleteStateChange(e) {
    const id = e.detail.id
    const target = this.data.todoList.find(x => x.id === id)
    const completeState = target.isComplete

    target.isComplete = !completeState
    target.lastModify = new Date().getTime()
    target.completeAt = new Date().getTime()
    target.isLoading = true

    if (this.data.active && this.data.active.id === id) {
      this.data.active = null
    }
    this.updateData()

    // 发起请求修改数据
    target.update()
      .then(res => {
        // 成功 - 更新数据
        console.log(res)
        target.updateByMeta(res.result)
      })
      .catch(e => {
        // 失败 - 回滚数据
        Notify(e.msg)
        target.isComplete = completeState
      })
      .then(() => {
        target.isLoading = false
        this.updateData()
      })
  },

  // active 状态
  onActive(e) {
    let id = e.detail.id

    // QuickTodo 没有 id - 不能修改详情
    if (!id) return

    // 有已更改的 - 保存修改
    const active = this.data.active
    if (active && active.isChange) {
      active.isLoading = true
      active.lastModify = new Date().getTime()
      this.updateData()

      active.update()
        .then(res => {
          active.isChange = false
          active.updateByMeta(res.result)
        })
        .catch(e => {
          active.isChange = true
          Notify(e.msg)
        })
        .then(() => {
          active.isLoading = false
          this.updateData()
        })
    }

    // toggle
    const target = this.data.todoList.find(x => x.id === id)
    this.setData({
      active: active && active.id === id
        ? null
        : target
    })
  },

  // Todo change
  onTodoChange(e) {
    let { id, todo } = e.detail
    const target = this.data.todoList.find(x => x.id === id)

    todo = BaseTodo.mapping(todo)
    target.updateByMeta(todo)
    target.isChange = true

    this.setData({
      todoList: this.data.todoList
    })
  },

  // Delete
  onDelete(e) {
    const id = e.detail.id
    const index = this.data.todoList.findIndex(x => x.id === id)
    const target = this.data.todoList[index]

    this.data.todoList.splice(index, 1)
    this.setData({
      todoList: this.data.todoList
    })

    target.delete()
      .then(res => {
        console.log(res)
      })
      .catch(e => {
        this.data.todoList.push(target)
        this.updateData()
      })
  },
  async setHeightByopenId({ detail }) {
    let curTodo = this.data.todoList.find(x => x.lastModify === detail.lastModify)
    curTodo.height = detail.height;
    let res, todo
    try {
      if (detail.openId) {
        // 之前存在数据库中的老数据
        todo = new BaseTodo(BaseTodo.mapping(curTodo));
        res = await todo.update(curTodo.id, todo)

      } else {
        // 新增的数据
        todo = new QuickTodo(QuickTodo.mapping(curTodo))
        res = await todo.create()
      }
      const index = this.data.todoList.findIndex(x => x.lastModify === todo.lastModify || x.lastModify === detail.lastModify);
      !detail.openId && (todo = new BaseTodo(res.result))
      // console.log(basetTodo)
      index !== -1 && this.data.todoList.splice(index, 1, todo)
      

    } catch (e) {
      const index = this.data.todoList.findIndex(x => x.lastModify === todo.lastModify)
      this.data.todoList.splice(index, 1)
      this.data.createTodo = todo
      Notify(e.msg)
    }
    this.updateData()
  }
})
