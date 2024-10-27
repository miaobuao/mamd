# Mamd

## Requirements

- Docker & Docker Compose
- Bun >= 1.1.33

## Dev

1. Copy `.env.example` to `.env` and set the correct environment variables.

2. Install dependencies

```sh
bun i
```

3. Run dev setup

```sh
bun dev:setup
```

4. Migrate db

```sh
bun prisma:migrate
```

5. Run dev server

```sh
bun dev
```
