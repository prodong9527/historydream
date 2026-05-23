# 部署到 Vercel

## 前置要求

1. GitHub 账号
2. Vercel 账号 (vercel.com)
3. 后端已部署到 Render 或其他可访问的服务器

## 步骤 1: 创建 GitHub 仓库

```bash
cd frontend
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/你的用户名/historydream-frontend.git
git push -u origin main
```

## 步骤 2: 部署到 Vercel

1. 访问 [vercel.com](https://vercel.com) 并登录
2. 点击 "Add New Project"
3. 选择 "Import Git Repository"
4. 选择刚创建的 GitHub 仓库
5. 配置构建设置:
   - Framework Preset: `Vite`
   - Build Command: `npm run build`
   - Output Directory: `dist`
6. 点击 "Deploy"

## 步骤 3: 配置环境变量 (可选)

如果后端 API 地址需要修改，可以在 Vercel 项目设置中添加:

- `VITE_API_BASE`: 后端 API 地址

## 步骤 4: 验证部署

部署完成后，访问 Vercel 提供的 URL 即可使用应用。

## 注意事项

- Vercel 在国内访问可能受限，建议配合国内 CDN 使用
- 图片生成等 AI 功能依赖后端服务