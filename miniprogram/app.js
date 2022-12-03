const config = require('core/config');
const mitt = require('mitt')
const emitter = mitt();
const Towxml = require('/towxml/main');
App({
  emitter,
  globalData: {
    openid: '',
    userInfo:null
  },
  onLaunch: function () {
  },

  //创建一个towxml对象，供其它页面调用
  towxml:new Towxml(),

  //声明Markdown文件目录路径
  docDir: 'https://www.vvadd.com/wxml_demo/demo.txt?v=2',
  
  //声明一个数据请求方法
  getText: (url, callback) => {
    wx.request({
      url: url,
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      success: (res) => {
        if (typeof callback === 'function') {
          callback(res);
        };
      }
    });
  },
  //先序执行的函数
  onLaunch: function () {
    /**
     * 初始化userInfo
     */
    let userInfo = wx.getStorageSync('userInfo') || null
    if (userInfo != null) {
      this.globalData.userInfo = userInfo
    }
    let openid = wx.getStorageSync('openid') || null
    if(openid!=null){
      this.globalData.openid = openid
    }
    /**
     * 初始化云环境
     */
    wx.cloud.init({
      env: config.CloudID,
      traceUser: true
    })
    /**
     * @获取用户openid
     */
    wx.cloud.callFunction({
      name: 'openapi',
      data: {
        action: 'getOpenData'
      },
      success: r => {
        // console.log(r)
        let openid = r.result.openid
        wx.setStorageSync('openid', openid)
        this.globalData.openid = openid
      },
      fail: r => {
        console.log(r)
      }
    })
    
  }


})