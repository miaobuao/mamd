# Mamd

## Requirements

- Docker & Docker Compose
- Node >= 20
- pnpm >= 9

## Dev

1. Copy `.env.example` to `.env` and set the correct environment variables.

2. Install dependencies

```sh
pnpm i
```

3. Run dev setup

```sh
pnpm dev:setup
```

4. Migrate db

```sh
pnpm prisma:migrate
```

5. Run dev server

```sh
pnpm dev
```
