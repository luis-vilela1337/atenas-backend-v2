# Atenas Backend V2

API backend do sistema Atenas, construido com NestJS + TypeORM + PostgreSQL.

## Pre-requisitos

- Docker e Docker Compose
- Node.js 18+
- pnpm

## Setup com Docker (recomendado)

### 1. Configurar variaveis de ambiente

```bash
cp .env.example .env
```

Edite o `.env` com suas configuracoes (banco, Mercado Pago, etc).

### 2. Subir os containers

```bash
docker-compose -f docker-compose.dev.yaml up --build
```

Isso inicia automaticamente:
- **app** (porta 3001) — roda migrations, seed e `start:dev`
- **db** — PostgreSQL 16.4 (porta 5432)
- **adminer** — interface web para o banco (porta 8080)

O entrypoint do container executa na ordem:
1. `pnpm run migration:run` — aplica migrations pendentes
2. `pnpm run seed` — popula o banco com dados iniciais
3. `pnpm run start:dev` — inicia a aplicacao em modo watch

### 3. Acessar

| Servico  | URL                          |
|----------|------------------------------|
| API      | http://localhost:3001        |
| Adminer  | http://localhost:8080        |
| Debug    | localhost:9229               |

## Setup sem Docker

### 1. Instalar dependencias

```bash
pnpm install
```

### 2. Rodar migrations

```bash
pnpm run migration:run
```

### 3. Rodar seed

```bash
pnpm run seed
```

O seed cria dados iniciais para desenvolvimento:
- 1 instituicao de exemplo
- 1 admin (`admin@atenas.com` / `senha123`)
- 1 cliente com R$ 500 de credito (`cliente@exemplo.com` / `senha123`)
- 3 produtos (ALBUM, GENERIC, DIGITAL_FILES)
- 2 eventos vinculados a instituicao
- Produtos vinculados a instituicao com precos configurados

O seed so executa em ambientes `development`, `staging` ou `test`.

### 4. Iniciar a aplicacao

```bash
pnpm run start:dev
```

## Scripts uteis

| Comando                      | Descricao                                    |
|------------------------------|----------------------------------------------|
| `pnpm run start:dev`        | Inicia em modo watch                          |
| `pnpm run start:prod`       | Inicia em modo producao                       |
| `pnpm run build`            | Compila o projeto                             |
| `pnpm run migration:run`    | Executa migrations pendentes                  |
| `pnpm run migration:revert` | Reverte ultima migration                      |
| `pnpm run seed`             | Popula banco com dados iniciais               |
| `pnpm run test`             | Roda testes unitarios                         |
| `pnpm run test:e2e`         | Roda testes e2e                               |
| `pnpm run test:cov`         | Roda testes com cobertura                     |

## Testes

```bash
pnpm run test
```
