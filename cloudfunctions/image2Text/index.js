const cloud = require('wx-server-sdk');
cloud.init()
const axios = require("axios")
// 云函数入口函数
exports.main = async (event, context) => {
  // console.log(111)
  // console.log(event, context);
  let {headers, imageData} = event;
  console.log(headers)
  let url = 'http://webapi.xfyun.cn/v1/service/v1/ocr/general';
  axios.post(url, {
    image: imageData
  },{
    headers
  }).then(res => {
    return res
  }).catch(e => {
    return e
  })
}