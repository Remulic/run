const app = getApp();
Page({
    //页面的初始数据
    data: {
      userInfo: '', //定义一个存放个人信息的全局变量
      hasUserInfo: false,
      meter:0,
      time:0,
      images:''
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
    //用于用户第一次使用初始化用户数据
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

    getdata(){
      wx.cloud.callFunction({
        name:'rundata',
        data:{
          action:'require', 
        },
      }).then(res=>{ 
        console.log(res);
       this.setData({
         meter:res.result.data[0].distance,
         time:res.result.data[0].time
        })
      })
    },

    getBackgroumd(){
      wx.chooseImage({
        sizeType: ['compressed'], //可以指定是原图还是压缩图，默认二者都有
        sourceType: ['album'], //从相册选择
        success: (res) => {
          console.log(res);
            this.setData({
              images: res.tempFilePaths
            })
        }
      });   
    },
    onLoad: function (options) {
      if(wx.getStorageSync('userInfo')!=''){
        this.setData({
          userInfo: wx.getStorageSync('userInfo'),
          hasUserInfo: true
        })
        this.getdata();
      }
    },
    //生命周期函数--监听页面加载
    onShow: function (options) {
      if(wx.getStorageSync('userInfo')!=''){
        this.setData({
          userInfo: wx.getStorageSync('userInfo'),
          hasUserInfo: true
        })
      }
    },
    onPullDownRefresh: function () {
      console.log(wx.getStorageSync('userInfo'));
      this.setData({
        userInfo: wx.getStorageSync('userInfo'),
        hasUserInfo: true
      })
    },
    
  })
  