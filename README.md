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

3. Start docker-compose

```sh
pnpm dev:docker-compose
```

4. Migrate db

```sh
pnpm db:migrate
```

5. Run dev server

```sh
pnpm dev
```
