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
const LIKE = 'cloud_wx_like';
const PAGE_SIZE = 20
const LIKE_TABLE = 'LIKE'
// 云函数入口函数
exports.main = async (event, context) => {
  let action = event.action
  const wxContext = cloud.getWXContext()
  let openid = wxContext.OPENID
  switch (action) {
    case 'saveOne': {
      let params = event.params;
      params.openid = openid
      params.created_time = dayjs(new Date()).format('YYYY-MM-DD hh:mm:ss');
      params.updated_time = dayjs(new Date()).format('YYYY-MM-DD hh:mm:ss');
      let execRes = await db.collection(LIKE).add({
        data: params
      })
      return ResponseDTO.succMsg('新建成功');
    }
    case 'deleteByPostId':{
      let postId = event.params.postId;
      let execRes = await db.collection(LIKE).where({
        postId,
        openid
      }).remove();
      return ResponseDTO.succMsg('删除成功');
      break
    }
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
      const P_SIZE = params.pageSize || PAGE_SIZE
      let execRes = await db.collection(LIKE).where(queryParams).skip(P_SIZE * pageNum).orderBy('created_time', 'asc').limit(PAGE_SIZE).get();
      /**
       * 封包结果
       */
      let queryRes = execRes.data;
      return ResponseDTO.succData(queryRes);
      break
    }
    /**
     * @Deprecated
     */
    case 'query': {
      let data = event.data
      return await db.collection('LIKE').where(data).orderBy('date', 'desc').get()
      break
    }
    case 'deleteOne':{
      let docId = event.docId;
      /**
       * 调用云函数清理对应的点赞评论信息
       */
      let execRes = await db.collection(LIKE).doc(docId).remove();
      return ResponseDTO.succMsg("删除成功!");
      break
    }
    /**
     * @Deprecated
     */
    case 'delete': {
      return await db.collection('LIKE').where({
        openid: openid,
        postid: event.data.postid
      }).remove();
      break
    }
  }
}