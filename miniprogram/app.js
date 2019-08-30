//app.ts
import { createStore, combineReducers } from './lib/redux.min'
import reducer from './reducer'
const Store = createStore(combineReducers(reducer))
App({
  Store,
  onLaunch() {
  },
  globalData: {}
})