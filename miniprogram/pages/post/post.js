// pages/post/post.js
const app = getApp();
const cwx = require('cloudfile');
const emitter = app.emitter;
Page({

  /**
   * 页面的初始数据
   */
  data: {
  },
  postlistener(e){
    var that = this;
    
    wx.showLoading({
      title: '上传中',
    })
    let postData = e.detail;
    console.log(postData)
    let images = postData.images;
    var promiseTasks = []
    for(var i=0;i<images.length;i++){
      promiseTasks.push(cwx.CloudUploadImage(images[i]))
    }
    let postImages = []
    Promise.all(promiseTasks).then(resarr=>{
      console.log(resarr)
      resarr.forEach(function(ele,index){
        postImages.push(ele.fileID)
      })
      console.log(postImages)
      //具体处理写在如下
      let userInfo = app.globalData.userInfo || wx.getStorageSync('userInfo')
      wx.cloud.callFunction({
        name:'mock-wx-post',
        data:{
          action:'saveOne',
          params:{
            content:postData.content,
            location:postData.location,
            postImages:postImages,
            userInfo
          }
        },
        success:r=>{
          this.setData({
            succMsg:'上传成功'
          })
          console.log(r);
          emitter.emit('new',r)
          setTimeout(() => {
            wx.navigateBack({
              delta: 0,
            })
          }, 1500);
        },
        fail:r=>{
          console.log(r)
          this.setData({
            errMsg:r.errMsg
          })
        },
        complete:r=>{
          wx.hideLoading();
        }
      })
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})