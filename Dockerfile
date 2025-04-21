# 构建阶段
FROM node:20-alpine AS builder

WORKDIR /app

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

# Generate Prisma Client and run migrations
RUN npx prisma generate
RUN npx prisma migrate deploy

# Copy the rest of the application
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM node:20-alpine AS runner

WORKDIR /app

# Copy necessary files from builder
COPY --from=builder /app/next.config.js ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/@types ./node_modules/@types

# Install production dependencies only
COPY package*.json ./
RUN npm install --production
RUN npm install jsonwebtoken zod alipay-sdk@3.6.1
RUN npm install --save-dev @types/jsonwebtoken @types/bcryptjs

# Set environment variables for runtime
ARG DATABASE_URL
ENV DATABASE_URL=${DATABASE_URL}

# Generate Prisma Client and run migrations in production
RUN npx prisma generate
RUN npx prisma migrate deploy

# Create a non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
RUN chown -R nextjs:nodejs /app

USER nextjs

# Expose the port
EXPOSE 3000

# Add healthcheck
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1

# Start the application
CMD ["node", "server.js"] 