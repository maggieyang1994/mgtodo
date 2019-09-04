import { createStore, combineReducers } from '../lib/redux.min.js';
import reducers from './reduces/index.js';


const store = createStore(
  combineReducers(reducers)
);
export default store