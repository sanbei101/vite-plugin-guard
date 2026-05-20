# 简易的前端网站密码保护器

## 介绍

通过在 Vite 项目中使用 `vite-plugin-guard` 插件,可以轻松地为您的前端网站添加一个简单的密码保护层。这个插件会在用户访问网站时显示一个密码输入界面,只有输入正确的密码后才能访问网站内容。

## 安装

```bash
pnpm add vite-plugin-guard
```

## 使用

在 `vite.config.ts` 文件中引入并使用 `vite-plugin-guard` 插件:

```ts
import { defineConfig } from "vite";
import guard from "vite-plugin-guard";
export default defineConfig({
  plugins: [
    guard({
      password: "123", // 设置访问密码
    }),
  ],
});
```
