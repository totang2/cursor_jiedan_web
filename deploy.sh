#!/bin/bash

# 设置错误时退出
set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 打印带颜色的信息
info() {
    echo -e "${GREEN}[INFO] $1${NC}"
}

warn() {
    echo -e "${YELLOW}[WARN] $1${NC}"
}

error() {
    echo -e "${RED}[ERROR] $1${NC}"
    exit 1
}

# 检查必要的命令是否存在
check_commands() {
    info "检查必要的命令..."
    if ! command -v docker &> /dev/null; then
        error "Docker 未安装，请先安装 Docker"
    fi
    
    # 检查 Docker 版本是否支持新的 compose 命令
    DOCKER_VERSION=$(docker --version | cut -d' ' -f3 | cut -d'.' -f1,2)
    if (( $(echo "$DOCKER_VERSION < 20.10" | bc -l) )); then
        error "Docker 版本过低，请升级到 20.10 或更高版本"
    fi
}

# 检查环境变量文件
check_env() {
    info "检查环境变量文件..."
    if [ ! -f .env ]; then
        error ".env 文件不存在，请先创建并配置环境变量"
    fi
}

# 备份数据库
backup_database() {
    info "检查数据库服务是否运行..."
    if ! docker compose ps | grep -q "db.*running"; then
        warn "数据库服务未运行，跳过备份步骤"
        return 0
    fi
    
    info "备份数据库..."
    BACKUP_DIR="backups"
    TIMESTAMP=$(date +%Y%m%d_%H%M%S)
    BACKUP_FILE="${BACKUP_DIR}/backup_${TIMESTAMP}.sql"
    
    mkdir -p $BACKUP_DIR
    
    docker compose exec -T db pg_dump -U yuan dev_marketplace > $BACKUP_FILE
    
    if [ $? -eq 0 ]; then
        info "数据库备份成功: $BACKUP_FILE"
    else
        warn "数据库备份失败"
    fi
}

# 停止现有服务
stop_services() {
    info "停止现有服务..."
    docker compose down
}

# 拉取最新代码
pull_latest_code() {
    info "拉取最新代码..."
    git pull origin main || warn "git pull 失败，继续部署..."
}

# 构建和启动服务
build_and_start() {
    info "构建和启动服务..."
    # 启用 bake 功能
    export COMPOSE_BAKE=true
    docker compose build --no-cache
    docker compose up -d
}

# 检查服务健康状态
check_health() {
    info "检查服务健康状态..."
    sleep 10  # 等待服务启动
    
    if curl -s http://43.139.115.112/api/health > /dev/null; then
        info "服务健康检查通过"
    else
        warn "服务健康检查失败，请检查日志"
    fi
}

# 清理未使用的镜像和容器
cleanup() {
    info "清理未使用的资源..."
    docker system prune -f
}

# 主函数
main() {
    info "开始部署..."
    
    check_commands
    check_env
    backup_database
    stop_services
    pull_latest_code
    build_and_start
    check_health
    cleanup
    
    info "部署完成！"
}

# 执行主函数
main