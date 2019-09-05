// 云函数入口文件
const cloud = require('wx-server-sdk')
const decode = require('audio-decode');
cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  // const wxContext = cloud.getWXContext()
  console.log(event);
  let data = await decode()
  return 'rinima'
}