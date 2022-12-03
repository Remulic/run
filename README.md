跑步记录用的

毕设所用，先传个老早前的初始版占个位

微信小程序上已上线，服务器不一定在线
=======
# 安装部署

1. 修改小程序配置文件`project.config.json`

```json
"appid": "",
"projectname": ""
```

2. 修改项目配置文件
   
   > `core/config.js`
   
   ```js
   module.exports = {
     //云环境ID
     CloudID:'',
     //文本内容安全校验 是否开启
     ContentSafe:true,
     //朋友圈查询 页面大小 -- 建议配置 20 以下
     PageSize:20
   }
   ```

3. 新建`cloud_wx_post`  ,`cloud_wx_like` ,`cloud_wx_comment`，`cloud_wx_rundata`，云数据库集合，修改集合权限为 **所有用户可读，仅创建者可读写**

4. 上传并部署全部云函数

5. 重新编译项目即可

6. 相关地图api需要自己手动申请
>>>>>>> Stashed changes
