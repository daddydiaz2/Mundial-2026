FROM node:22-alpine

WORKDIR /app

COPY package*.json pnpm-lock.yaml ./
RUN corepack enable
RUN echo 'y' | pnpm approve-builds || true
RUN pnpm install --frozen-lockfile --ignore-scripts
RUN pnpm rebuild

COPY . .

RUN pnpm build

EXPOSE 3000

RUN mkdir -p /app/data

CMD ["sh", "-c", "pnpm drizzle-kit push && node .output/server/index.mjs"]
