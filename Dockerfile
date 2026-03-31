# Build stage
FROM node:20 AS builder

WORKDIR /app

# Copy package files
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

# Copy source
COPY . .

# Build
RUN yarn build

# Production stage - 使用更小的 serve 镜像
FROM node:20-slim AS runner

WORKDIR /app

ENV NODE_ENV=production

# Copy necessary files
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./

# Install serve globally
RUN npm install -g serve

EXPOSE 3001

CMD ["serve", "dist", "-p", "3001"]
