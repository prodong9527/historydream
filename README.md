# 星河予梦 (HistoryDream)

一个基于真实历史事件的睡前故事应用。

## 项目结构

```
├── frontend/     # React + Vite 前端 (部署到 Vercel)
└── backend/      # FastAPI 后端 (部署到 Render)
```

## 部署指南

### 前端 (Vercel)

1. 将 `frontend/` 目录推送到 GitHub
2. 在 Vercel 导入项目
3. 构建命令: `npm run build`
4. 输出目录: `dist`

### 后端 (Render)

1. 将 `backend/` 目录推送到独立的 GitHub 仓库
2. 在 [Render](https://render.com) 创建 Web Service
3. 设置环境变量: `DASHSCOPE_API_KEY`
4. 拉取命令: `pip install -r requirements.txt`

## 本地开发

```bash
# 后端
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000

# 前端
cd frontend
npm install
npm run dev
```

## API Endpoints

- `GET /api/themes` - 获取主题
- `GET /api/generate?theme=xxx` - 生成故事
- `GET /api/builtin` - 获取内置故事
- `GET /api/history` - 获取收藏历史
- `POST /api/stories/{id}/save` - 收藏故事
- `DELETE /api/history/{id}` - 删除收藏