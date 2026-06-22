FROM node:20-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

FROM base AS build
WORKDIR /app
COPY . .
ARG SERVICE_NAME
RUN pnpm install --frozen-lockfile
RUN pnpm --filter @forge/${SERVICE_NAME}... build

FROM base AS runtime
WORKDIR /app
ARG SERVICE_NAME
COPY --from=build /app/services/${SERVICE_NAME}/dist ./dist
COPY --from=build /app/node_modules ./node_modules
CMD ["node", "dist/index.js"]
