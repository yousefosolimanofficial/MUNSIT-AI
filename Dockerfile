# syntax=docker/dockerfile:1
#
# MUNSIT AI frontend: minimal image for DevOps testing (initial handoff, NOT a release).
# See docs/devops/HANDOFF.md. Runtime: Node.js 24.22.3 (.nvmrc), pnpm 12.18.0 (packageManager)
# through Corepack, Next.js `next start` on port 3000.
#
# Build:  docker build --build-arg NEXT_PUBLIC_APP_ENV=production -t munsit-ai-frontend .
# Run:    docker run --rm -p 3000:3000 munsit-ai-frontend
#
# NEXT_PUBLIC_* values are inlined into the browser bundle at BUILD time, so they are build
# arguments: changing one needs a new image, not a new container.

ARG NODE_IMAGE=node:24.22.3-bookworm-slim

# 1. Dependencies (all, including devDependencies needed by `next build`).
FROM ${NODE_IMAGE} AS deps
WORKDIR /app
ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN corepack pnpm install --frozen-lockfile

# 2. Production build.
FROM ${NODE_IMAGE} AS build
WORKDIR /app
ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0 \
    NEXT_TELEMETRY_DISABLED=1
ARG NEXT_PUBLIC_APP_ENV=production
ENV NEXT_PUBLIC_APP_ENV=${NEXT_PUBLIC_APP_ENV}
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN corepack pnpm build

# 3. Runtime: production dependencies only, the build output, non-root.
FROM ${NODE_IMAGE} AS runtime
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    COREPACK_ENABLE_DOWNLOAD_PROMPT=0 \
    PORT=3000
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN corepack pnpm install --frozen-lockfile --prod --ignore-scripts \
    && corepack pnpm store prune \
    && rm -rf /root/.cache /root/.local/share/pnpm
COPY --from=build --chown=node:node /app/.next ./.next
COPY --from=build /app/public ./public
COPY --from=build /app/next.config.ts ./next.config.ts
COPY --from=build /app/src/i18n ./src/i18n
USER node
EXPOSE 3000
# Bind 0.0.0.0, never 127.0.0.1: a 127.0.0.1 binding loops on the locale rewrite
# (QA report O-1, docs/phases/phase-07-qa-report.md). The port comes from $PORT.
CMD ["node_modules/.bin/next", "start", "-H", "0.0.0.0"]
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD ["node", "-e", "fetch('http://127.0.0.1:'+(process.env.PORT||3000)+'/').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"]
