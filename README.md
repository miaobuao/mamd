# Mamd

## Requirements

- Docker & Docker Compose
- Node.js >= 20
- pnpm >= 9
- Rust (Stable)
- cmake

## Dev

1. Copy `.env.example` to `.env` and set the correct environment variables.

2. Install `cargo-watch`

```sh
cargo install cargo-watch
```

3. Install dependencies

```sh
# install deps
pnpm i
```

4. Run dev setup

```sh
pnpm dev:setup
```

5. Migrate db

```sh
pnpm prisma:migrate
```

6. Run dev server

```sh
pnpm dev
```
