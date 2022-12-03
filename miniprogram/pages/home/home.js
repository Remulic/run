const app = getApp();
Page({

    /**
     * 页面的初始数据
     */
    data: {
      userInfo: '', //定义一个存放个人信息的全局变量
      openid:'',
      hasUserInfo: false,
      pageNames: [
       {
          id: 'run',
          name: '跑步',
        }
      ]
    },

    login(){
      //微信申请接口
      wx.getUserProfile({
        // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
        desc: '必须授权才可以继续使用', 
        //允许授权后，保存用户个人信息
        success:res => {
          //把用户信息保存到本地，（'自定义名字'，信息数据）
          wx.setStorageSync('userInfo', res.userInfo); 
          //将个人信息赋值给相应全局变量
          this.setData({
            userInfo: res.userInfo,
          })
          this.firstLogin();
        },
        //拒绝授权后的提示
        fail(res){
          wx.showModal({
            title: '提示',
            content: '必须授权才可以继续使用'
          })
        }
      })
    },

    firstLogin(){
      let userinfo= wx.getStorageSync('userInfo')
      wx.cloud.callFunction({
        name:'rundata',
        data:{
          action:'require', 
        },
      }).then(res=>{
        console.log(res);
        if (res.result.data.length==0) {
          wx.cloud.callFunction({
            name:'rundata',
            data:{
              action:'add', 
              params:{
                distance:0,
                time:0,
                userInfo: userinfo
              }
            },
          }).then(res=>{
            console.log(res);
          })
        }
      })
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
      // wx.showToast({
      //   title: '此程序暂时为学生自用',
      //   icon: 'none',
      //   duration: 2000
      // })
      // setTimeout(function () {
      //   wx.hideToast()
      // }, 10000)
      if(wx.getStorageSync('userInfo')!=''){
        this.setData({
          userInfo: wx.getStorageSync('userInfo')
        })
      }
      
      
     
      

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
      if(wx.getStorageSync('userInfo')!=''){
        this.setData({
          userInfo: wx.getStorageSync('userInfo')
        })
      }
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
  