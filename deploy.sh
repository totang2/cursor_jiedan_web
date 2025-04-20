#!/bin/bash

# 停止现有服务
echo "Stopping existing service..."
pm2 stop dev-marketplace || true

# 安装依赖
echo "Installing dependencies..."
npm install --production

# 构建项目
echo "Building project..."
npm run build

# 启动服务
echo "Starting service..."
pm2 start server.js --name dev-marketplace

# 检查服务状态
echo "Checking service status..."
pm2 status

# 保存 PM2 进程列表
echo "Saving PM2 process list..."
pm2 save

echo "Deployment completed!" 