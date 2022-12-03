const app = getApp();
var countTooGetLocation = 0;
var total_micro_second = 0;
var Run = 0;
var totalSecond  = 0;
var oriMeters = 0.0;
// 实时位置监听
var point = [];
var that2;
var results;
//距离
var Meter=0;
//路线绘制
function drawline() {
    that2.setData({
       polyline : [{
          points : point,
           color : '#99FF00',
           width : 4,
           dottedLine : false
       }]
    });
}
function distance() {
  var covers = point;
  var len = covers.length;
  if (len>=2) {
    var newCover = {
      latitude: covers[len-1].latitude,
      longitude:  covers[len-1].longitude,
    };
    var oldCover = {
      latitude: covers[len-2].latitude,
      longitude:  covers[len-2].longitude,
    };
    var newMeters = getDistance(oldCover.latitude,oldCover.longitude,newCover.latitude,newCover.longitude)/1000;
    // if (newMeters < 0.0015){
    //   newMeters = 0.0;
    // }
    //计算距离
    oriMeters = oriMeters + newMeters; 
    console.log("newMeters----------")
    console.log(newMeters);
    console.log("oldMeters----------")
    console.log(oriMeters);
    //保留两位小数
    var meters = new Number(oriMeters);
    Meter+=meters;
    var showMeters = meters.toFixed(2);
    //将此标记点加入总标记点对象组中
    //初始化数据
    that2.setData({
      // latitude: res.latitude,
      // longitude: res.longitude,
      markers: [],
      meters:showMeters,
    });
  }
}
//位置的实时监听
function location() {
    var lat, lng;
    let _locationChangeFn = function(res) {
        lat = res.latitude;
        lng = res.longitude;
        point.push({latitude: lat, longitude : lng});
        console.log(point);
        drawline();
        distance();
     }
    wx.startLocationUpdate({
        success: (res) => {
            wx.onLocationChange(_locationChangeFn)
        },
        fail: (err) => {
            // 重新获取位置权限
            wx.openSetting({
                success(res) {
                    res.authSetting = {
                        "scope.userLocation": true
                    }
                }
            })
            reject(err)
        }
    })
}


/* 毫秒级倒计时 */
function count_down(that) {

   if (Run==0) {
     return
   }
    if (countTooGetLocation >= 100) {
      var time = date_format(total_micro_second);
      that.updateTime(time);
    }

    if (countTooGetLocation >= 5000) { 
        // that.getLocation();
        countTooGetLocation = 0;
  	}   
    setTimeout(() => {
      countTooGetLocation += 10;
      total_micro_second += 10;
      count_down(that);
      
    }, 10);
    // if (total_micro_second%1000==0) {
    //   console.log(total_micro_second);
    // }
}


// 时间格式化输出
function date_format(micro_second) {
  	// 秒数
  	var second = Math.floor(micro_second / 1000);
  	// 小时位
  	var hr = Math.floor(second / 3600);
  	// 分钟位
  	var min = fill_zero_prefix(Math.floor((second - hr * 3600) / 60));
  	// 秒位
	var sec = fill_zero_prefix((second - hr * 3600 - min * 60));
	return hr + ":" + min + ":" + sec + " ";
}

//利用经纬度计算距离
function getDistance(lat1, lng1, lat2, lng2) { 
    var dis = 0;
    var radLat1 = toRadians(lat1);
    var radLat2 = toRadians(lat2);
    var deltaLat = radLat1 - radLat2;
    var deltaLng = toRadians(lng1) - toRadians(lng2);
    var dis = 2 * Math.asin(Math.sqrt(Math.pow(Math.sin(deltaLat / 2), 2) + Math.cos(radLat1) * Math.cos(radLat2) * Math.pow(Math.sin(deltaLng / 2), 2)));
    return dis * 6378137;

    function toRadians(d) {  return d * Math.PI / 180;}
} 

function fill_zero_prefix(num) {
	return num < 10 ? "0" + num : num
}

//****************************************************************************************
//****************************************************************************************

