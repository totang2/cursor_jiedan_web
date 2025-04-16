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