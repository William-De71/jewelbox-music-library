# ── Stage 1: Build frontend ───────────────────────────────────────────────────
FROM node:20-alpine AS frontend-builder

WORKDIR /app

COPY package.json ./
COPY client/package.json ./client/
COPY server/package.json ./server/
RUN npm install

COPY client/ ./client/
RUN npm run build --workspace=client

# ── Stage 2: Production image ─────────────────────────────────────────────────
FROM node:20-alpine AS production

RUN apk add --no-cache python3 make g++

WORKDIR /app/server

COPY server/package.json ./
RUN npm install --omit=dev

COPY server/ ./

# Copy compiled frontend into server's expected location
COPY --from=frontend-builder /app/client/dist /app/client/dist

# Create data directory for SQLite DB and uploads
RUN mkdir -p /app/server/data

ENV NODE_ENV=production
ENV PORT=3001
ENV HOST=0.0.0.0

EXPOSE 3001

VOLUME ["/app/server/data"]

CMD ["node", "src/index.js"]
