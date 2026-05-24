#!/bin/bash
# HistoryDream VPS 部署脚本

set -e

echo "=========================================="
echo "  星河予梦 - VPS 部署脚本"
echo "=========================================="

# 颜色
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# 检测系统
if [ -f /etc/debian_version ]; then
    SYSTEM="debian"
elif [ -f /etc/centos-release ]; then
    SYSTEM="centos"
elif [ -f /etc/ubuntu-release ]; then
    SYSTEM="ubuntu"
else
    echo -e "${YELLOW}未检测到支持的操作系统${NC}"
    exit 1
fi

echo -e "${GREEN}检测到系统: $SYSTEM${NC}"

# 更新系统
echo -e "${GREEN}更新系统...${NC}"
if [ "$SYSTEM" == "debian" ] || [ "$SYSTEM" == "ubuntu" ]; then
    apt update && apt upgrade -y
else
    yum update -y
fi

# 安装 Python
echo -e "${GREEN}安装 Python...${NC}"
if [ "$SYSTEM" == "debian" ] || [ "$SYSTEM" == "ubuntu" ]; then
    apt install -y python3 python3-pip python3-venv nginx certbot python3-certbot-nginx
else
    yum install -y python3 python3-pip nginx certbot
fi

# 创建应用目录
APP_DIR="/var/www/historydream"
echo -e "${GREEN}创建应用目录: $APP_DIR${NC}"
mkdir -p $APP_DIR

# 复制代码（需要先通过 git clone 或 scp 上传）
if [ ! -f "$APP_DIR/main.py" ]; then
    echo -e "${YELLOW}请先上传代码到 $APP_DIR${NC}"
    echo "可以通过以下方式："
    echo "1. git clone https://github.com/prodong9527/historydream.git $APP_DIR"
    echo "2. scp -r ./backend ./frontend $APP_DIR/"
    exit 1
fi

# 创建虚拟环境
echo -e "${GREEN}创建 Python 虚拟环境...${NC}"
cd $APP_DIR/backend
python3 -m venv venv
source venv/bin/activate

# 安装依赖
echo -e "${GREEN}安装 Python 依赖...${NC}"
pip install --upgrade pip
pip install -r requirements.txt
pip install gunicorn

# 创建 .env 文件
if [ ! -f "$APP_DIR/backend/.env" ]; then
    echo -e "${YELLOW}请设置环境变量 DASHSCOPE_API_KEY${NC}"
    read -p "请输入 DASHSCOPE_API_KEY: " API_KEY
    echo "DASHSCOPE_API_KEY=$API_KEY" > $APP_DIR/backend/.env
fi

# 创建 systemd 服务
echo -e "${GREEN}创建 systemd 服务...${NC}"
cat > /etc/systemd/system/historydream.service <<EOF
[Unit]
Description=HistoryDream API
After=network.target

[Service]
User=www-data
Group=www-data
WorkingDirectory=$APP_DIR/backend
Environment="PATH=$APP_DIR/backend/venv/bin"
ExecStart=$APP_DIR/backend/venv/bin/gunicorn -w 2 -k uvicorn.workers.UvicornWorker main:app --bind 127.0.0.1:8000
Restart=always

[Install]
WantedBy=multi-user.target
EOF

# 启动后端服务
systemctl daemon-reload
systemctl enable historydream
systemctl start historydream

# 配置 Nginx
echo -e "${GREEN}配置 Nginx...${NC}"
cat > /etc/nginx/sites-available/historydream <<EOF
server {
    listen 80;
    server_name _;

    root $APP_DIR/frontend/dist;
    index index.html;

    # 前端静态文件
    location / {
        try_files \$uri \$uri/ /index.html;
    }

    # API 反向代理
    location /api/ {
        proxy_pass http://127.0.0.1:8000/;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    }
}
EOF

# 启用站点
ln -sf /etc/nginx/sites-available/historydream /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx

echo ""
echo -e "${GREEN}=========================================="
echo "  部署完成！"
echo "=========================================="
echo ""
echo "后端服务: http://127.0.0.1:8000"
echo "前端目录: $APP_DIR/frontend/dist"
echo ""
echo "常用命令:"
echo "  systemctl status historydream  # 查看状态"
echo "  systemctl restart historydream  # 重启服务"
echo "  journalctl -u historydream -f   # 查看日志"
echo ""