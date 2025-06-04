FROM node:22-alpine

RUN apk add --no-cache openssl3

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY ./backend/package.json ./backend/package.json
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --ignore-scripts --frozen-lockfile
COPY ./backend ./backend

RUN pnpm run -C backend prisma:generate

CMD ["pnpm", "run", "-C", "backend", "start:set-my"]
