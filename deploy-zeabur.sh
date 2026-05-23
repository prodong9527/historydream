#!/bin/bash
# 部署到 Zeabur 脚本

echo "=== 部署 HistoryDream 到 Zeabur ==="

# 检查是否安装 gh
if ! command -v gh &> /dev/null; then
    echo "错误: 需要安装 GitHub CLI (gh)"
    echo "安装命令: brew install gh"
    exit 1
fi

# 检查 GitHub 登录状态
if ! gh auth status &> /dev/null; then
    echo "错误: 请先登录 GitHub"
    echo "运行: gh auth login"
    exit 1
fi

echo ""
echo "1. 部署后端..."
cd backend
rm -rf .git 2>/dev/null
git init
git add .
git commit -m "HistoryDream Backend - $(date)"
git branch -M main
gh repo create historydream-backend --public --push --source=. 2>/dev/null || echo "仓库可能已存在"
cd ..

echo ""
echo "2. 部署前端..."
cd frontend
rm -rf .git 2>/dev/null
git init
git add .
git commit -m "HistoryDream Frontend - $(date)"
git branch -M main
gh repo create historydream-frontend --public --push --source=. 2>/dev/null || echo "仓库可能已存在"
cd ..

echo ""
echo "=== 完成 ==="
echo "请按以下步骤继续："
echo "1. 访问 https://zeabur.com"
echo "2. 创建项目，导入 historydream-backend"
echo "3. 添加环境变量 DASHSCOPE_API_KEY"
echo "4. 部署后端后，获取 URL"
echo "5. 添加 historydream-frontend 服务"
echo "6. 设置 VITE_API_BASE 环境变量为后端 URL"