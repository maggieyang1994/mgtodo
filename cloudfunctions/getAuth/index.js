// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  traceUser: true,
  env: 'main-7f71e6'
});
const axios = require('axios')

// 云函数入口函数
exports.main = async (event, context) => {
  let url = "https://aip.baidubce.com/oauth/2.0/token";
  let grant_type = "client_credentials";
  let client_id = "oAuOqOhDyqiiSwTc4XiY0ZhI";
  let client_secret = "A8IvA6KhI2he9GuG8wxfvgRmFZL33UZq";
  let res = await axios.get(url, {
    params: {
      grant_type,
      client_id,
      client_secret
    }
  });
  // 为什么这里只能返回 res.data  不能返回res
  console.log(res)
  return {
    result: res.data
  }



  // return {
  //   sum: event.a + event.b
  // }
  
  
}