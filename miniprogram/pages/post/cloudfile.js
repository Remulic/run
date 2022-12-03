const cloudpath = 'mfc';
/**
 * 云开发图片上传和自动重命名
 * @param {*} path 
 */
function CloudUploadImage(path) {
  // 本地文件路径
  return new Promise(function (resolve, reject) {
    wx.getFileInfo({
      filePath: path,
      success(ans) {
        wx.cloud.uploadFile({
          cloudPath: cloudpath + '/' + ans.digest + '.png',
          filePath: path,
          success: res => {
            resolve(res)
          },
          fail(res) {
            reject('upload fail')
          }
        })
      }
    })
  })
}
module.exports={
  CloudUploadImage:CloudUploadImage
}