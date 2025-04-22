# 构建阶段
FROM node:20-alpine AS builder

WORKDIR /app

# Install OpenSSL and other required dependencies
RUN apk add --no-cache openssl openssl-dev python3 make g++ git busybox-extras
RUN npm install -g node-gyp

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies including all required packages and their type definitions
RUN npm install
RUN npm install jsonwebtoken zod alipay-sdk@3.6.1
RUN npm install --save-dev @types/jsonwebtoken @types/bcryptjs

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
FROM node:20-alpine AS runner

WORKDIR /app

# Install OpenSSL in production
RUN apk add --no-cache openssl openssl-dev python3 make g++ git busybox-extras
RUN npm install -g node-gyp

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
RUN npm install --production
RUN npm install jsonwebtoken zod alipay-sdk@3.6.1
RUN npm install --save-dev @types/jsonwebtoken @types/bcryptjs
RUN npm install @prisma/client

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

# Generate Prisma Client
RUN npx prisma generate

# Create a non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
RUN chown -R nextjs:nodejs /app

# Create startup script
COPY --chown=nextjs:nodejs <<EOF /app/start.sh
#!/bin/sh
echo "Waiting for database to be ready..."
while ! nc -z db 5432; do
  sleep 1
done
echo "Database is ready!"

echo "Running database migrations..."
npx prisma migrate deploy

echo "Starting the application..."
node server.js
EOF

RUN chmod +x /app/start.sh

USER nextjs

# Expose the port
EXPOSE 3000

# Add healthcheck
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1

# Start the application using the startup script
CMD ["/app/start.sh"] 