---
paths:
  - "web/src/**/*.ts"
  - "web/src/**/*.tsx"
---
# Web 端开发规范

- 使用 React 函数组件 + Hooks
- 路由配置在 web/src/router/ 下
- API 调用统一通过 web/src/api/client.ts，不要直接 fetch
- 样式使用 Tailwind CSS utility classes，避免内联 style
- 页面组件放 web/src/pages/，通用组件放 web/src/components/
- 服务层逻辑放 web/src/services/
- 日期工具使用 web/src/utils/date.ts 中的方法
