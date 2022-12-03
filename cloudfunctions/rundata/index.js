// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
    env: cloud.DYNAMIC_CURRENT_ENV
})

const db=cloud.database();
const _ = db.command;
const data='cloud_wx_rundata'
// 云函数入口函数
exports.main = async (event, context) => {
    const wxContext = cloud.getWXContext()
    const openid=wxContext.OPENID;
    const NewJourney=event.Journey;
    const Newtime=event.time;
    const action=event.action;
    console.log(wxContext);
    // return await db.collection(data).get()
    switch (action) {
        case 'require':{
            return await db.collection(data).where({
                openid:openid
            }).get();
           
        }
        case 'updata':{
            let params = event.params;
            params.openid = openid;
            console.log(params);
            return  await db.collection(data).where({
                openid:openid
            }).update({
                data: params
              });
        }
        case 'add':{
            let params = event.params;
            params.openid = openid;
            console.log(params);
            return await db.collection(data).add({
                data: params
              });
        }
        case 'requireOthers':{
            let params = event.params;
            return await db.collection(data).where({
                openid:params.openid
            }).get();
        }
        default:
            break;
    }

}