# history
1. multi-python-version install

download installer to install multi-version

2. 
```brew install postgresql@14

3. brew services start postgresql@14

createdb jiedan
psql jiedan
create user yuan with password 'Passvord2025' 

grant all provileges on database jiedan to yuan
```

看起来您遇到了数据库访问权限问题。错误信息表明用户 yuan 被拒绝访问数据库 jiedan。让我们解决这个问题。
首先，我们需要确保 PostgreSQL 服务正在运行，然后创建数据库和用户，并授予适当的权限。
很好，PostgreSQL 服务已经在运行。现在让我们连接到 PostgreSQL 并创建数据库和用户：

```
brew services list | grep postgresql
```

```
psql postgres -c "SELECT current_user, current_database();"
```

```
psql postgres -c "CREATE USER yuan WITH PASSWORD 'Passvord2025';"

psql postgres -c "CREATE DATABASE dev_marketplace;"

psql postgres -c "GRANT ALL PRIVILEGES ON DATABASE dev_marketplace TO yuan;"

psql dev_marketplace -c "GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO yuan;"

psql dev_marketplace -c "GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO yuan;"

```

# websocket 支持

# alipay 支持

```
npm install alipay-sdk
```

我已经创建了支付通知处理路由，让我解释一下这个实现的主要功能：
1. 路由位置：src/app/api/payments/notify/route.ts
2. 主要功能：
接收支付宝的异步通知
验证通知签名
处理支付成功的情况
更新订单状态
创建支付记录
3. 处理流程：
首先从请求中获取支付宝发送的表单数据
使用 alipay.checkNotifySign() 验证通知签名的真实性
从参数中解构出订单号、交易状态和支付宝交易号
当交易状态为 TRADE_SUCCESS 时：
查找对应的订单
如果订单状态为 PENDING，则在一个事务中：
更新订单状态为 PAID
创建新的支付记录
返回 "success" 给支付宝服务器
4. 错误处理：
- 无效签名返回 400 状态码
- 订单未找到返回 404 状态码
- 其他错误返回 500 状态码


# 部署到服务器

docker-compos up --build


# mac 上编centos7 docker image
docker-build.sh


  docker builder prune -f

  docker system prune -f

  docker build --no-cache -t cursor_jiedan_web .

 ## centos 问题多， 切到生成 ubuntu image

切换到root user， 默认登进去是 User nextjs
 docker exec -u root -it a23cf726c32 bash 
  使用apt-get

  测试数据库
apt-get update && apt-get install -y netcat
  nc -zv db 5432


  apk 是 Alpine Linux 的包管理器，而我们现在使用的是 Ubuntu 22.04 作为基础镜像。
让我修改 Dockerfile 中的这部分：
我已经更新了 Dockerfile，主要修改了以下内容：
在构建阶段（Alpine）：apk

这是正确的，因为构建阶段使用的是 Alpine Linux。
在生产阶段（Ubuntu）：

apt-get


docker exec -it 3fa115f2025d cat /app/start.sh

docker exec -it 3fa115f2025d head -n 1 /app/start.sh

docker exec -it 3fa115f2025d /app/start.sh

docker exec -it 3fa115f2025d sh -c "echo $SHELL; which sh; which bash"

docker logs 3fa115f2025d

docker exec -it 40071f47a734 /app/start.sh






# 充电项目

市场需求
24年用户 7.6亿 点位 500万 营业额 589万

盈利模式

一劳永逸，没有赊账

传统充电宝的问题
不好还
收费高
充电效率低
寿命低





使用方式
还需要配个 有线充电宝？部署？

一个充电宝的成本是多少



# 视频搬运项目
20250426 启动

1. download yt-download
2. publish https://linux.do/t/topic/110273 或者工作流， manus
3. 去水印
4. ffmpeg 分离声音视频
5. whisper 转文字
6. AI翻译
7. 加字幕
8. 加中文人声/数字人
9. 剪影合成 ffmpeg 合成