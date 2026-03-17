# 云函数目录

当前项目已将数据查询迁移到小程序端直接调用 `wx.cloud.database()`，不再依赖云函数。

数据初始化使用 `scripts/seed.js` 通过 `@cloudbase/node-sdk` 直接操作数据库。

如需新建云函数，可参考以下模板：

```
cloudfunctions/
  myFunction/
    index.js
    package.json
```

**index.js**

```js
const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const db = cloud.database();

exports.main = async (event) => {
  try {
    // your logic here
    return { success: true, data: null };
  } catch (e) {
    return { success: false, errMsg: e.message };
  }
};
```

**package.json**

```json
{
  "name": "myFunction",
  "version": "1.0.0",
  "main": "index.js",
  "dependencies": {
    "wx-server-sdk": "~2.6.3"
  }
}
```

部署方式：微信开发者工具中右键云函数目录 → "上传并部署：云端安装依赖"
