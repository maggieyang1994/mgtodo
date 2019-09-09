// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  traceUser: true,
  env: 'main-7f71e6'
});
const axios = require('axios')

const apiConfig = {
  image: {
    client_id: "idRmnnAzO16P3KuyhdCdxLLC",
    client_secret: "TFlcC9ZZtt9gxGNOfFKTcIBszLjK2B4q"
  },
  voice: {
    client_id : '8s0sxvRAPQYhravbOXZ6G4sG',
    client_secret: 'yx2Rpaf4fbMtuk7rpAVAPcHnDXv1p9Id'
  }
}
// 云函数入口函数
exports.main = async (event, context) => {
  console.log(event)
  let url = event.url
  let grant_type = "client_credentials";
  let client_id = apiConfig[event.type].client_id;
  let client_secret = apiConfig[event.type].client_secret;
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