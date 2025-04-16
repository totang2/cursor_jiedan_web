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

## 开发环境设置

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

访问 http://localhost:3000 查看应用。

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

## 部署

1. 构建项目
```bash
npm run build
```

2. 启动生产服务器
```bash
npm start
```

## 贡献指南

1. Fork 项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情 