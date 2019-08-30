
const image2Text  = (headers, imageData) => {
  return wx.cloud.callFunction({
      name: 'image2Text',
      data: { headers, imageData }
  })
  .then(res => {
    console.log(res)
    return {
        code: 0,
        result: res.result
    }
  })
  .catch(e => {
      console.error(e)
      return Promise.reject({
          code: -1,
          msg: '转换失败'
      })
  })
}

export default image2Text