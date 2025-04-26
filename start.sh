#!/bin/bash
set -euo pipefail

# 设置日志文件
LOG_FILE="/app/server.log"
touch "$LOG_FILE"
chmod 644 "$LOG_FILE"

# 日志函数
log() {
  local message="[$(date '+%Y-%m-%d %H:%M:%S')] $1"
  echo "$message" | tee -a "$LOG_FILE"
  echo "$message" >&2  # 同时输出到 stderr
}

# 错误处理函数
handle_error() {
  log "❌ Error occurred: $1"
  log "💡 Container will keep running for debugging"
  log "📝 Current process list:"
  ps aux | tee -a "$LOG_FILE"
  log "📝 Last 50 lines of log:"
  tail -n 50 "$LOG_FILE" | tee -a "$LOG_FILE"
  tail -f "$LOG_FILE"
  exit 1
}

# 检查环境变量
log "🚀 Starting application..."
log "📝 Checking environment variables..."
required_vars=("DATABASE_URL" "NODE_ENV")
for var in "${required_vars[@]}"; do
  if [ -z "${!var:-}" ]; then
    handle_error "Required environment variable $var is not set"
  fi
done

# 检查 Node.js 版本
log "📝 Checking Node.js version..."
node -v | tee -a "$LOG_FILE"
npm -v | tee -a "$LOG_FILE"

# 等待数据库就绪
log "⏳ Waiting for database to be ready..."
MAX_RETRIES=30
RETRY_COUNT=0
while ! nc -z db 5432; do
  RETRY_COUNT=$((RETRY_COUNT + 1))
  log "Attempt $RETRY_COUNT of $MAX_RETRIES: Database not ready yet, waiting..."
  if [ $RETRY_COUNT -eq $MAX_RETRIES ]; then
    handle_error "Database not ready after $MAX_RETRIES attempts"
  fi
  sleep 2
done
log "✅ Database is ready!"

# 检查数据库连接
log "🔍 Testing database connection..."
log "📝 DATABASE_URL: ${DATABASE_URL}"
log "📝 NODE_ENV: ${NODE_ENV}"

# 尝试直接使用 psql 测试连接
if command -v psql >/dev/null 2>&1; then
  log "📝 Testing with psql..."
  if ! PGPASSWORD=$(echo "$DATABASE_URL" | grep -oP 'password=\K[^@]+') psql -h db -p 5432 -U postgres -c "SELECT 1" > /dev/null 2>&1; then
    log "❌ psql connection failed"
  else
    log "✅ psql connection successful"
  fi
fi

# 尝试使用 Prisma 测试连接
log "📝 Testing with Prisma..."
if ! npx prisma db execute --stdin <<< "SELECT 1" 2>> "$LOG_FILE"; then
  log "❌ Prisma connection failed"
  log "📝 Prisma error output:"
  npx prisma db execute --stdin <<< "SELECT 1" 2>&1 | tee -a "$LOG_FILE"
  handle_error "Failed to connect to database"
fi
log "✅ Database connection successful"

# 运行数据库迁移
log "🔄 Running database migrations..."
if ! npx prisma migrate deploy; then
  log "❌ Migration failed, trying to reset database..."
  if ! npx prisma migrate reset --force; then
    handle_error "Database migration and reset failed"
  fi
fi
log "✅ Database migrations completed successfully"

# 验证数据库表
log "🔍 Verifying database tables..."
if ! npx prisma db execute --stdin <<< "SELECT * FROM \"User\" LIMIT 1" > /dev/null 2>&1; then
  log "❌ User table not found, attempting to create it..."
  if ! npx prisma db push --force-reset; then
    handle_error "Failed to create database tables"
  fi
fi
log "✅ Database tables verified"

# 启动服务器
log "🚀 Starting server..."
log "📝 Current working directory: $(pwd)"
log "📝 Server file exists: $(ls -l server.js)"
log "📝 Node modules directory exists: $(ls -l node_modules)"

# 使用 exec 启动 Node.js 进程，并确保输出到日志文件
exec node server.js >> "$LOG_FILE" 2>&1 &

# 获取进程 ID
SERVER_PID=$!
log "📝 Server started with PID: $SERVER_PID"

# 等待服务器启动
log "⏳ Waiting for server to start and listen on port 3000..."
MAX_RETRIES=30
RETRY_COUNT=0
while ! netstat -tuln | grep -q ":3000 "; do
  RETRY_COUNT=$((RETRY_COUNT + 1))
  log "Attempt $RETRY_COUNT of $MAX_RETRIES: Server not ready yet, waiting..."
  log "📝 Current process list:"
  ps aux | tee -a "$LOG_FILE"
  if [ $RETRY_COUNT -eq $MAX_RETRIES ]; then
    log "❌ Server not ready after $MAX_RETRIES attempts. Last log entries:"
    tail -n 50 "$LOG_FILE"
    handle_error "Server failed to start"
  fi
  sleep 2
done
log "✅ Server is listening on port 3000"

# 健康检查函数
check_health() {
  # 检查 Node.js 进程是否在运行
  if ! pgrep -f "node server.js" > /dev/null; then
    log "❌ Node.js server process not found"
    log "📝 Current process list:"
    ps aux | tee -a "$LOG_FILE"
    return 1
  fi
  
  # 检查端口是否在监听
  if ! netstat -tuln | grep -q ":3000 "; then
    log "❌ Port 3000 is not listening"
    return 1
  fi
  
  # 尝试连接服务器
  if ! curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/ 2>/dev/null | grep -q "200\|301\|302"; then
    log "❌ Server is not responding correctly"
    return 1
  fi
  
  log "✅ Health check passed"
  return 0
}

# 主循环
log "✅ Server started successfully with PID $SERVER_PID"
while true; do
  if ! check_health; then
    log "❌ Server health check failed. Last log entries:"
    tail -n 50 "$LOG_FILE"
    handle_error "Server health check failed"
  fi
  sleep 5
done 