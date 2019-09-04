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

export default {
  showAudio
}