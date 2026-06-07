# 慧学习 WiseLearn

> 交互式知识学习网页应用 - 上传学习资料，AI 智能生成树形知识大纲与深度解读

[![Node.js](https://img.shields.io/badge/Node.js-≥20-339933?logo=node.js&logoColor=white)](https://nodejs.org)
[![Express](https://img.shields.io/badge/Express-4.x-000000?logo=express&logoColor=white)](https://expressjs.com)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![AI](https://img.shields.io/badge/AI-Qwen3.6--27B-orange)](https://github.com/QwenLM/Qwen)

## 📖 项目简介

**慧学习 WiseLearn** 是一个基于大语言模型的交互式知识学习平台。用户上传 PDF、Word、PPT、Markdown 文件或网页链接，系统会自动解析内容，通过 Qwen3.6-27B 大模型生成结构化的树形知识大纲，并为每个知识点提供**专业解读**和**寓言解读**两种形式的学习内容。

### ✨ 核心特性

- 📁 **多格式支持** — PDF / Word (.docx) / PPT (.pptx) / Markdown / 网页链接，单次最多 10 个文件
- 🌳 **树形知识大纲** — AI 自动生成多层级知识结构，支持展开/收起
- 📘📖 **双视角解读** — 每个知识点同时提供「专业解读」（严谨学术话术）和「寓言解读」（趣味故事形式）
- 💡 **交互式概念解释** — 点击内容中的专业概念，侧边栏弹出 AI 详细解释
- 🎨 **清爽响应式 UI** — 简洁大气的界面设计，适配电脑端
- 📥 **学习内容导出** — 一键导出为独立 HTML 文件，方便分享与离线学习
- ⚡ **CORS 安全代理** — 后端统一代理 LLM API 调用，避免跨域问题

## 🏗️ 项目架构

```
WiseLearn/
├── package.json              # 项目依赖与启动脚本
├── server.js                 # Express 后端服务（文件解析 + LLM 代理）
├── public/
│   ├── index.html            # 📤 上传/解析页面
│   └── learn.html            # 📚 独立学习页面
├── .gitignore                # Git 忽略配置
└── README.md                 # 本文件
```

### 技术栈

| 层级 | 技术 |
|------|------|
| 前端 | 纯 HTML / CSS / JavaScript（零框架依赖） |
| 后端 | Node.js + Express + Multer |
| 文件解析 | `pdf-parse`（PDF） / `mammoth`（Word） / `officeparser`（PPT） / `marked`（Markdown） / `axios + cheerio`（网页） |
| 大模型 | Qwen3.6-27B（通过后端代理） |
| 数据存储 | 浏览器 `localStorage`（页面间传递学习内容） |

## 🚀 快速开始

### 环境要求

- **Node.js** ≥ 20
- **npm** ≥ 9
- 现代浏览器（Chrome / Edge / Firefox / Safari）

### 安装与启动

```bash
# 1. 克隆仓库
git clone https://github.com/prodong9527/WiseLearn.git
cd WiseLearn

# 2. 安装依赖
npm install

# 3. 启动服务
npm start

# 4. 浏览器访问
# 打开 http://localhost:3000
```

### 开发模式（自动重启）

```bash
npm run dev
```

## 📱 使用流程

```
┌─────────────────┐         ┌──────────────────┐         ┌─────────────────┐
│  📤 index.html  │         │  🤖 后端解析     │         │ 📚 learn.html   │
│   上传页面      │  ───►   │   - 文件解析     │  ───►   │  学习页面       │
│                 │         │   - LLM 生成大纲 │         │                 │
│  - 拖拽/选择    │         │   - 节点内容生成 │         │  - 树形大纲     │
│  - URL 添加     │         │   - 进度可视化   │         │  - 双视角解读   │
└─────────────────┘         └──────────────────┘         │  - 概念弹出     │
                                                         │  - 节点导航     │
                                                         └─────────────────┘
```

### 详细步骤

1. **打开上传页** → `http://localhost:3000/`
2. **上传资料**：
   - 拖拽文件到上传区，或点击选择
   - 也可在 URL 输入框粘贴网页链接
   - 单次最多 10 个文件/链接
3. **开始解析** → 点击"🚀 开始智能解析"
4. **查看进度** → 4 步实时进度展示
   - ① 解析文件内容
   - ② 生成知识大纲
   - ③ 生成专业解读与寓言故事
   - ④ 准备学习页面
5. **进入学习** → 解析完成后点击"📖 进入学习页面"
6. **学习交互**：
   - 左侧：树形大纲，点击展开/收起
   - 右侧：切换「专业解读」「寓言解读」
   - 点击 **蓝色虚线概念** → 侧边栏弹出 AI 详细解释
   - 底部：「上一个/下一个」节点导航
7. **导出内容** → 顶部"📥 导出"按钮，生成独立 HTML 文件

## 🔌 API 文档

| 端点 | 方法 | 说明 |
|------|------|------|
| `/api/parse-file` | POST | 上传并解析单个文件（PDF/Word/PPT/Markdown） |
| `/api/parse-url` | POST | 抓取并解析网页链接内容 |
| `/api/parse-files` | POST | 批量上传并解析（最多 10 个文件） |
| `/api/chat` | POST | LLM API 代理（前端调用入口） |
| `/api/health` | GET | 服务健康检查 |
| `/api/formats` | GET | 获取支持的文件格式列表 |

### 示例：文件解析

```bash
curl -X POST -F "file=@example.pdf" http://localhost:3000/api/parse-file
```

### 示例：网页解析

```bash
curl -X POST -H "Content-Type: application/json" \
  -d '{"url": "https://example.com/article"}' \
  http://localhost:3000/api/parse-url
```

## ⚙️ 配置说明

### 修改大模型 API

编辑 `server.js` 中的 LLM 配置：

```javascript
const LLM_API_KEY = 'your-api-key';
const LLM_API_URL = 'https://your-llm-endpoint/v1';
```

### 修改上传限制

编辑 `server.js` 中的 Multer 配置：

```javascript
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 50 * 1024 * 1024,  // 50MB
        files: 10                     // 最多 10 个
    }
});
```

## 🛠️ 开发指南

### 添加新的文件类型支持

1. 在 `server.js` 中安装对应的解析库
2. 在 `parseFile` 函数的 `switch` 中添加 case
3. 实现对应的解析函数

例如添加 `.epub` 支持：

```javascript
case '.epub':
    content = await parseEpub(filePath);
    break;
```

### 自定义解读风格

修改 `public/index.html` 中的 `generateNodeContent` 提示词，调整专业解读与寓言解读的风格。

## 🐛 常见问题

**Q: 启动后端口被占用？**
A: 设置环境变量 `PORT=3001` 使用其他端口

**Q: 大文件解析失败？**
A: 调整 server.js 中 multer 的 `fileSize` 限制

**Q: LLM 调用超时？**
A: 默认 60 秒超时，可在 `server.js` 的 `/api/chat` 路由调整

**Q: 网页解析返回空内容？**
A: 目标网站可能需要 JavaScript 渲染或禁止爬虫

## 📝 License

[MIT](LICENSE) © 慧学习 WiseLearn

## 🙏 致谢

- [Qwen](https://github.com/QwenLM/Qwen) — 通义千问大模型
- [pdf-parse](https://www.npmjs.com/package/pdf-parse) — PDF 解析
- [mammoth](https://www.npmjs.com/package/mammoth) — Word 解析
- [officeparser](https://www.npmjs.com/package/officeparser) — PPT 解析
- [marked](https://marked.js.org/) — Markdown 解析

---

<p align="center">Made with ❤️ by 慧学习 WiseLearn Team</p>
