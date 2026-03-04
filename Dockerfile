# ── Stage 1: Build frontend ───────────────────────────────────────────────────
FROM node:20-alpine AS frontend-builder

WORKDIR /app/client

COPY client/package.json ./
RUN npm install

COPY client/ ./
RUN npm run build

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
RUN mkdir -p /app/data/uploads

ENV NODE_ENV=production
ENV PORT=3001
ENV HOST=0.0.0.0
ENV DB_PATH=/app/data/jewelbox.db
ENV UPLOADS_DIR=/app/data/uploads

EXPOSE 3001

VOLUME ["/app/data"]

CMD ["node", "src/index.js"]
