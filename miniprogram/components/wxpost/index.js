// components/FriendPub/index.js
const app = getApp();
const emitter = app.emitter;
Component({
  /**
   * 组件的属性列表
   */
  properties: {

  },

  /**
   * 组件的初始数据
   */
  data: {
    location: null,
    images: [],
    content: '',
    imgid: 0,
    realList: [],
  },
  /**
   * 组件生命周期
   */
  lifetimes:{
    attached(){
      let postdata = wx.getStorageSync('postdata') || null
      if(postdata!=null){
        this.setData(postdata)
      }
    }
  },
  /**
   * 组件的方法列表
   */
  methods: {
    post(){
      var that = this;
      /**
       * @信息传递到首页
       */
      this.triggerEvent('postlistener',{
        images:this.data.images,
        location:this.data.location,
        content:this.data.content
      })
    },
    chooseImage() {
      wx.chooseImage({
        count: 9, //默认9
        sizeType: ['compressed'], //可以指定是原图还是压缩图，默认二者都有
        sourceType: ['album'], //从相册选择
        success: (res) => {
          if (this.data.images.length != 0) {
            this.setData({
              images: this.data.images.concat(res.tempFilePaths)
            })
          } else {
            this.setData({
              images: res.tempFilePaths
            })
          }
        }
      });
    },
    ViewImage(e) {
      wx.previewImage({
        urls: this.data.images,
        current: e.currentTarget.dataset.url
      });
    },
    DelImg(e) {

      this.data.images.splice(e.currentTarget.dataset.index, 1);
      this.setData({
        images: this.data.images
      })
    },
    getInputValue(e) {
      this.setData({
        content: e.detail.value
      })
    },
    saveEditOrNot() {
      var that = this;
      wx.showModal({
        title: '将此次编辑保留',
        content: '',
        cancelText: '不保留',
        confirmText: '保留',
        success(res) {
          if (res.confirm) {
            console.log('用户点击确定')
            wx.setStorageSync('postdata', that.data)
            wx.navigateBack({
              delta: 1
            })
          } else if (res.cancel) {
            wx.clearStorageSync('postdata')
            wx.navigateBack({
              delta: 1
            })
          }
        }
      })
    },

    chooseLocation() {
      let self = this
      wx.chooseLocation({
        success(res) {
          self.setData({
            location: res.name
          })

        }
      })
    }
  }
})