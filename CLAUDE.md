# CLAUDE.md - Atenas Backend V2

## Projeto

Backend NestJS para plataforma de gestao de formaturas (fotos, albums, pedidos, pagamentos). Arquitetura hexagonal com camadas bem definidas.

## Stack

- **Runtime**: Node.js + TypeScript
- **Framework**: NestJS 10.4
- **ORM**: TypeORM 0.3
- **Banco**: PostgreSQL 16.4
- **Auth**: JWT (passport-jwt)
- **Pagamento**: Mercado Pago SDK
- **Storage**: Google Cloud Storage
- **Email**: MailerSend
- **Validacao**: class-validator + class-transformer
- **Docs**: Swagger/OpenAPI
- **Testes**: Jest + supertest

## Arquitetura de Camadas

```
src/
  presentation/   -> Controllers, DTOs, Guards, Strategies
  application/    -> Application Services (orquestração), Adapters/Mappers
  core/           -> Use Cases, Entities de domínio, Interfaces de repositório
  infra/          -> Repositórios SQL, Serviços externos, Migrations, Jobs
  di/             -> Módulos NestJS (DI)
```

### Fluxo de uma request

```
Controller (presentation)
  -> ApplicationService (application)
    -> Adapter: DTO → Input do domínio
    -> UseCase (core)
      -> RepositoryInterface (core - contrato)
        -> RepositoryImpl (infra - TypeORM)
    -> Adapter: Output do domínio → Response DTO
  -> Response HTTP
```

## Path Aliases (tsconfig)

```
@presentation/*   -> src/presentation/*
@infrastructure/* -> src/infra/*
@core/*           -> src/core/*
@application/*    -> src/application/*
@di/*             -> src/di/*
@test/*           -> test/*
```

## Convenções de Nomenclatura

### Arquivos
- Controllers: `{feature}.controller.ts`
- Application Services: `{acao}-{feature}.application.ts`
- Use Cases: `{acao}.usecase.ts` ou `{acao}/{usecase.ts}`
- DTOs: `{acao}-{feature}.dto.ts`
- Entities ORM: `{feature}.entity.ts`
- Repositories impl: `{feature}.repository.ts`
- Repository interfaces: `{feature}.repository.interface.ts`
- Migrations: `{timestamp}-{Descricao}.ts`
- Adapters/Mappers: `{feature}.adapter.ts` ou `{feature}.mapper.{contexto}.ts`

### Classes
- Controllers: `OrdersController`, `ProductsController`
- Application: `CreateOrderApplication`, `FindOrdersApplication`
- Use Cases: `CreateOrderUseCase`, `FindOrdersUseCase`
- DTOs: `CreateOrderDto`, `OrderListResponseDto`
- Repositories: `OrderRepository` (impl), `OrderRepositoryInterface` (contrato)

### Propriedades
- TypeScript: camelCase
- Banco (colunas): snake_case (mapeado via decorators TypeORM)
- Rotas HTTP: kebab-case, versionadas (`/v1/orders`)

## Módulos DI (src/di/)

Hierarquia de imports:

```
RootModule
  └── PresentationModule (controllers)
        └── ApplicationModule (app services)
              └── CoreModule (use cases)
                    └── InfraModule (repos, services, guards, strategies)
```

Para adicionar uma feature nova, registrar em TODOS os módulos na cadeia:
1. `infra.module.ts` - repository impl + provider com token de interface
2. `core.module.ts` - use case(s)
3. `application.module.ts` - application service(s)
4. `presentation.module.ts` - controller

Repositories com interface usam token de injeção:
```typescript
{ provide: 'DashboardRepositoryInterface', useClass: DashboardRepository }
```

E no use case:
```typescript
@Inject('DashboardRepositoryInterface') private readonly repo: DashboardRepositoryInterface
```

## Entidades Principais

### Order
- `id` (UUID), `displayId` (auto-increment), `userId` (FK User)
- `totalAmount` (decimal 10,2), `paymentStatus` (enum OrderStatus)
- `paymentGatewayId`, `contractNumber`, `contractUniqueId`
- `shippingAddress` (JSONB), `creditUsed` (decimal), `creditRestored` (bool)
- Relacao: `items` -> OrderItem[] (OneToMany)

