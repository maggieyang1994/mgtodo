const cloud = require('wx-server-sdk');
cloud.init({
  traceUser: true,
  env: 'main-7f71e6'
});
const axios = require("axios")
exports.main = async (event, context) => {
  let url = 'http://vop.baidu.com/pro_api';
  let {auth, fileSize, fileContent} = event;
  let param = {
    "dev_pid": 80001,
    "format":'pcm',
    "rate": 16000,
    "channel":1,
    "token": auth.token,
    "cuid":"68-EC-C5-85-FA-A7",
    "len":fileSize,
    "speech": fileContent 
  }

  let result = await axios.post(url, param,{
    headers: {
      'Content-Type': "application/json"
    }
  });
  return result.data
}