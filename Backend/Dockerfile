FROM node:22-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json* tsconfig.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:22-alpine
WORKDIR /app
# Install bash + Postgres client tools (psql, pg_isready)
RUN apk add --no-cache bash postgresql-client
# Debug to make sure the extension is installed otherwise the migration script will fail
RUN which psql && which pg_isready
COPY --from=builder /app/package.json /app/package-lock.json* ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/scripts ./scripts
COPY --from=builder /app/drizzle.config.* ./
COPY --from=builder /app/drizzle ./drizzle
RUN chmod +x ./scripts/*.sh
EXPOSE 4000
CMD ["bash", "-c", "./scripts/run_migrations.sh && npm run start"]
