#!/bin/bash
set -euo pipefail

# 设置日志文件
LOG_FILE="/app/server.log"
touch "$LOG_FILE"
chmod 644 "$LOG_FILE"

# 日志函数
log() {
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# 错误处理函数
handle_error() {
  log "❌ Error occurred: $1"
  log "💡 Container will keep running for debugging"
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

# 运行数据库迁移
log "🔄 Running database migrations..."
if ! npx prisma migrate deploy; then
  handle_error "Database migration failed"
fi
log "✅ Database migrations completed successfully"

# 启动服务器
log "🚀 Starting server..."
nohup node server.js > "$LOG_FILE" 2>&1 &
SERVER_PID=$!

# 等待服务器启动
log "⏳ Waiting for server to start and listen on port 3000..."
MAX_RETRIES=30
RETRY_COUNT=0
while ! nc -z localhost 3000; do
  RETRY_COUNT=$((RETRY_COUNT + 1))
  log "Attempt $RETRY_COUNT of $MAX_RETRIES: Server not ready yet, waiting..."
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
  if ! kill -0 $SERVER_PID 2>/dev/null; then
    log "❌ Server process $SERVER_PID is not running"
    return 1
  fi
  
  if ! curl -s http://localhost:3000/api/health > /dev/null; then
    log "❌ Health check failed"
    return 1
  fi
  
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