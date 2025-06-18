# Atenas Backend - Dev Container Setup

## **Pré-requisitos**

- Docker Desktop instalado e rodando
- VS Code com extensão Dev Containers
- Git configurado

## **Setup Inicial**

### 1. Clone e Configure

```bash
git clone <repository-url>
cd atenas-backend
cp .env.example .env
```

### 2. Edite Variáveis de Ambiente

```bash
# Edite .env conforme necessário
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=atenas_dev
JWT_SECRET=sua-chave-secreta-aqui
```

## **Opção 1: VS Code Dev Container (Recomendado)**

### 1. Abrir no VS Code

```bash
code .
```

### 2. Reabrir no Container

- **Ctrl+Shift+P** → `Dev Containers: Reopen in Container`
- Aguarde build e setup automático (5-10 min na primeira vez)

### 3. Verificar Funcionamento

- Terminal integrado já estará dentro do container
- Extensões pre-instaladas automaticamente
- Aplicação inicia automaticamente em `http://localhost:3000`

## **Opção 2: Docker Compose Manual**

### 1. Setup Automatizado

```bash
chmod +x scripts/dev-setup.sh
./scripts/dev-setup.sh
```

### 2. Comandos Manuais

```bash
# Iniciar ambiente
make dev-start

# Verificar logs
make dev-logs

# Parar ambiente
make dev-stop
```

## **Comandos Essenciais**

| Comando              | Função                      |
|----------------------|-----------------------------|
| `make dev-start`     | Iniciar containers          |
| `make dev-stop`      | Parar containers            |
| `make dev-logs`      | Visualizar logs             |
| `make dev-shell`     | Shell do container app      |
| `make db-shell`      | Shell PostgreSQL            |
| `make migration-run` | Executar migrações          |
| `make test`          | Executar testes             |
| `make clean`         | Limpar volumes e containers |

## **Acessos do Ambiente**

| Serviço     | URL                       | Descrição            |
|-------------|---------------------------|----------------------|
| **API**     | http://localhost:3000     | Aplicação NestJS     |
| **Swagger** | http://localhost:3000/api | Documentação API     |
| **Adminer** | http://localhost:8080     | Interface PostgreSQL |
| **Debug**   | localhost:9229            | Porta de debug       |

## **Fluxo de Desenvolvimento**

### 1. Desenvolvimento Diário

```bash
# Iniciar ambiente
make dev-start

# Trabalhar normalmente
# Hot reload automático ativo

# Parar ao final
make dev-stop
```

### 2. Gerenciar Database

```bash
# Criar nova migração
make dev-shell
pnpm run migration:create

# Executar migrações pendentes
make migration-run

# Acessar database diretamente
make db-shell
```

### 3. Executar Testes

```bash
# Todos os testes
make test

# Testes específicos dentro do container
make dev-shell
pnpm run test:unit
pnpm run test:integration
pnpm run test:e2e
```

## **Estrutura de Arquivos**

```
├── .devcontainer/
│   └── devcontainer.json          # Configuração VS Code
├── docker-compose.dev.yaml        # Orquestração desenvolvimento
├── Dockerfile.dev                 # Imagem desenvolvimento
├── scripts/
│   ├── dev-setup.sh               # Setup automatizado
│   └── init-db.sql                # Inicialização database
├── Makefile                       # Comandos desenvolvimento
└── .env.example                   # Template variáveis
```

## **Troubleshooting**

### Container não inicia

```bash
# Verificar logs
docker-compose -f docker-compose.dev.yaml logs

# Rebuild completo
docker-compose -f docker-compose.dev.yaml down -v
docker-compose -f docker-compose.dev.yaml build --no-cache
```

### Database connection error

```bash
# Verificar status PostgreSQL
make db-shell

# Recriar volumes
make clean
make dev-setup
```

### Port já em uso

```bash
# Verificar portas ocupadas
lsof -i :3000
lsof -i :5432

# Parar processos conflitantes ou alterar portas no docker-compose.dev.yaml
```

### Performance lenta

```bash
# Verificar recursos Docker Desktop
# Aumentar CPU/Memory em Settings

# Limpar cache Docker
docker system prune -a
```

## **Comandos Debug**

### Logs Detalhados

```bash
# Logs específicos por serviço
docker-compose -f docker-compose.dev.yaml logs -f app
docker-compose -f docker-compose.dev.yaml logs -f db

# Monitorar recursos
docker stats
```

### Inspeção Container

```bash
# Entrar no container
make dev-shell

# Verificar variáveis ambiente
printenv

# Status aplicação
ps aux | grep node
```