#!/bin/bash
set -euo pipefail

# 设置环境变量
export POSTGRES_USER=yuan
export POSTGRES_PASSWORD=Passvord2025
export POSTGRES_DB=dev_marketplace
export DATABASE_URL="postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@db:5432/${POSTGRES_DB}"
export NEXTAUTH_URL="http://3xyou.club"
export NEXTAUTH_SECRET="dev-marketplace-secret-key-2024"
export JWT_SECRET="your-jwt-secret"

# Alipay Configuration
export ALIPAY_APP_ID="2019072165945166"
export ALIPAY_PRIVATE_KEY="MIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQCvOH42DXw5g3cos5DsW29QEJ1LkDVhrG1muRjt19JxQozpfB3CS/Arth4yazNws013A9kpZNet8vhHxoYw93wtwlGyZpG7XETUtk30bKv100zSAVkAkgzA/FuqQmD3Ka6AOVHQrl9I/V1UDH4XG/SUK7FhyJGD5UgD1+bIzQp58AO0QWqOhSIHrUox+Uv1klY3PXvYQ5ZADdEXquoYDNZxz4wnqJcWEwmAPZkZoJphcbJ0nLArJeMauzFSY6JJfr6gzO4tILR9VgdEqFNyEgq8DVcVQfJnsTuf98q3vElZcxWHb9B0051H/gxNnuaXdgze7X/Dk7kBIwRgfR1PnjofAgMBAAECggEAB65pUgNLU9Ygjic5DjN/8LmZu6tJu8tsTFmG7z5L2m05ci7fuxnLII9uSXWLnsAtgC8qAPeLwPNq0PKyBUmEJxlirXhzoQwNdGm9hx6Qd0lZD8fBWBYO+xLVDeS1DYDFRpe8r3JFeRSqV7noeSjfkvNLZmb9ghO2EX0Qf/MFJ408cuuy1uix8pdROEeUstHjlJpDg9xIIeGa5RrajX7GzK6Pjpn45oXVqd/gyk2WQMqpoA87ytFLJ0pYgB6m5x9oCe3gWj3a/owmrXt6VlsPD95lQRh1jzvGLsfmHh4JU+cgXkneXYboONvhWuCPYgjZeT/X5byhGnrKG0NPsXHbGQKBgQDgJc0IXnOd6liZuAnFZTahL0uQl6C7gDJP0MCa4jnjmKhJgV3lm+ZpbnREn8D1cqTzD+TldrdBAheOdAbB4UU5Z9mQvPphsANxlu+SdTDQiFdvfER4faGfQX+RhkA11ovshnStgIDJejAlHQMnMxCAfxUj8TeALrYcuEDw97hhfQKBgQDIHsrWU8CIMBvEj5slC/v44rZ5ocd6O9OYM/VMxfeiQY2IOftBbXSx6p7yFmX3O4bw3ylTTIcM+IRKKs08j/AsFkvSVX0XVTIKh02qR98NNc7urqsVm+LA8SFD+T7SM9NxlnqWk/nsJotSfpVPEPkmm22vtRYzBTmd9lfjkOBcywKBgBq+5/QzsQAK0n+lIiVXqmkZR579OMSmy1oSwqi4jcfGk24R7a5UJ+40q9L0bQXcpCoMn3dx7vPm2AC7f4Lq6mOrLJ7EreuyIPcQ141WRnjbi/NVlKX796kVG6+1oTvLWe7jLFD3oGZqGgyTpairwzBR+afMRJ8a88gBhF48cNfRAoGAXmdIQHsZ5CTttHgaNAvHPc2VTyOmOl9mnfJE0YbCHuTVo2HWyTKdTiDkAkfWqh6GtbJQiF8dhlzl6ybt0pgEMIgEFKEHda5XAOh7Fsz4x/6OM8JqKrNy8JnPm4VEwVx5bqgSBF6iE2jLaIsWXEohfrjrsWu3oTHh0EaZh1ycuqkCgYBomE9XYQ84P1094IWWy/fnq4YOAAqzvxys0MYq4mhRA2E/P/KrEOAr99K0k69QTcm7rId1WXPBGrBeT8bNy4y3BoCllCGivYmNx/QN5x3Xi7w5o8h0x3p8PTKmkNgIJ/1vX2oURwgc6ktLEhZQdSz5/yxNXCwdoDVBs0F6jm3XOQ=="  # 替换为你的应用私钥
export ALIPAY_PUBLIC_KEY="MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEArzh+Ng18OYN3KLOQ7FtvUBCdS5A1YaxtZrkY7dfScUKM6XwdwkvwK7YeMmszcLNNdwPZKWTXrfL4R8aGMPd8LcJRsmaRu1xE1LZN9Gyr9dNM0gFZAJIMwPxbqkJg9ymugDlR0K5fSP1dVAx+Fxv0lCuxYciRg+VIA9fmyM0KefADtEFqjoUiB61KMflL9ZJWNz172EOWQA3RF6rqGAzWcc+MJ6iXFhMJgD2ZGaCaYXGydJywKyXjGrsxUmOiSX6+oMzuLSC0fVYHRKhTchIKvA1XFUHyZ7E7n/fKt7xJWXMVh2/QdNOdR/4MTZ7ml3YM3u1/w5O5ASMEYH0dT546HwIDAQAB"  # 替换为支付宝公钥
export ALIPAY_ENCRYPT_KEY=""
export NEXT_PUBLIC_APP_URL="http://3xyou.club"

# 检查 Docker 是否安装
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# 检查 Docker 是否正在运行
if ! docker info &> /dev/null; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# 清理 Docker 缓存
echo "🧹 Cleaning Docker cache..."
docker builder prune -f

# 重试函数
retry() {
    local -r -i max_attempts="$1"; shift
    local -i attempt_num=1
    until "$@"
    do
        if ((attempt_num==max_attempts))
        then
            echo "❌ Attempt $attempt_num failed and there are no more attempts left!"
            return 1
        else
            echo "⚠️ Attempt $attempt_num failed! Trying again in $attempt_num seconds..."
            sleep $((attempt_num++))
        fi
    done
}

# 设置 Docker 构建参数
DOCKER_BUILD_ARGS=(
    -t cursor_jiedan_web
    --build-arg DATABASE_URL="$DATABASE_URL"
    --build-arg ALIPAY_APP_ID="$ALIPAY_APP_ID"
    --build-arg ALIPAY_PRIVATE_KEY="$ALIPAY_PRIVATE_KEY"
    --build-arg ALIPAY_PUBLIC_KEY="$ALIPAY_PUBLIC_KEY"
    --build-arg ALIPAY_ENCRYPT_KEY="$ALIPAY_ENCRYPT_KEY"
    --no-cache
    .
)

# 构建 Docker 镜像
echo "🚀 Building Docker image..."
retry 3 docker build "${DOCKER_BUILD_ARGS[@]}"

# 检查构建是否成功
if [ $? -eq 0 ]; then
    echo "✅ Docker image built successfully!"
    echo "📦 Image name: cursor_jiedan_web"
    echo "💡 You can now run the container using:"
    echo "   docker run -d -p 3000:3000 --name cursor_jiedan_web cursor_jiedan_web"
else
    echo "❌ Docker build failed!"
    echo "💡 Troubleshooting tips:"
    echo "   1. Check your internet connection"
    echo "   2. Try running 'docker system prune -a' to clean up"
    echo "   3. Check if you have enough disk space"
    echo "   4. Try using a different base image in Dockerfile"
    exit 1
fi