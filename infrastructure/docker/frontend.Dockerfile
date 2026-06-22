FROM node:20-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

FROM base AS build
WORKDIR /app
COPY . .
ARG APP_NAME
RUN pnpm install --frozen-lockfile
RUN pnpm --filter @forge/${APP_NAME}... build

FROM nginx:alpine AS runtime
ARG APP_NAME
COPY --from=build /app/apps/${APP_NAME}/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
