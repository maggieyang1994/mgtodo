const showAudio = (state = { showAudio: false }, action) => {
  let { type, payload } = action;
  switch (type) {
    case 'showAudio': state.showAudio = payload; break;
    default: state.showAudio = false;break
  }
  console.log(type, payload, state);
  // 引用类型的传递  会互相影响值
  return JSON.parse(JSON.stringify(state))
}


// const updateTodoList = (state = {todoList: []}, action) => {
//   let {type, todoList} = action;
//   switch(type){
//     case 'addTodoList': state.todoList.push(todoList);
//     case 'deleteTodoList' : state.todoList
//   }
// }
export default {
  showAudio
}