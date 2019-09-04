const cloud = require('wx-server-sdk');
var qs = require('qs');
cloud.init({
  traceUser: true,
  env: 'main-7f71e6'
});
const axios = require("axios")
// 云函数入口函数
exports.main = async (event, context) => {
  // console.log(111)
  // console.log(event, context);
  console.log(event);
  debugger;
  let url = 'https://aip.baidubce.com/rest/2.0/ocr/v1/general_basic?access_token='+event.auth;
  let res =await axios.post(url, qs.stringify({
    image: event.imageData
  }),{
    headers: {
      'Content-Type': "application/x-www-form-urlencoded"
    }
  });
  console.log(res);
}