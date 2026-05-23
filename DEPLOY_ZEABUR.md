# Zeabur 全栈部署指南

## 项目结构

```
HistoryDream/
├── frontend/     # React 前端 → 部署到 Zeabur
└── backend/       # FastAPI 后端 → 部署到 Zeabur
```

## 步骤 1: 推送代码到 GitHub

### 推送后端
```bash
cd backend
git init
git add .
git commit -m "HistoryDream Backend"
gh repo create historydream-backend --public --push
```

### 推送前端
```bash
cd ../frontend
git init
git add .
git commit -m "HistoryDream Frontend"
gh repo create historydream-frontend --public --push
```

## 步骤 2: 在 Zeabur 部署

1. 访问 [zeabur.com](https://zeabur.com)，用 GitHub 登录
2. 点击 **Create Project**
3. 点击 **Deploy from GitHub**
4. 搜索并选择 `historydream-backend`
5. 配置服务：
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port 8000`
6. 添加环境变量：
   - `DASHSCOPE_API_KEY` = 你的阿里云 DashScope API Key
7. 等待部署完成，复制服务 URL（格式：`https://xxx-xxxx.zeabur.app`）

8. 添加前端服务：
   - 点击 **Add Service** → **Deploy from GitHub**
   - 选择 `historydream-frontend`
   - **Build Command**: `npm install && npm run build`
   - **Output Directory**: `dist`
   - 添加环境变量：`VITE_API_BASE` = 后端 URL（去掉末尾斜杠）

9. 等待前端部署完成

## 或前端部署到 Vercel

如果只想用 Zeabur 部署后端，前端用 Vercel：

1. 只推送 `frontend` 目录到 GitHub
2. 在 Vercel 导入项目
3. 设置：
   - Framework: Vite
   - Build: `npm run build`
   - Output: `dist`
   - 环境变量: `VITE_API_BASE` = 你的 Zeabur 后端 URL

## 验证部署

部署完成后，访问前端 URL 测试：
- 主题选择
- 故事生成
- 图片生成
- 收藏功能