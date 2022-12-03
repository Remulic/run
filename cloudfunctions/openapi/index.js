const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})


// 云函数入口函数
exports.main = async (event, context) => {
  // console.log(event)
  switch (event.action) {
    case 'getWXACode': {
      return getWXACode(event)
    }
    case 'getOpenData': {
      return getOpenData(event)
    }
    case 'getPhoneNum': {
      return getPhoneNum(event)
    }
    case 'msgSecCheck': {
      return msgSecCheck(event)
    }
    case 'imgSecCheck': {
      return imgSecCheck(event)
    }
    case 'submitPages': {
      return submitPages(event)
    }
    default: {
      return
    }
  }
}
//获取小程序码
async function getWXACode(event) {
  console.log(event.url)
  // 此处将获取永久有效的小程序码，并将其保存在云文件存储中，最后返回云文件 ID 给前端使用
  const wxacodeResult = await cloud.openapi.wxacode.get({
    path: event.url || 'pages/index/index',
  })
  const fileExtensionMatches = wxacodeResult.contentType.match(/\/([^\/]+)/)
  const fileExtension = (fileExtensionMatches && fileExtensionMatches[1]) || 'jpg'
  const uploadResult = await cloud.uploadFile({
    // 云文件路径，此处为演示采用一个固定名称
    cloudPath: `wxCode/wxCode${Math.random() * 9999999}.${fileExtension}`,
    // 要上传的文件内容可直接传入图片 Buffer
    fileContent: wxacodeResult.buffer,
  })
  if (!uploadResult.fileID) {
    throw new Error(`上传失败，文件为空，存储服务器状态代码为空 ${uploadResult.statusCode}`)
  }
  return uploadResult.fileID
}
// 获取openid
async function getOpenData(event) {
  // 需 wx-server-sdk >= 0.5.0
  const wxContext = cloud.getWXContext()
  return {
    event,
    openid: wxContext.OPENID,
    appid: wxContext.APPID,
    unionid: wxContext.UNIONID,
  }
}
//获取手机号
async function getPhoneNum(event){
  let res = await cloud.getOpenData({
    list:[event.CloudID]
  })
  return res;
}
// 检测文本是否合规
async function msgSecCheck(event) {
  // 需 wx-server-sdk >= 0.5.0
  try {
    console.log('待检测文本:' + event.content);
    let result = await cloud.openapi.security.msgSecCheck({
      content: event.content
    })
    console.log('result:' + JSON.stringify(result));
    if (result && result.errCode.toString() === '87014') {
      return {
        code: 300,
        msg: '内容含有违法违规内容',
        data: result
      } //
    } else {
      return {
        code: 200,
        msg: 'ok',
        data: result
      }
    }
  } catch (err) {
    if (err.errCode.toString() === '87014') {
      return {
        code: 300,
        msg: '内容含有违法违规内容',
        data: err
      } //
    }
    return {
      code: 400,
      msg: '调用security接口异常',
      data: err
    }
  }
}
// 检测图片是否合规
async function imgSecCheck(event) {
  return cloud.openapi.security.imgSecCheck({
    media: {
      contentType: event.contentType,
      value: Buffer.from(event.value)
    }
  })
}
// 收录页面
async function submitPages(event) {
  return cloud.openapi.search.submitPages({
    pages: [{
      path: event.path,
      query: event.query
    }]
  })
}
//获取日期
function getDateTime(sj) {
  var now = new Date(sj * 1000);
  var year = now.getFullYear();
  var month = now.getMonth() + 1;
  var date = now.getDate();
  var hour = now.getHours();
  var minute = now.getMinutes();
  // var second = now.getSeconds();
  return year + "年" + month + "月" + date + "日";
}