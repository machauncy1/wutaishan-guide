---
paths:
  - "cloudfunctions/**/*.js"
---
# 云函数开发规范

- 使用 JavaScript（非 TypeScript），运行时 wx-server-sdk
- 遵循 Repository + Handler + Service 分层架构
- Repository 层负责数据库操作
- Handler 层负责请求路由和参数校验
- Service 层负责业务逻辑
- JWT 用于 H5 端认证，不要暴露内部错误信息给客户端
- 每个云函数独立目录，有自己的 package.json 和 node_modules
