// components/wxcard/index.js
import{getDateDiff} from '../../utils/getDateDiff'
const app = getApp();
var nowdate
Component({
  /**
   * 组件的一些选项
   */
  options: { 
    addGlobalClass: true,
    multipleSlots: true
  },
  /**
   * 组件的属性列表
   */
  properties: {
    item: {
      type: Object,
      observer: function (newVal, oldVal) {
        nowdate=getDateDiff(newVal.updated_time);
        // console.log(newdate)
      }
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    openid: '',
    liked: false,
    showBar: false,
    showSearch:false,
    //喜欢列表
    likeList: [],
    //评论列表
    commentList: [],
    nowdate:''
  },
  lifetimes: {
    attached() {
      this.setData({
        openid: app.globalData.openid,
        nowdate: nowdate
      })
      //请求并获取喜欢列表
      this.reqLikeList();
      //请求并获取评论列表
      this.reqCommentList();
      // console.log(postList);
    }
  },
  /**
   * 组件的方法列表
   */
  methods: {
    deleteComment(e) {
      var that = this;
      /**
       * 长按删除
       */
      let docId = e.currentTarget.dataset.idx;
      let openid = e.currentTarget.dataset.openid;
      let myOpenid = app.globalData.openid || wx.getStorageSync('openid')
      if (myOpenid != openid) {
        return
      }
      /**
       * 相等判断是否删除
       */
      wx.showModal({
        title: '提醒',
        content: '是否删除该评论',
        success: r => {
          if (r.confirm) {
            /**
             * 删除
             */
            wx.showLoading({
              title: '删除中',
            })
            wx.cloud.callFunction({
              name: 'mock-wx-comment',
              data: {
                action: 'deleteOne',
                docId: docId
              },
              success: res => {
                this.reqCommentList();
                wx.hideLoading();
              }
            })
          }
        }
      })
    },
    delIt(e) {
      let docId = e.currentTarget.dataset.idx;
      wx.showModal({
        title: '提醒',
        content: '是否要删除该条朋友圈',
        success: r => {
          if (r.confirm) {
            wx.showLoading({
              title: '删除',
            })
            wx.cloud.callFunction({
              name: 'mock-wx-post',
              data: {
                action: 'deleteOne',
                docId: docId
              },
              success: res => {
                this.triggerEvent('deletepost', docId)
              },
              fail: res => {

              },
              complete: res => {
                wx.hideLoading();
              }
            })
          }
        }
      })
    },
    flushComment(postId) {
      if (postId == this.properties.item._id) {
        this.reqCommentList();
      }
    },
    reply(e) {
      let replyUserInfo = e.currentTarget.dataset.replyitem;
      this.triggerEvent('baraction', {
        postId: this.properties.item._id,
        replyUserInfo
      })
    },
    showImg(e) {
      let imgidx = e.target.dataset.imgidx;
      let imgArr = this.properties.item.postImages
      wx.previewImage({
        current: imgArr[imgidx], // 当前显示图片的http链接
        urls: imgArr // 需要预览的图片http链接列表
      })
    },
    reqCommentList() {
      let postId = this.properties.item._id;
      wx.cloud.callFunction({
        name: 'mock-wx-comment',
        data: {
          action: 'getList',
          params: {
            pageNum: 0,
            pageSize: 100
          },
          queryParams: {
            postId: postId
          }
        },
        success: r => {
          let commentlist = r.result.data
          this.setData({
            commentList: commentlist
          })
        }
      })
    },
    cancelLike() {
      wx.showLoading({
        title: '取消',
      })
      /**
       * 取消喜欢
       */
      wx.cloud.callFunction({
        name: 'mock-wx-like',
        data: {
          action: 'deleteByPostId',
          params: {
            postId: this.properties.item._id
          }
        },
        success: r => {
        //  console.log(r)
          this.reqLikeList();
        },
        complete:r=>{
         console.log(r)
         wx.hideLoading();
        }
      })
    },
    reqLikeList() {
      let postId = this.properties.item._id;
      // console.log(postId)
      wx.cloud.callFunction({
        name: 'mock-wx-like',
        data: {
          action: 'getList',
          params: {
            pageNum: 0,
            pageSize: 100
          },
          queryParams: {
            postId: postId
          }
        },
        success: r => {
          // console.log(r.result.data)
          let likelist = r.result.data
          let liked = false
          /**
           * 是否已经配置过喜欢
           */
          for (var i = 0; i < likelist.length; i++) {
            if (likelist[i].openid == this.data.openid) {
              liked = true
            }
          }
          this.setData({
            likeList: likelist,
            liked
          })
        }
      })
    },
    openActionBar() {
      this.setData({
        showBar: true
      })
    },
    /**
     * replace -> remark just fine
     */
    pinglun() {
      console.log('点击评论')
      this.triggerEvent('baraction', {
        postId: this.properties.item._id,
        replyUserInfo: null
      })
    },
    ilike() {
      let openid = app.globalData.openid || wx.getStorageSync('openid')
      let userInfo = app.globalData.userInfo || wx.getStorageSync('userInfo')
      wx.showLoading({
        title: '点赞',
      })
      // this.setData({
      //   vis: true
      // })
      wx.cloud.callFunction({
        name: 'mock-wx-like', 
        data: {
          action: 'saveOne',
          params: {
            postId: this.properties.item._id,
            userInfo
          }
        },
        success: r => {
          console.log(r.result)
          this.reqLikeList();
        },
        fail: r => {
          console.log(r)
        },
        complete: r => {
        wx.hideLoading();
          this.closeActionBar()
        }
      })
    },

    closeActionBar() {
      this.setData({
        showBar: false
      })
    },

    goTo(e){
      let openid=e.currentTarget.dataset.openid
      wx.navigateTo({
        url: '/pages/his/his?openid='+openid,
      })
      console.log(e.currentTarget.dataset.openid);
    }
  }
})