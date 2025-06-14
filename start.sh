#!/bin/sh
set -eu

# 设置日志文件
LOG_FILE="/app/server.log"
touch "$LOG_FILE"
chmod 644 "$LOG_FILE"

# 日志函数
log() {
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

# 错误处理函数
handle_error() {
  log "❌ Error: $1"
  log "💡 Container will keep running for debugging"
  log "📝 Current process list:"
  ps aux | tee -a "$LOG_FILE"
  log "📝 Last 50 lines of log:"
  tail -n 50 "$LOG_FILE" | tee -a "$LOG_FILE"
  tail -f "$LOG_FILE"
  exit 1
}

# 检查环境变量
check_env_vars() {
  log "🔍 Checking environment variables..."
  required_vars="DATABASE_URL NODE_ENV POSTGRES_PASSWORD"
  for var in $required_vars; do
    if [ -z "$(eval echo \$$var)" ]; then
      handle_error "Required environment variable $var is not set"
    fi
  done
  log "✅ Environment variables check passed"
}

# 检查 Node.js 版本
log "📝 Checking Node.js version..."
node -v | tee -a "$LOG_FILE"
npm -v | tee -a "$LOG_FILE"

# 检查数据库连接
check_db_connection() {
  log "⏳ Waiting for database to be ready..."
  max_attempts=30
  attempt=1
  
  while [ $attempt -le $max_attempts ]; do
    if nc -z db 5432; then
      log "✅ Database is ready!"
      break
    fi
    
    if [ $attempt -eq $max_attempts ]; then
      handle_error "Database connection timeout after $max_attempts attempts"
    fi
    
    log "⏳ Waiting for database to be ready... (attempt $attempt/$max_attempts)"
    attempt=$((attempt + 1))
    sleep 2
  done
  
  log "🔍 Testing database connection..."
  log "📝 DATABASE_URL: $DATABASE_URL"
  log "📝 NODE_ENV: $NODE_ENV"
  
  # 使用 psql 测试连接
  log "📝 Testing with psql..."
  export PGPASSWORD="$POSTGRES_PASSWORD"
  if ! psql -h db -U yuan -d dev_marketplace -c '\q' 2>/dev/null; then
    log "❌ psql connection failed"
  else
    log "✅ psql connection successful"
  fi
}

# 初始化数据库
init_database() {
  log "🔄 Initializing database..."
  
  # 生成 Prisma 客户端
  log "📝 Generating Prisma client..."
  if ! npx prisma generate; then
    handle_error "Failed to generate Prisma client"
  fi
  
  # 检查是否存在迁移文件
  if [ -d "prisma/migrations" ] && [ "$(ls -A prisma/migrations)" ]; then
    log "📝 Found migration files, attempting to apply migrations..."
    if ! npx prisma migrate deploy; then
      log "❌ Migration failed, attempting to reset database..."
      if ! npx prisma migrate reset --force; then
        handle_error "Failed to apply migrations"
      fi
    fi
  else
    log "📝 No migration files found, pushing schema directly..."
    if ! npx prisma db push --accept-data-loss; then
      handle_error "Failed to push schema"
    fi
  fi
  
  # 验证数据库表
  log "🔍 Verifying database tables..."
  if ! npx prisma db pull > /dev/null 2>&1; then
    handle_error "Failed to verify database schema"
  fi
  
  log "✅ Database initialization completed"
}

# 启动服务器
start_server() {
  log "🚀 Starting server..."
  if [ "$NODE_ENV" = "production" ]; then
    exec node server.js
  else
    exec npm run dev
  fi
}

# 健康检查
health_check() {
  log "🏥 Starting health check..."
  max_attempts=30
  attempt=1
  
  while [ $attempt -le $max_attempts ]; do
    if wget -q --spider http://localhost:3000/api/health; then
      log "✅ Server is healthy!"
      return 0
    fi
    
    if [ $attempt -eq $max_attempts ]; then
      handle_error "Health check failed after $max_attempts attempts"
    fi
    
    log "⏳ Waiting for server to be healthy... (attempt $attempt/$max_attempts)"
    attempt=$((attempt + 1))
    sleep 2
  done
}

# 主函数
main() {
  log "🚀 Starting application..."
  
  # 检查环境变量
  check_env_vars
  
  # 检查数据库连接
  check_db_connection
  
  # 初始化数据库
  init_database
  
  # 启动服务器
  start_server &
  
  # 等待服务器启动
  sleep 5
  
  # 运行健康检查
  health_check
  
  # 保持容器运行
  wait
}

# 运行主函数
main 