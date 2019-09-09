export const getBaiduAuth = async (url, storageKey, type) => {

  let curTime = Date.parse(new Date())
  let auth = wx.getStorageSync(storageKey);
  auth = auth && JSON.parse(auth)
  return new Promise((resolve, reject) => {
    try {
      if (!auth || (auth && curTime - auth.firstGetTime >= auth.expires * 1000)) {
        //  过期 重新鉴权
        wx.cloud.callFunction({
          name: 'getAuth',
          data: {
            url,
            type
          }
        }).then(res => {
          console.log(res)
          wx.setStorageSync(storageKey, JSON.stringify({
            expires: res.result.result.expires_in,
            access_token: res.result.result.access_token,
            firstGetTime: Date.parse(new Date()),
            scope: res.result.result.scope
          }));
          resolve({
            token: res.result.result.access_token,
            scope: res.result.result.scope
          })
        }).catch(e => {
          reject(e)
        })
      } else {
        resolve({
          token: auth.access_token,
          scope: auth.scope
        })
      }
    } catch (e) {
      reject(e)
    }

  })
}





