# Mamd

## Requirements

- Docker & Docker Compose
- Node.js >= 20
- pnpm >= 9

## Dev

Copy `.env.example` to `.env` and set the correct environment variables.

```sh
# install deps
pnpm i

# run dev setup
pnpm dev:setup

# migrate db
pnpm prisma:migrate

# run dev
pnpm dev
```
