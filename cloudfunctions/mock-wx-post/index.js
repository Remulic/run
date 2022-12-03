// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})
const db = cloud.database();
const _ = db.command;
const dayjs = require('dayjs');
const ResponseDTO = require('./res');
/** 信息记录集合 */
const POST = 'cloud_wx_post';
const PAGE_SIZE = 20
// 云函数入口函数
exports.main = async (event, context) => {
  let action = event.action
  const wxContext = cloud.getWXContext()
  let openid = wxContext.OPENID
  switch (action) {
    case 'saveOne': {
      let data = event.data
      let params = event.params;
      // console.log(data)
      params.openid = openid
      params.created_time = dayjs(new Date()).format('YYYY-MM-DD HH:mm:ss');
      params.updated_time = dayjs(new Date()).format('YYYY-MM-DD HH:mm:ss');
      let execRes = await db.collection(POST).add({
        data:params
      })
      console.log(execRes)
      return ResponseDTO.succMsg("新建成功");
      break
    }
    /**
     * 获取发送的消息列表
     */
    case 'getList': {
      let params = event.params;
      // 获取页码
      let pageNum = params.pageNum || 0;
      /**
       * 构建模糊请求参数
       */
      let queryParams = event.queryParams;
      /**
       * 执行结果
       */
      let execRes = await db.collection(POST).where(queryParams).skip(PAGE_SIZE * pageNum).orderBy('created_time', 'desc').limit(PAGE_SIZE).get();
      /**
       * 封包结果
       */
      let queryRes = execRes.data;
      return ResponseDTO.succData(queryRes);
      break
    }
    /**
     * 删除某个元素
     */
    case 'deleteOne': {
      let docId = event.docId;
      /**
       * 调用云函数清理对应的点赞评论信息
       */
      cloud.callFunction({
        name:'mock-wx-like',
        data:{
          action:'deleteByPostId',
          params:{
            postId:docId
          }
        }
      })
      cloud.callFunction({
        name:'mock-wx-comment',
        data:{
          action:'deleteByPostId',
          params:{
            postId:docId
          }
        }
      })
      let execRes = await db.collection(POST).doc(docId).remove();
      return ResponseDTO.succMsg("删除成功!");
      break
    }
  }
}