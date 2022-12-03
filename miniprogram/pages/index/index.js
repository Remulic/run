// pages/index/index.js
const { PageSize } = require('../../core/config');
const config = require('../../core/config')
const SecCheck = require('../../core/SecCheck')
const app = getApp();
const PAGE_SIZE = config.PageSize;
const emitter = app.emitter;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    bottom: 0,
    hasUserInfo: false,
    postList: [],
    showbar: true,
    postId: '',
    oncomment: false,
    replyUserInfo: null,
    replyContent: '',
    hasInput:false
  },
  taInput(e) {
    this.setData({
      replyContent: e.detail.value
    })
  },
  handleSend() {
    var that = this;
    //获取用户信息
    let userInfo = app.globalData.userInfo || wx.getStorageSync('userInfo') || ''
    let openid = app.globalData.openid || wx.getStorageSync('openid') || ''
    if (openid == '' || userInfo == '') {
      this.setData({
        errMsg: '缺少用户信息'
      })
      return
    }
    SecCheck.msgSecCheck(this.data.replyContent).then(ans=>{
      console.log(ans)
      if(ans.result.code == 200){
        wx.cloud.callFunction({
          name: 'mock-wx-comment',
          data: {
            action: 'saveOne',
            params: {
              postId: this.data.postId,
              userInfo,
              replyUserInfo: this.data.replyUserInfo,
              openid,
              replyContent: this.data.replyContent
            }
          },
          success: r => {
            console.log(r)
            /**
             * 全部组件进行刷新
             */
            let acmp = that.selectAllComponents('.card')
            // console.log(acmp)
            acmp.forEach(function (ele, index) {
              ele.flushComment(that.data.postId)
            })
            that.setData({
              postId: ''
            })
    
          }
        })
      }else{
        this.setData({
          errMsg:ans.result.msg,
          postId:''
        })
      }
    })
    

  },
  deletepost(e) {
    let docid = e.detail
    let tarr = this.data.postList
    let deleteIndex = tarr.findIndex(item => item._id === docid);
    tarr.splice(deleteIndex, 1)
    console.log(tarr)
    this.setData({
      postList: tarr
    })
  },
  baraction(e) {
    this.setData({
      postId: e.detail.postId,
      replyUserInfo: e.detail.replyUserInfo,
      oncomment: true
    })
  },
  hideShowBar() {
    var that = this;

    // let markcard = this.selectComponent('#wxcard')
    // markcard.closeActionBar();
    let acmp = this.selectAllComponents('.card')
    // console.log(acmp)
    acmp.forEach(function (ele, index) {
      ele.closeActionBar();
    })
    if (this.data.oncomment) {
      this.setData({
        oncomment: false
      })
      return
    }
    this.setData({
      postId: ''
    })
    // markcard.closeActionBar();
  },

  reqPostData(e) {
    let postList = this.data.postList
    let len = postList.length
    let wxName = e
    if(len%PageSize!=0) {
      wx.showToast({
        title: '没有更多了',
        icon:'none'
      })
      return
    }
    wx.showLoading({
      title: '查询中',
    })
    wx.cloud.callFunction({
      name: 'mock-wx-post',
      data: {
        action: 'getList',
        params:{
          pageNum:parseInt(postList.length / PageSize)
        },
        queryParams: {
          nickName:wxName
        }
      },
      success: r => {
        wx.stopPullDownRefresh({
          success: (res) => {},
        })
     //   console.log(r)
        console.log(r.result.data[0])
        this.setData({
          postList: postList.concat(r.result.data)
        })
      },
      complete:r=>{
        console.log(r)
        wx.hideLoading();
      }
    })
  },

  searchDate(e){
    let postList = this.data.postList
    let len = postList.length
    if (e) {
      wx.showLoading({
        title: '查询中',
      })
      wx.cloud.callFunction({
        name: 'mock-wx-post',
        data: {
          action: 'getList',
          params:{
            pageNum:parseInt(postList.length / PageSize)
          },
          queryParams: {
            userInfo:{
              nickName:e
            }
          }
        },
        success: r => {
          wx.stopPullDownRefresh({
            success: (res) => {},
          })
          console.log(r.result.data[0])
          if (r.result.data[0]) {
            this.setData({
              postList: r.result.data
            })
          }else{
            wx.showToast({
              title: '查无此人',
              icon: 'none',
              duration: 2000
            })
            setTimeout(function () {
              wx.hideToast()
            }, 2000)
          }
          
        },
        complete:r=>{
          console.log(r)
          wx.hideLoading();
        }
      })
    }
  },

  showSearchBox() {
    if (this.data.hasUserInfo) {
      this.setData({
        hasInput:true
      })
    }
  },
  
  showEditPage() {
    if (this.data.hasUserInfo) {
      wx.navigateTo({
        url: '/pages/post/post',
      })
    }
  },

  getInput(e){
    this.searchDate(e.detail.value);
    this.setData({
      hasInput:false
    })
    console.log(e.detail);
  },
  /**
   * 获取用户信息
   * @param {} e 
   */
  getUserProfile(e) {
    wx.getUserProfile({
      desc: '用于完善会员资料', // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
      success: (res) => {
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        }, () => {
          wx.setStorageSync('userInfo', res.userInfo)
          this.firstLogin();
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

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // let app = getApp();
    // console.log(app.globalData)
    // if (app.globalData.userInfo != null) {
    //   this.setData({
    //     userInfo: app.globalData.userInfo,
    //     hasUserInfo: true
    //   })
    // }
    if(wx.getStorageSync('userInfo')!=''){
      this.setData({
        userInfo: wx.getStorageSync('userInfo'),
        hasUserInfo: true
      })
    }
    /**
     * 事件总线监听发布事件
     */
    emitter.on('new',res=>{
      this.setData({
        postList:[]
      },()=>{
        this.reqPostData()
      })
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    this.setData({
      postList:[]
    },()=>{
      this.reqPostData()
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    /**
     * 请求朋友圈信息
     */
    if(wx.getStorageSync('userInfo')!=''){
      this.setData({
        userInfo: wx.getStorageSync('userInfo'),
        hasUserInfo: true
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
    this.setData({
      postList: []
    }, () => {
      this.reqPostData();
    })
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    /**
     * 请求朋友圈信息
     */
    this.reqPostData()
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})