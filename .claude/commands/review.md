---
description: 合并前审查当前分支的代码变更
---
## 变更文件列表

!`git diff --name-only main...HEAD`

## 详细差异

!`git diff main...HEAD`

请审查以上变更，重点关注：
1. 代码质量和规范一致性
2. 类型安全（TypeScript strict mode）
3. 安全漏洞（密钥泄露、XSS、注入等）
4. 边界情况和错误处理
5. 三端共享类型的兼容性

请针对每个文件给出具体、可操作的反馈。
