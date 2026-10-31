# Build from the repo root: docker build -f docker/api.Dockerfile -t umkm-api .
FROM oven/bun:1.4.2 AS prune
WORKDIR /repo
COPY . .
RUN bunx turbo@2.11.10 prune api --docker --out-dir /out

FROM oven/bun:1.4.2 AS deps
WORKDIR /app
COPY --from=prune /out/json/ .
# Dev deps are kept: drizzle-kit is needed to run migrations from the container.
RUN bun install --frozen-lockfile --ignore-scripts

FROM oven/bun:1.4.2 AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY --from=deps /app/ .
COPY --from=prune /out/full/ .
USER bun
EXPOSE 8787
HEALTHCHECK --interval=30s --timeout=3s CMD bun -e "fetch('http://localhost:8787/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["bun", "apps/api/src/index.ts"]
