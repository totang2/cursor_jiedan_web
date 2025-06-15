# DevMarketplace - 软件开发人员接单平台

一个连接软件开发人员与项目需求的在线平台，为开发人员提供灵活的工作机会，同时为项目方提供优质的技术人才资源。

## 功能特点

- 多角色用户系统（开发者、客户、管理员）
- 项目发布与浏览
- 智能匹配系统
- 即时通讯
- 安全支付系统
- 评价与信用体系

## 技术栈

- Next.js 14
- React 18
- TypeScript
- Chakra UI
- Prisma
- PostgreSQL
- NextAuth.js
- Socket.io
- Docker

## 本地开发

1. 克隆项目
```bash
git clone https://github.com/totang2/dev-marketplace.git
cd dev-marketplace
```

2. 安装依赖
```bash
npm install
```

3. 设置环境变量
复制 `.env.example` 文件为 `.env` 并填写必要的环境变量：
```bash
cp .env.example .env

# DATABASE_URL=postgresql://yuan:Passvord2025@db:5432/dev_marketplace
DATABASE_URL=postgresql://yuan:Passvord2025@localhost:5432/dev_marketplace
```

4. 初始化数据库
```bash
npx prisma generate
npx prisma db push
```

5. 启动开发服务器
```bash
npm run dev
```

```
# 支付宝产品环境， 不使用dev
npm run build
npm start
```

访问 http://localhost:3000 查看应用。

## Docker 部署

### 1. 环境准备

1. 安装 Docker 和 Docker Compose
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install docker.io docker-compose

# 启动 Docker 服务
sudo systemctl start docker
sudo systemctl enable docker
```

2. 创建 SSL 证书目录
```bash
mkdir ssl
# 将 SSL 证书文件放入 ssl 目录
```

### 2. 配置环境变量

1. 创建生产环境配置文件
```bash
cp .env.production .env
```

2. 编辑 `.env` 文件，填入生产环境的值：
- 数据库连接字符串
- NextAuth 配置
- OAuth 提供商配置
- 支付宝配置
- 邮件服务器配置
- Socket.IO 配置

### 3. 部署步骤

1. 构建并启动服务
```bash
docker-compose up -d --build
```

2. 查看服务状态
```bash
docker-compose ps
```

3. 查看日志
```bash
# 查看所有服务的日志
docker-compose logs -f

# 查看特定服务的日志
docker-compose logs -f app
docker-compose logs -f db
docker-compose logs -f nginx
```

### 4. 维护命令

```bash
# 停止服务
docker-compose down

# 重启服务
docker-compose restart

# 更新代码后重新部署
git pull
docker-compose up -d --build

# 查看容器状态
docker-compose ps

# 进入容器
docker-compose exec app sh
docker-compose exec db psql -U postgres
```

### 5. 数据库备份

```bash
# 备份数据库
docker-compose exec db pg_dump -U postgres devmarketplace > backup.sql

# 恢复数据库
docker-compose exec -T db psql -U postgres devmarketplace < backup.sql
```

### 6. 故障排除

1. 容器无法启动
```bash
# 查看详细日志
docker-compose logs -f

# 检查容器状态
docker-compose ps
```

2. 数据库连接问题
```bash
# 进入数据库容器
docker-compose exec db psql -U postgres

# 检查数据库状态
docker-compose exec db pg_isready
```

3. 权限问题
```bash
# 确保日志目录存在并有正确的权限
mkdir -p logs
chmod 755 logs
```

4. 添加一名管理员
```
psql -d dev_marketplace -U always_day_1 -c "UPDATE \"User\" SET role = 'ADMIN' WHERE email = 'tang7yuan@126.com';"
```

或者

```
psql -d dev_marketplace -U always_day_1

UPDATE "User" SET role = 'ADMIN' WHERE email = 'tang7yuan@126.com';
```

## 环境变量说明

### 必需的环境变量

- `DATABASE_URL`: PostgreSQL 数据库连接字符串
- `NEXTAUTH_URL`: 应用的基础 URL
- `NEXTAUTH_SECRET`: NextAuth.js 的密钥
- `GOOGLE_CLIENT_ID`: Google OAuth 客户端 ID
- `GOOGLE_CLIENT_SECRET`: Google OAuth 客户端密钥
- `ALIPAY_APP_ID`: 支付宝应用 ID
- `ALIPAY_PRIVATE_KEY`: 支付宝私钥
- `ALIPAY_PUBLIC_KEY`: 支付宝公钥
- `EMAIL_SERVER_HOST`: 邮件服务器主机
- `EMAIL_SERVER_PORT`: 邮件服务器端口
- `EMAIL_SERVER_USER`: 邮件服务器用户名
- `EMAIL_SERVER_PASSWORD`: 邮件服务器密码
- `EMAIL_FROM`: 发件人邮箱地址

## 项目结构

```
src/
  ├── components/     # 可复用组件
  ├── pages/         # 页面组件
  ├── lib/           # 工具函数和配置
  ├── styles/        # 全局样式
  ├── types/         # TypeScript 类型定义
  └── utils/         # 辅助函数
```

## 贡献指南

1. Fork 项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情 