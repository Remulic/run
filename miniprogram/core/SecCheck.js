const config = require('config')
function msgSecCheck(content){
  return new Promise(function(resolve,reject){
    if(config.ContentSafe){
      wx.cloud.callFunction({
        name:'openapi',
        data:{
          action:'msgSecCheck',
          content:content
        },
        success:res=>{
          resolve(res)
        },
        fail:res=>{
          reject('请求异常')
        }
      })
    }else{
      resolve({
        result:{
          code:200,
          msg:'正常'
        }
      }) 
    }
    
  })
  
  
}
module.exports={
  msgSecCheck:msgSecCheck
}