Page({
  data: {
    // clock: '',
    // isLocation:false,
    latitude: 0,
    longitude: 0,
    markers: [],
    covers: [],
    polyline : [],
    meters: 0,
    time: "0:00:00",
    run:"开始",
    isrun:0,
    isplay:0,
    isedn:0,
  },

//****************************
  onLoad:function(options){
    // 页面初始化 options为页面跳转所带来的参数
    this.loading();
    that2 = this;
    wx.getLocation({
       type: 'gcj02',
        success : function (res) {
            that2.setData({
                longitude : res.longitude,
                latitude : res.latitude,
            });
        }
    });
  },
  //****************************
  //提示文本
  loading(){
    wx.showToast({
      title: '单击开始于暂停，长按结束运动',
      icon: 'none',
      duration: 2000
    })
    setTimeout(function () {
      wx.hideToast()
    }, 2000)
  },

  openLocation:function (){
    wx.getLocation({
      type: 'gcj02', // 默认为 wgs84 返回 gps 坐标，gcj02 返回可用于 wx.openLocation 的坐标
      success: function(res){
          wx.openLocation({
            latitude: res.latitude, // 纬度，范围为-90~90，负数表示南纬
            longitude: res.longitude, // 经度，范围为-180~180，负数表示西经
            scale: 28, // 缩放比例
          })
      },
    })
  },
//控制音乐
  ctrlMusic: function () {
    const backgroundAudioManager = wx.getBackgroundAudioManager()
    backgroundAudioManager.title = 'New Life'
    backgroundAudioManager.epname = 'New Life'
    backgroundAudioManager.singer = 'Peter Jeremias'
    backgroundAudioManager.coverImgUrl = "https://ae01.alicdn.com/kf/Ud08f63ccb57b41988e5921036e61bca2r.jpg"
    backgroundAudioManager.src = "https://codehhr.gitee.io/musics/new_life.mp3"
    // 播放
    if (!this.data.isplay) {
        this.setData({
            isplay: !this.data.isplay,
        })
        console.log("music playing !")
        // 结束时循环
        backgroundAudioManager.onEnded(() => {
            console.log("music end !")
            this.setData({
                isplay: !this.data.isplay
            })
            console.log("music replay !")
            this.ctrlMusic()
        })
    }
    // 暂停
    else {
        this.setData({
            isplay: !this.data.isplay,
        })
        backgroundAudioManager.pause();
        backgroundAudioManager.onPause(() => {
            console.log("music stop !");
        });
    }
},
//****************************
  Run(){
    var run="";
    if (Run==0) {
      run="暂停";
      Run+=1;
      console.log('start');
      location();
    }else{
      run="开始";
      Run-=1;
      console.log('end');
      wx.offLocationChange();
    }
    count_down(this);
    this.setData({
      run:run,
      isrun:Run
    })
  },

  end(){
     if (Run==1) {
      var run="已结束";
      Run-=1;
      console.log('end');
      wx.offLocationChange();
      this.setData({
        isedn:1,
        run:run,
        isrun:Run
      })
      this.updating();
     }
  },
  
  updating(){
    wx.showModal({
      title: '提醒',
      content: '是否保存数据',
      success: r => {
        if (r.confirm) {
          /**
           * 更新
           */
          if(wx.getStorageSync('userInfo')!=''){
            wx.showLoading({
              title: '保存中',
            })
            this.getdata();
            // this.processingdata();
            wx.hideLoading();
          }
          else{
            wx.showToast({
              title: '请先登录',
              icon: 'none',
              duration: 2000
            })
            setTimeout(function () {
              wx.hideToast()
            }, 2000)
          }
        
        }
      }
    })
  },
  //获取数据
  getdata(){
    wx.cloud.callFunction({
      name:'rundata',
      data:{
        action:'require', 
      },
    }).then(res=>{
      let oldDistance=res.result.data[0].distance;
      let oldTime=res.result.data[0].time;
      // console.log(Meter);
      // Meter+=0.1;
      oldDistance+=Meter;
      oldTime=parseFloat(oldTime);
      oldTime+=total_micro_second/60000;
      oldTime=oldTime.toFixed(2);
      console.log(oldDistance);
      wx.cloud.callFunction({
        name:'rundata',
        data:{
          action:'updata', 
          params:{
            distance:oldDistance,
            time:oldTime
          }
        },
        success: r=>{
          console.log(r.result);
        }
      })
    })
  },
//操作数据
  processingdata(){
    
  },

  updateTime:function (time) {
    var data = this.data;
    data.time = time;
    this.data = data;
    this.setData ({
      time : time,
    })
  },

  showEditPage() {
    if(wx.getStorageSync('userInfo')!=''){
      wx.navigateTo({
        url: '/pages/post/post',
      })
    }
    else{
      wx.showToast({
        title: '请先登录',
        icon: 'none',
        duration: 2000
      })
      setTimeout(function () {
        wx.hideToast()
      }, 2000)
    }
  },
})



