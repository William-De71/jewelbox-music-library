# ── Stage 1: Build frontend ───────────────────────────────────────────────────
FROM node:20-alpine3.21 AS frontend-builder

WORKDIR /app

COPY package.json package-lock.json ./
COPY client/package.json ./client/
COPY server/package.json ./server/
RUN npm ci

COPY client/ ./client/
RUN npm run build --workspace=client

# ── Stage 2: Build server deps (compile native modules) ───────────────────────
FROM node:20-alpine3.21 AS server-builder

RUN apk add --no-cache python3 make g++

WORKDIR /app

COPY package.json package-lock.json ./
COPY server/package.json ./server/
RUN npm ci --omit=dev --workspace=server

# ── Stage 3: Production image (no build tools) ────────────────────────────────
FROM node:20-alpine3.21 AS production

WORKDIR /app/server

COPY --from=server-builder /app/server/node_modules ./node_modules
COPY server/ ./

# Copy compiled frontend into server's expected location
COPY --from=frontend-builder /app/client/dist /app/client/dist

# Patch remaining CVEs and create data directory + non-root user
RUN apk upgrade --no-cache && \
    mkdir -p /app/server/data && \
    addgroup -S jewelbox && adduser -S jewelbox -G jewelbox && \
    chown -R jewelbox:jewelbox /app

USER jewelbox

ENV NODE_ENV=production
ENV PORT=3001
ENV HOST=0.0.0.0

EXPOSE 3001

VOLUME ["/app/server/data"]

CMD ["node", "src/index.js"]
