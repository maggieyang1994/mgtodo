
const image2Text  = (auth, imageData) => {
  return wx.cloud.callFunction({
      name: 'image2Text',
      data: { auth, imageData }
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