### OrderItem
- `id` (UUID), `orderId` (FK Order), `productId` (FK Product)
- `productName`, `productType` (enum ProductFlag)
- `itemPrice` (decimal 10,2), `quantity` (int)
- `fulfillmentStatus` (varchar, default ORDER_RECEIVED)
- `completedAt` (timestamp nullable)

### User
- `id` (UUID), `email` (unique), `role` ('admin' | 'client'), `status` ('active' | 'inactive')
- `name`, `institution` (ManyToOne -> Institution)
- `creditValue`, `creditReserved` (decimal)

### Institution
- `id` (UUID), `contractNumber` (unique), `name`
- Relacoes: `users`, `events`, `institutionProducts`

### Product
- `id` (UUID), `name`, `flag` (enum: ALBUM, GENERIC, DIGITAL_FILES)

## Enums do Domínio

```typescript
enum OrderStatus {
  PENDING, APPROVED, REJECTED, CANCELLED, COMPLETED
}

enum FulfillmentStatus {
  ORDER_RECEIVED, PHOTOS_SEPARATED, PRODUCT_MANUFACTURED, IN_TRANSIT, DELIVERED, SENT
}

enum ProductFlag {
  ALBUM, GENERIC, DIGITAL_FILES
}

type UserRole = 'admin' | 'client'
type UserStatus = 'active' | 'inactive'
```

## Padrões de Guards

- `JwtCustomAuthGuard` - JWT base, verifica `@SetMetadata('isPublic', true)`
- `AdminGuard` - Extends JwtCustomAuthGuard, exige `user.role === 'admin'`
- `ClientGuard` - Para rotas client-only
- Rota pública: `@SetMetadata('isPublic', true)`

## Padrões de Query

### Paginação
```typescript
const skip = (page - 1) * limit;
const [items, total] = await queryBuilder.skip(skip).take(limit).getManyAndCount();
const totalPages = Math.ceil(total / limit);
```

### Filtros condicionais
```typescript
if (filter?.campo) {
  queryBuilder.andWhere('alias.campo = :campo', { campo: filter.campo });
}
```

### Transações atômicas
```typescript
const queryRunner = this.dataSource.createQueryRunner();
await queryRunner.connect();
await queryRunner.startTransaction();
try { /* ... */ await queryRunner.commitTransaction(); }
catch { await queryRunner.rollbackTransaction(); throw error; }
finally { await queryRunner.release(); }
```

## Padrão de DTOs (Query Params)

```typescript
export class ExampleQueryDto {
  @ApiProperty({ required: false, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  institutionId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  startDate?: string;
}
```

## Padrão de Controller

```typescript
@ApiTags('feature')
@Controller('v1/feature')
@ApiBearerAuth()
@UseGuards(AdminGuard)
export class FeatureController {
  constructor(private readonly appService: FeatureApplication) {}

  @Get()
  @ApiOperation({ summary: 'Descricao' })
  @ApiQuery({ type: QueryDto })
  @ApiResponse({ status: 200, type: ResponseDto })
  @HttpCode(HttpStatus.OK)
  async list(@Query() query: QueryDto): Promise<ResponseDto> {
    return this.appService.execute(query);
  }
}
```

## Migrations

- Diretório: `src/infra/data/migrations/`
- Criar: `pnpm run migration:create`
- Gerar do schema: `pnpm run migration:generate`
- Executar: `pnpm run migration:run`
- Padrão: classe com `up()` e `down()`, SQL raw via `queryRunner.query()`

## Testes

- Unit: `*.spec.ts` (jest-unit-config)
- Integration: `*.integration.test.ts` (jest-integration-config)
- Rodar: `pnpm test`, `pnpm test:unit`, `pnpm test:integration`
- Coverage threshold: 90% lines

## Valores Monetários

- Retornados como `number` (decimal, em reais)
- Precisão: 2 casas decimais (decimal 10,2 no banco)

## Comandos Úteis

```bash
pnpm install          # Instalar dependências
pnpm start:dev        # Dev server
pnpm build            # Build
pnpm test             # Todos os testes
pnpm test:unit        # Unit tests
pnpm lint             # ESLint
pnpm migration:run    # Rodar migrations
pnpm migration:create # Criar migration
```
