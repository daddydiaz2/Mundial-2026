FROM node:22-alpine

WORKDIR /app

COPY package*.json pnpm-lock.yaml ./
RUN corepack enable && pnpm install --frozen-lockfile

COPY . .

RUN pnpm drizzle-kit push
RUN pnpm build

EXPOSE 3000

RUN mkdir -p /app/data

CMD ["node", ".output/server/index.mjs"]
