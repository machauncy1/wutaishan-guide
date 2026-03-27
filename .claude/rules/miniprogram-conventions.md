---
paths:
  - "miniprogram/**/*.ts"
  - "miniprogram/**/*.js"
---
# 小程序开发规范

- 使用 Page() / Component() 注册，不使用框架
- 全局变量通过 wx 命名空间访问（wx, App, Page, Component, getApp）
- 数据库操作通过 miniprogram/services/ 下的服务层
- 导游数据有本地缓存机制，注意缓存一致性
- 编译目标 ES2017 + CommonJS
- 不要引入 npm 包，除非已配置 miniprogram_npm 构建
