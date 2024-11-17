# syntax = docker/dockerfile:1
FROM node:23-alpine AS runner

# Create a non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 ecopoints

WORKDIR /app

# Install pnpm globally
RUN npm install -g pnpm

# Copy package files and patches
COPY --chown=ecopoints:nodejs package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY --chown=ecopoints:nodejs api/package.json ./api/
COPY --chown=ecopoints:nodejs patches/ ./patches/

# Install only production dependencies
RUN pnpm install --filter api --prod --frozen-lockfile

# Copy source files
COPY --chown=ecopoints:nodejs api/src ./api/src
COPY --chown=ecopoints:nodejs api/tsconfig.json ./api/

USER ecopoints

HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:${PORT}/healthz || exit 1

ENV NODE_ENV=production \
    PORT=3000

EXPOSE ${PORT}

CMD ["node", "--experimental-strip-types", "api/src/index.ts"]
