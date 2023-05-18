# syntax=docker/dockerfile:1.4

####################################################################################################
## Build Packages

FROM node:18-alpine AS builder
WORKDIR /directus9

ENV NODE_OPTIONS=--max-old-space-size=8192

COPY package.json .
RUN corepack enable && corepack prepare

COPY pnpm-lock.yaml .
RUN pnpm fetch
COPY . .
RUN pnpm install --recursive --offline --frozen-lockfile

RUN : \
	&& npm_config_workspace_concurrency=1 pnpm run build \
	&& pnpm --filter directus9 deploy --prod dist \
	&& cd dist \
	&& pnpm pack \
	&& tar -zxvf *.tgz package/package.json \
	&& mv package/package.json package.json \
	&& rm -r *.tgz package \
	&& mkdir -p database extensions uploads \
	;

####################################################################################################
## Create Production Image

FROM node:18-alpine AS runtime

USER node

WORKDIR /directus9

EXPOSE 8055

ENV \
	DB_CLIENT="sqlite3" \
	DB_FILENAME="/directus9/database/database.sqlite" \
	EXTENSIONS_PATH="/directus9/extensions" \
	STORAGE_LOCAL_ROOT="/directus9/uploads" \
	NODE_ENV="production" \
	NPM_CONFIG_UPDATE_NOTIFIER="false"

COPY --from=builder --chown=node:node /directus9/dist .

CMD : \
	&& node /directus9/cli.js bootstrap \
	&& node /directus9/cli.js start \
	;
