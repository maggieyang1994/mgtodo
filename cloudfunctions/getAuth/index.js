// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init();
const axios = require('axios')

// 云函数入口函数
exports.main = async () => {
  let url = "https://aip.baidubce.com/oauth/2.0/token";
  let grant_type = "client_credentials";
  let client_id = "oAuOqOhDyqiiSwTc4XiY0ZhI";
  let client_secret = "A8IvA6KhI2he9GuG8wxfvgRmFZL33UZq";
  axios.get(url, {
    params: {
      grant_type,
      client_id,
      client_secret
    }
  }).then(res => {
    console.log(res);
    return res
  })
  
  
}