FROM node:22-alpine

WORKDIR /app

COPY package*.json pnpm-lock.yaml ./
RUN corepack enable && echo 'y' | pnpm approve-builds || true && pnpm install --frozen-lockfile --ignore-scripts && pnpm rebuild

COPY . .

RUN pnpm build

EXPOSE 3000

RUN mkdir -p /app/data

CMD node server/db/migrate.mjs && node .output/server/index.mjs
