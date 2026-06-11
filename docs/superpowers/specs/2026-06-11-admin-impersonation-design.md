# 管理员模拟登录 — 设计规格说明

> 2026-06-11 | 版本 1.0

## 目标

管理员可以跳过密码验证，以任意用户身份登录网站。用于排查用户问题、管理内容。

## 技术方案

### 数据模型变更

User 表新增 `role` 字段：

```
User
  + role  String  @default("user")  // "user" | "admin"
```

### API

- `POST /api/admin/impersonate` — body: `{ username: "目标用户名" }`
  - 验证当前用户 role === "admin" → 查找目标用户 → 用 NextAuth JWT 回调生成目标 token → set-cookie → 返回 200
  - 非 admin → 403
  - 用户不存在 → 404

### 前端

- NavBar 下拉菜单：当前用户是 admin 时，显示「切换用户」
- 点「切换用户」→ 弹出简单 input 框 → 输入用户名 → 确认 → 调用 API → 刷新页面

### 初始化

- Vercel 部署后，在 DBeaver 中手动把自己设为 admin：
  ```sql
  UPDATE "User" SET role = 'admin' WHERE username = 'zy';
  ```
