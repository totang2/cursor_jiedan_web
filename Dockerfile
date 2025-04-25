# 构建阶段
FROM node:20-alpine AS builder

WORKDIR /app

# Install OpenSSL and other required dependencies
RUN apk add --no-cache openssl openssl-dev python3 make g++ git busybox-extras
RUN npm install -g node-gyp

# 更新 npm 并禁用更新提示
RUN npm install -g npm@11.3.0 && \
    npm config set update-notifier false



# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies including all required packages and their type definitions
RUN npm install --no-optional --legacy-peer-deps
RUN npm install jsonwebtoken zod alipay-sdk@3.6.1 --no-optional --legacy-peer-deps
RUN npm install --save-dev @types/jsonwebtoken @types/bcryptjs --no-optional --legacy-peer-deps

# Set environment variables for build
ARG DATABASE_URL
ENV DATABASE_URL=${DATABASE_URL}

ARG ALIPAY_APP_ID
ENV ALIPAY_APP_ID=${ALIPAY_APP_ID}

ARG ALIPAY_PRIVATE_KEY
ENV ALIPAY_PRIVATE_KEY=${ALIPAY_PRIVATE_KEY}

ARG ALIPAY_PUBLIC_KEY
ENV ALIPAY_PUBLIC_KEY=${ALIPAY_PUBLIC_KEY}

ARG ALIPAY_ENCRYPT_KEY
ENV ALIPAY_ENCRYPT_KEY=${ALIPAY_ENCRYPT_KEY}

# Generate Prisma Client
RUN npx prisma generate

# Copy the rest of the application
COPY . .

# Create public directory if it doesn't exist
RUN mkdir -p public

# Build the application
RUN npm run build

# Production stage
FROM ubuntu:22.04

WORKDIR /app

# Install Node.js 20
RUN apt-get update && \
    apt-get install -y curl && \
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y \
    nodejs \
    openssl \
    libssl-dev \
    python3 \
    make \
    g++ \
    git \
    net-tools \
    procps \
    dos2unix \
    && apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Install node-gyp globally and update npm
RUN npm install -g node-gyp && \
    npm install -g npm@11.3.0 && \
    npm config set update-notifier false



# Copy necessary files from builder
COPY --from=builder /app/next.config.js ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/@types ./node_modules/@types
COPY --from=builder /app/server.js ./
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# Install production dependencies only
COPY package*.json ./

# 创建临时目录用于 npm 缓存
RUN mkdir -p /tmp/npm-cache

# 设置 npm 配置
RUN npm config set cache /tmp/npm-cache --global

# 安装依赖
RUN npm install --production --no-optional --legacy-peer-deps && \
    npm install jsonwebtoken zod alipay-sdk@3.6.1 --no-optional --legacy-peer-deps && \
    npm install --save-dev @types/jsonwebtoken @types/bcryptjs --no-optional --legacy-peer-deps && \
    npm install @prisma/client@5.22.0 --no-optional --legacy-peer-deps

# 生成 Prisma 客户端
RUN npx prisma generate

# Set environment variables for runtime
ARG DATABASE_URL
ENV DATABASE_URL=${DATABASE_URL}

ARG ALIPAY_APP_ID
ENV ALIPAY_APP_ID=${ALIPAY_APP_ID}

ARG ALIPAY_PRIVATE_KEY
ENV ALIPAY_PRIVATE_KEY=${ALIPAY_PRIVATE_KEY}

ARG ALIPAY_PUBLIC_KEY
ENV ALIPAY_PUBLIC_KEY=${ALIPAY_PUBLIC_KEY}

ARG ALIPAY_ENCRYPT_KEY
ENV ALIPAY_ENCRYPT_KEY=${ALIPAY_ENCRYPT_KEY}

# Create a non-root user
RUN groupadd -r nodejs && useradd -r -g nodejs nextjs

# Copy start script and set permissions
COPY start.sh /app/start.sh
RUN dos2unix /app/start.sh && \
    chmod +x /app/start.sh && \
    chown nextjs:nodejs /app/start.sh

# 设置目录权限
RUN chown -R nextjs:nodejs /app

# 切换到 nextjs 用户
USER nextjs

# Expose the port
EXPOSE 3000

# Start the application using the startup script
CMD ["/bin/bash", "/app/start.sh"] 