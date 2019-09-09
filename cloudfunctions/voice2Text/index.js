const cloud = require('wx-server-sdk');
var qs = require('qs');
cloud.init({
  traceUser: true,
  env: 'main-7f71e6'
});
const axios = require("axios")
// 云函数入口函数
exports.main = async (event, context) => {
  let url = 'http://vop.baidu.com/pro_api';
  console.log(event);
  cloud.downloadFile({
    fileID: event.fileContent
  }).then(async res => {
    let result =await axios.post(url, {
      "dev_pid": 80001,
      "format":'m4a',
      "rate": 16000,
      "channel":1,
      "token": event.auth.token,
      "cuid":"68-EC-C5-85-FA-A7",
      "len":event.fileSize,
      "speech":wx.arrayBufferToBase64(res.fileContent), // xxx为 base64（FILE_CONTENT）
    },{
      headers: {
        'Content-Type': "application/json"
      }
    });
  console.log(result);
  })
  
  return 'rinima'
}