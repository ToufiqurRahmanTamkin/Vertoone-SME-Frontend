# ── Stage 1: Build ────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies first (layer-cache friendly)
COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts

# Vite inlines these at build time, so they must be present before `npm run build`.
ARG VITE_SERVER_URL=http://localhost:5000
ARG VITE_APP_NAME="Vertoone Omni"
ARG VITE_APP_SHORT_NAME=Vertoone
ARG VITE_NODE_ENV=production
ARG VITE_SOCKET_ENABLED=true
ARG VITE_SOCKET_PATH=/socket.io
ARG VITE_SOCKET_URL=""
ARG VITE_BASENAME=""

ENV VITE_SERVER_URL=$VITE_SERVER_URL \
    VITE_APP_NAME=$VITE_APP_NAME \
    VITE_APP_SHORT_NAME=$VITE_APP_SHORT_NAME \
    VITE_NODE_ENV=$VITE_NODE_ENV \
    VITE_SOCKET_ENABLED=$VITE_SOCKET_ENABLED \
    VITE_SOCKET_PATH=$VITE_SOCKET_PATH \
    VITE_SOCKET_URL=$VITE_SOCKET_URL \
    VITE_BASENAME=$VITE_BASENAME

# Copy source and build
COPY . .
RUN npm run build

# ── Stage 2: Serve ────────────────────────────────────────────────────────────
FROM nginx:1.27-alpine AS runner

RUN apk add --no-cache wget

# Remove default nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/app.conf

# Copy built SPA from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://127.0.0.1/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
