#!/bin/bash
set -euo pipefail

# 设置环境变量
export POSTGRES_USER=yuan
export POSTGRES_PASSWORD=Passvord2025
export POSTGRES_DB=dev_marketplace
export DATABASE_URL="postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@db:5432/${POSTGRES_DB}"
export NEXTAUTH_URL="http://localhost:3000"
export NEXTAUTH_SECRET="dev-marketplace-secret-key-2024"
export JWT_SECRET="your-jwt-secret"

# Alipay Configuration
export ALIPAY_APP_ID="2019072165945166"
export ALIPAY_PRIVATE_KEY="MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCIk+1scDu3bwcT5NY1jiqLsxDlf8WbyJnT7NDFGZ07Earcmc+OJvdIvJ8Z0+6OpNqnGS3RTC70557KbBlzNkSJQ5BQIfoUkXiRd9rJbhi+Q+IT/JAM3MLh1Ji0Ql4MdSg0qH9Soom900v1YeySjy7u2RXW1YletarW+sW3drQfZBQk0+QrrXk880lEbRO71rFUeI0ue0SlEQ+VdPDCaX23oMUKtpdP3FPASu41xMQ0lorfN8pO99NP4vVBOfvEm+zsx0m8aNO1RPMp65btaGjzb+vEmz3kC15/e/Dr/HFZ+idj4q1ggIeXNgDOx5hXeB3UZwRRhIFwzlXkJc1ZIdELAgMBAAECggEAT3INB6j5c6hn65CPcjOyV/TffUAnyIiVworcnepaZYPPaecmrr/H1E20FqgK+nq2ncCtwDOalOcunPzoiPYmQ9pDVfmNqO09vxCC+ezLA9Ik7g9aE8FOs2KhOSnp30E/E/J3ra/Sg9MnOiOuI0qauGEarQ8liywNpmPVIvUvrZoFAR/qzLiWYqsgKBR6SDzqVOsY4u6iOOk+9DXk/zLnOqpMY1yd8dtz3QifmxU0DLXCoDbhx3RLLJV/slsc9LhEmRqEHnhTEc71RoOrPZyDSkvE+LXtyL6bfdFsbX4QwwSkCYRlGf//0a2TzfuoQf2J/f1GhkaMbvQ+XrgRa5ueAQKBgQDNl5kf56s4e6+9tmq+VJNp+szvRpyxp2S0LBg14XNb4hFoxyACN6W6foxZoxPhUpyHMC7XTbVXMi8XCzcK1Cftlz2QLSwF6p/nplTGQDjHnFZ6hBdrEc4rCtx7QF7FZmWInRDizL2KeN1qZkKwe/4VVAFZjrs8Ho3ybjifSHALgQKBgQCqEIHUCtNYkoPs/EGhIi5uPw4JjTCBnWSjhh/y1in4pURRF5HK1yxQDpWLsoeGpGYUx/BDjyc0AF2g41PWjKEB/2MJXulPI/Uw+bRgoVCp0qq5yYp7VHxuNh/TzI7J9iZZI1pqkqcpbZqWu8rS10LHrOXDqgbHK9zHT3jKK7ySiwKBgQCkZ+6TjPdnG8HVu+JwgcHApkbrsVPs3SeyzPAvZjKR755sY5A9NbLaCAjERZzIOv/hO665jfLN39u4WceSaUXkwWUBvp3NvWpSHLj+MK03MtYU8zym6n4r/WuDRF6FDPV04eV2+LM54J1vUIdUClONSrgpnfIsiWKJ04qEFbFEAQKBgGY1nZGvH+5vwFJCGb+aJ4Wi5/DdpnV//ug4yCLOjFMgILsMC1d5kuxal45qMgG99IwwzjoMY2dhgOQdPFoKEwp8Ty1mmZoy5j4VFU+uJCissGcQteYBlPc4GFDW9Ep1Yf7YvJKoqUbA1NQa8X9eWIhhZYX/PiueNQakwNfhCWiZAoGAEpaJso84opec8Uk9TINLRZ/GS5X1KZZAb5r0tbWWgw5Ru4Yxp8UrUFuu0pcngErHhvufdTg775Wlrx5zx1NNwUGnE481LPW9aPUoGBZsKWuHdgYULKk9uMd74kgs88BYZ7551RAR8c8UKhz81MEfNA6em5OdE9uJ7pg1f+H1+Qc="
export ALIPAY_PUBLIC_KEY="MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAiLaFg84+HMWztCkebNCfedCBd5Qg8v7iPj4g7uCCaBYAU9FtHuKlKTwOiskiXXaYg3ct1M1uzyJxJN15W0RxHui1J+MhxpNuUdZY6jAVy0qgkItWMLDeOu1aqKt7yCDBKiJWnOVV53NfTtRVd8jcxWHG1L/tJItFAriQLeFDC4HEz5Za3LhlSDscICjPTdUfPkEZ9HBc0HaxWfotscO8s5D0YNZpig71cqzQpDNd+79KS4un8puD8ODrPvQhcXX15Pk1il0Y5CIvG6RMgveK+aofjSLBYooKaoF9Bju3vpZC3hvmvWf323wqj1xk3dYqygVE9oxR9EARiJtNBbMP6QIDAQAB"
export ALIPAY_ENCRYPT_KEY=""
export NEXT_PUBLIC_APP_URL="http://localhost:3000"

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