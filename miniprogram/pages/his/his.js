// pages/his/his.js
const app = getApp();
Page({
    //页面的初始数据
    data: {
      hasUserInfo: true,
      meter:0,
      time:0,
      images:'',
      nickName:''
    },

    onLoad: function (options) {
      let openid=options.openid;
      console.log(openid);
      wx.cloud.callFunction({
        name:'rundata',
        data:{
          action:'requireOthers', 
          params:{
            openid:openid
          }
        },
      }).then(res=>{ 
        console.log(res);
        this.setData({
         meter:res.result.data[0].distance,
         time:res.result.data[0].time,
         images:res.result.data[0].userInfo.avatarUrl,
         nickName:res.result.data[0].userInfo.nickName
        })
      })
    },
    //生命周期函数--监听页面加载
    
  })
  