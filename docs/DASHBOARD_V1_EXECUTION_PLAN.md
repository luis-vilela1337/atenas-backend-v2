# Plano de Execucao - Dashboard V1 Backend

## Visao Geral

Endpoint `GET /v1/dashboard/admin` protegido por `AdminGuard`, retornando metricas reais agregadas do sistema. Segue a arquitetura hexagonal do projeto (Presentation -> Application -> Core -> Infra).

---

## Fase 1: Camada de Apresentacao (Presentation)

### 1.1 DTO de Query - `DashboardQueryDto`

**Arquivo**: `src/presentation/dashboard/dto/dashboard-query.dto.ts`

```typescript
class DashboardQueryDto {
  @IsOptional() @IsDateString() startDate?: string   // ISO date
  @IsOptional() @IsDateString() endDate?: string     // ISO date
  @IsOptional() @IsUUID() institutionId?: string     // filtro por instituicao
}
```

**Regras**:
- Se `startDate`/`endDate` nao informados, assume mes atual (logica no Application)
- `institutionId` opcional, filtra todas as metricas quando presente

### 1.2 DTO de Response - `DashboardResponseDto`

**Arquivo**: `src/presentation/dashboard/dto/dashboard-response.dto.ts`

Deve tipar toda a resposta com `@ApiProperty` para documentacao Swagger:

```typescript
class DashboardResponseDto {
  period: PeriodDto                        // datas do periodo atual e anterior
  summary: SummaryDto                      // 4 cards principais
  revenueSeries: RevenueSeriesItemDto[]    // serie temporal
  ordersByPaymentStatus: StatusCountDto[]  // distribuicao pagamento
  itemsByFulfillmentStatus: StatusCountDto[] // distribuicao producao
  topProducts: TopProductDto[]             // ranking produtos
  topInstitutions: TopInstitutionDto[]     // ranking instituicoes
  recentOrders: RecentOrderDto[]           // ultimos pedidos
}
```

Sub-DTOs:
- `PeriodDto` { startDate, endDate, previousStartDate, previousEndDate }
- `SummaryCardDto` { value: number, variationPercent: number }
- `SummaryDto` { revenue, orders, pendingOrders, activeStudents } (cada um SummaryCardDto)
- `RevenueSeriesItemDto` { date: string, revenue: number, orders: number }
- `StatusCountDto` { status: string, count: number }
- `TopProductDto` { productId, productName, productType, quantitySold, revenue }
- `TopInstitutionDto` { institutionId, institutionName, contractNumber, orders, revenue, activeStudents }
- `RecentOrderDto` { id, displayId, userId, userName, institutionId, institutionName, contractNumber, totalAmount, paymentStatus, createdAt }

### 1.3 Controller - `DashboardController`

**Arquivo**: `src/presentation/dashboard/controller/dashboard.controller.ts`

```typescript
@ApiTags('dashboard')
@Controller('v1/dashboard')
@ApiBearerAuth()
export class DashboardController {
  constructor(private readonly dashboardApp: GetDashboardApplication) {}

  @Get('admin')
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: 'Dashboard administrativo com metricas reais' })
  @ApiQuery({ type: DashboardQueryDto })
  @ApiResponse({ status: 200, type: DashboardResponseDto })
  @HttpCode(HttpStatus.OK)
  async getAdminDashboard(@Query() query: DashboardQueryDto): Promise<DashboardResponseDto> {
    return this.dashboardApp.execute(query);
  }
}
```

**Pontos criticos**:
- [x] Protegido com `AdminGuard` (somente admin)
- [x] Rota versionada: `v1/dashboard/admin`
- [x] Swagger completo com `@ApiQuery` e `@ApiResponse`

---

## Fase 2: Camada de Aplicacao (Application)

### 2.1 Application Service - `GetDashboardApplication`

**Arquivo**: `src/application/dashboard/get-dashboard.application.ts`

Responsabilidades:
1. Receber `DashboardQueryDto`
2. Calcular periodo default (mes atual) se nao informado
3. Calcular periodo anterior equivalente para variacao percentual
4. Chamar `GetDashboardUseCase` com input tipado
5. Usar `DashboardAdapter` para mapear resultado -> `DashboardResponseDto`

```typescript
@Injectable()
export class GetDashboardApplication {
  constructor(private readonly getDashboardUseCase: GetDashboardUseCase) {}

  async execute(query: DashboardQueryDto): Promise<DashboardResponseDto> {
    const { startDate, endDate } = this.resolvePeriod(query);
    const { previousStartDate, previousEndDate } = this.calculatePreviousPeriod(startDate, endDate);

    const input: GetDashboardInput = {
      startDate, endDate,
      previousStartDate, previousEndDate,
      institutionId: query.institutionId,
    };

    const result = await this.getDashboardUseCase.execute(input);
    return DashboardAdapter.toResponseDto(result, input);
  }

  private resolvePeriod(query: DashboardQueryDto) {
    // Se nao informado, mes atual
    const now = new Date();
    const startDate = query.startDate
      ? new Date(query.startDate)
      : new Date(now.getFullYear(), now.getMonth(), 1);
    const endDate = query.endDate
      ? new Date(query.endDate)
      : new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    return { startDate, endDate };
  }

  private calculatePreviousPeriod(startDate: Date, endDate: Date) {
    // Periodo anterior com mesma duracao
    const durationMs = endDate.getTime() - startDate.getTime();
    const previousEndDate = new Date(startDate.getTime() - 1);
    const previousStartDate = new Date(previousEndDate.getTime() - durationMs);
    return { previousStartDate, previousEndDate };
  }
}
```

### 2.2 Adapter - `DashboardAdapter`

**Arquivo**: `src/application/dashboard/adapters/dashboard.adapter.ts`

Mapeia `GetDashboardResult` (dominio) -> `DashboardResponseDto` (apresentacao).

Calcula `variationPercent` para cada card:
```
variacao = previousValue === 0 ? (currentValue > 0 ? 100 : 0)
         : ((currentValue - previousValue) / previousValue) * 100
```

---

## Fase 3: Camada Core (Domain)

### 3.1 Input/Output do Use Case

**Arquivo**: `src/core/dashboard/dto/get-dashboard.dto.ts`

```typescript
interface GetDashboardInput {
  startDate: Date
  endDate: Date
  previousStartDate: Date
  previousEndDate: Date
  institutionId?: string
}

interface GetDashboardResult {
  currentRevenue: number
  previousRevenue: number
  currentOrders: number
  previousOrders: number
  currentPendingOrders: number
  previousPendingOrders: number
  currentActiveStudents: number
  previousActiveStudents: number
  revenueSeries: { date: string; revenue: number; orders: number }[]
  ordersByPaymentStatus: { status: string; count: number }[]
  itemsByFulfillmentStatus: { status: string; count: number }[]
  topProducts: { productId: string; productName: string; productType: string; quantitySold: number; revenue: number }[]
  topInstitutions: { institutionId: string; institutionName: string; contractNumber: string; orders: number; revenue: number; activeStudents: number }[]
  recentOrders: { id: string; displayId: number; userId: string; userName: string; institutionId: string; institutionName: string; contractNumber: string; totalAmount: number; paymentStatus: string; createdAt: Date }[]
}
```

### 3.2 Repository Interface

**Arquivo**: `src/core/dashboard/repositories/dashboard.repository.interface.ts`

```typescript
interface DashboardRepositoryInterface {
  getRevenue(startDate: Date, endDate: Date, institutionId?: string): Promise<number>
  getOrdersCount(startDate: Date, endDate: Date, institutionId?: string): Promise<number>
  getPendingOrdersCount(startDate: Date, endDate: Date, institutionId?: string): Promise<number>
  getActiveStudentsCount(institutionId?: string): Promise<number>
  getRevenueSeries(startDate: Date, endDate: Date, granularity: 'day' | 'month', institutionId?: string): Promise<{ date: string; revenue: number; orders: number }[]>
  getOrdersByPaymentStatus(startDate: Date, endDate: Date, institutionId?: string): Promise<{ status: string; count: number }[]>
  getItemsByFulfillmentStatus(startDate: Date, endDate: Date, institutionId?: string): Promise<{ status: string; count: number }[]>
  getTopProducts(startDate: Date, endDate: Date, limit: number, institutionId?: string): Promise<TopProductResult[]>
  getTopInstitutions(startDate: Date, endDate: Date, limit: number): Promise<TopInstitutionResult[]>
  getRecentOrders(limit: number, institutionId?: string): Promise<RecentOrderResult[]>
}
```

### 3.3 Use Case - `GetDashboardUseCase`

**Arquivo**: `src/core/dashboard/get-dashboard.usecase.ts`

```typescript
@Injectable()
export class GetDashboardUseCase {
  constructor(
    @Inject('DashboardRepositoryInterface')
    private readonly repo: DashboardRepositoryInterface,
  ) {}

  async execute(input: GetDashboardInput): Promise<GetDashboardResult> {
    const granularity = this.resolveGranularity(input.startDate, input.endDate);

    // Executa queries em paralelo para performance
    const [
      currentRevenue, previousRevenue,
      currentOrders, previousOrders,
      currentPendingOrders, previousPendingOrders,
      currentActiveStudents, previousActiveStudents,
      revenueSeries,
      ordersByPaymentStatus,
      itemsByFulfillmentStatus,
      topProducts,
      topInstitutions,
      recentOrders,
    ] = await Promise.all([
      this.repo.getRevenue(input.startDate, input.endDate, input.institutionId),
      this.repo.getRevenue(input.previousStartDate, input.previousEndDate, input.institutionId),
      this.repo.getOrdersCount(input.startDate, input.endDate, input.institutionId),
      this.repo.getOrdersCount(input.previousStartDate, input.previousEndDate, input.institutionId),
      this.repo.getPendingOrdersCount(input.startDate, input.endDate, input.institutionId),
      this.repo.getPendingOrdersCount(input.previousStartDate, input.previousEndDate, input.institutionId),
      this.repo.getActiveStudentsCount(input.institutionId),
      this.repo.getActiveStudentsCount(input.institutionId), // Mesmo valor (nao depende de periodo)
      this.repo.getRevenueSeries(input.startDate, input.endDate, granularity, input.institutionId),
      this.repo.getOrdersByPaymentStatus(input.startDate, input.endDate, input.institutionId),
      this.repo.getItemsByFulfillmentStatus(input.startDate, input.endDate, input.institutionId),
      this.repo.getTopProducts(input.startDate, input.endDate, 10, input.institutionId),
      this.repo.getTopInstitutions(input.startDate, input.endDate, 10),
      this.repo.getRecentOrders(10, input.institutionId),
    ]);

    return {
      currentRevenue, previousRevenue,
      currentOrders, previousOrders,
      currentPendingOrders, previousPendingOrders,
      currentActiveStudents, previousActiveStudents,
      revenueSeries, ordersByPaymentStatus, itemsByFulfillmentStatus,
      topProducts, topInstitutions, recentOrders,
    };
  }

  private resolveGranularity(start: Date, end: Date): 'day' | 'month' {
    const diffDays = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
    return diffDays > 90 ? 'month' : 'day';
  }
}
```

**Ponto critico - Performance**: Todas as queries executam em paralelo via `Promise.all`. Cada query e independente.

**Ponto critico - activeStudents**: Formandos ativos nao dependem de periodo (sao usuarios ativos agora). A variacao sera 0 a menos que o periodo anterior mostre contagem diferente - na V1 retorna a mesma contagem para ambos.

---

## Fase 4: Camada de Infraestrutura (Infra)

### 4.1 Repository Implementation - `DashboardRepository`

**Arquivo**: `src/infra/data/sql/repositories/dashboard.repository.ts`

Implementa `DashboardRepositoryInterface` usando queries SQL otimizadas.

#### Queries SQL para cada metodo:

**getRevenue** - Soma de `totalAmount` de pedidos APPROVED/COMPLETED no periodo
```sql
SELECT COALESCE(SUM(o.total_amount), 0) as revenue
FROM orders o
WHERE o.payment_status IN ('APPROVED', 'COMPLETED')
  AND o.created_at >= $1 AND o.created_at <= $2
  [AND o.contract_unique_id = $3]  -- se institutionId informado
```

**Ponto critico - institutionId**: A tabela `orders` tem `contract_unique_id` que referencia a institution. O filtro por instituicao no pedido deve usar esse campo (ou JOIN com user -> institution).

**getOrdersCount** - Total de pedidos criados no periodo
```sql
SELECT COUNT(*) as count
FROM orders o
WHERE o.created_at >= $1 AND o.created_at <= $2
  [AND o.contract_unique_id = $3]
```

**getPendingOrdersCount** - Pedidos PENDING no periodo
```sql
SELECT COUNT(*) as count
FROM orders o
WHERE o.payment_status = 'PENDING'
  AND o.created_at >= $1 AND o.created_at <= $2
  [AND o.contract_unique_id = $3]
```

**getActiveStudentsCount** - Usuarios client ativos
```sql
SELECT COUNT(*) as count
FROM users u
WHERE u.role = 'client' AND u.status = 'active'
  [AND u.institution_id = $1]
```

**getRevenueSeries** - Serie temporal receita + pedidos por dia/mes
```sql
-- Granularidade diaria:
SELECT
  DATE(o.created_at) as date,
  COALESCE(SUM(CASE WHEN o.payment_status IN ('APPROVED','COMPLETED') THEN o.total_amount ELSE 0 END), 0) as revenue,
  COUNT(*) as orders
FROM orders o
WHERE o.created_at >= $1 AND o.created_at <= $2
  [AND o.contract_unique_id = $3]
GROUP BY DATE(o.created_at)
ORDER BY date ASC
```

```sql
-- Granularidade mensal:
SELECT
  TO_CHAR(o.created_at, 'YYYY-MM') as date,
  COALESCE(SUM(CASE WHEN o.payment_status IN ('APPROVED','COMPLETED') THEN o.total_amount ELSE 0 END), 0) as revenue,
  COUNT(*) as orders
FROM orders o
WHERE o.created_at >= $1 AND o.created_at <= $2
  [AND o.contract_unique_id = $3]
GROUP BY TO_CHAR(o.created_at, 'YYYY-MM')
ORDER BY date ASC
```

**getOrdersByPaymentStatus** - Distribuicao por status de pagamento
```sql
SELECT o.payment_status as status, COUNT(*) as count
FROM orders o
WHERE o.created_at >= $1 AND o.created_at <= $2
  [AND o.contract_unique_id = $3]
GROUP BY o.payment_status
ORDER BY count DESC
```

**getItemsByFulfillmentStatus** - Distribuicao de itens por status de producao
```sql
SELECT oi.fulfillment_status as status, COUNT(*) as count
FROM order_items oi
  INNER JOIN orders o ON o.id = oi.order_id
WHERE o.created_at >= $1 AND o.created_at <= $2
  [AND o.contract_unique_id = $3]
GROUP BY oi.fulfillment_status
ORDER BY count DESC
```

**getTopProducts** - Ranking de produtos mais vendidos
```sql
SELECT
  oi.product_id as "productId",
  oi.product_name as "productName",
  oi.product_type as "productType",
  SUM(oi.quantity) as "quantitySold",
  SUM(oi.item_price * oi.quantity) as revenue
FROM order_items oi
  INNER JOIN orders o ON o.id = oi.order_id
WHERE o.payment_status IN ('APPROVED', 'COMPLETED')
  AND o.created_at >= $1 AND o.created_at <= $2
  [AND o.contract_unique_id = $3]
GROUP BY oi.product_id, oi.product_name, oi.product_type
ORDER BY revenue DESC
LIMIT $4
```

**getTopInstitutions** - Ranking de instituicoes
```sql
SELECT
  i.id as "institutionId",
  i.name as "institutionName",
  i.contract_number as "contractNumber",
  COUNT(DISTINCT o.id) as orders,
  COALESCE(SUM(CASE WHEN o.payment_status IN ('APPROVED','COMPLETED') THEN o.total_amount ELSE 0 END), 0) as revenue,
  (SELECT COUNT(*) FROM users u WHERE u.institution_id = i.id AND u.role = 'client' AND u.status = 'active') as "activeStudents"
FROM institutions i
  INNER JOIN users u2 ON u2.institution_id = i.id
  INNER JOIN orders o ON o.user_id = u2.id
WHERE o.created_at >= $1 AND o.created_at <= $2
GROUP BY i.id, i.name, i.contract_number
ORDER BY revenue DESC
LIMIT $3
```

**Ponto critico**: A relacao order -> institution nao e direta (nao ha FK institution_id na tabela orders). Existem duas opcoes:
1. JOIN via `orders.user_id -> users.institution_id -> institutions.id`
2. Usar `orders.contract_unique_id` (que e o UUID da institution armazenado como string)

Verificar qual campo e mais confiavel. O campo `contract_unique_id` parece ser o institution ID, o que simplifica o filtro sem JOIN.

**getRecentOrders** - Ultimos pedidos com dados do usuario e instituicao
```sql
SELECT
  o.id, o.display_id as "displayId",
  o.user_id as "userId",
  u.name as "userName",
  i.id as "institutionId",
  i.name as "institutionName",
  i.contract_number as "contractNumber",
  o.total_amount as "totalAmount",
  o.payment_status as "paymentStatus",
  o.created_at as "createdAt"
FROM orders o
  INNER JOIN users u ON u.id = o.user_id
  INNER JOIN institutions i ON i.id = u.institution_id
  [WHERE o.contract_unique_id = $1]  -- se institutionId informado
ORDER BY o.created_at DESC
LIMIT $2
```

---

## Fase 5: Registro nos Modulos DI

### 5.1 `src/di/infra.module.ts`

Adicionar:
```typescript
import { DashboardRepository } from '@infrastructure/data/sql/repositories/dashboard.repository';

// Em providers:
DashboardRepository,
{ provide: 'DashboardRepositoryInterface', useClass: DashboardRepository },

// Em exports:
DashboardRepository,
'DashboardRepositoryInterface',
```

### 5.2 `src/di/core.module.ts`

Adicionar:
```typescript
import { GetDashboardUseCase } from '@core/dashboard/get-dashboard.usecase';

// Em providers e exports:
GetDashboardUseCase,
```

### 5.3 `src/di/application.module.ts`

Adicionar:
```typescript
import { GetDashboardApplication } from '@application/dashboard/get-dashboard.application';

// Em providers e exports:
GetDashboardApplication,
```

### 5.4 `src/di/presentation.module.ts`

Adicionar:
```typescript
import { DashboardController } from '@presentation/dashboard/controller/dashboard.controller';

// Em controllers:
DashboardController,
```

---

## Fase 6: Testes

### 6.1 Testes Unitarios

**Use Case** (`test/unit/core/dashboard/get-dashboard.usecase.spec.ts`):
- Mock do `DashboardRepositoryInterface`
- Testar resolucao de granularidade (< 90 dias = day, >= 90 = month)
- Testar que todas as queries sao chamadas com parametros corretos
- Testar que resultado e montado corretamente

**Application** (`test/unit/application/dashboard/get-dashboard.application.spec.ts`):
- Mock do `GetDashboardUseCase`
- Testar calculo de periodo default (mes atual)
- Testar calculo de periodo anterior
- Testar que adapter mapeia corretamente

**Adapter** (`test/unit/application/dashboard/dashboard.adapter.spec.ts`):
- Testar calculo de variacao percentual (positiva, negativa, zero, divisao por zero)
- Testar mapeamento de todos os campos

### 6.2 Testes de Integracao (futuro)

- Testar endpoint completo com banco de dados real
- Verificar que filtros funcionam
- Verificar resposta com dados zerados

---

## Pontos Criticos Indexados

| # | Ponto | Risco | Mitigacao |
|---|-------|-------|-----------|
| 1 | **Relacao Order-Institution** | O campo `contractUniqueId` da Order pode nao ser o UUID da institution em todos os casos | Verificar dados existentes. Fallback: JOIN via user.institution_id |
| 2 | **Performance das queries** | 14 queries paralelas podem sobrecarregar o banco | Todas sao queries simples com indices existentes. Monitorar EXPLAIN ANALYZE |
| 3 | **Indices necessarios** | Queries de agregacao podem ser lentas sem indices adequados | `orders.created_at` e `orders.payment_status` ja tem indice. Verificar se precisa indice composto |
| 4 | **Variacao % do activeStudents** | Formandos ativos nao variam por periodo na V1 | Retornar variacao 0 ou calcular com base em createdAt dos users |
| 5 | **Valores monetarios** | Inconsistencia de precisao decimal | Usar `COALESCE` e `::numeric` em todas as queries. Retornar como number (reais) |
| 6 | **Timezone** | Datas podem ser interpretadas em timezone errado | Usar `timestamp with time zone` (ja padrao do projeto). Converter input ISO para Date UTC |
| 7 | **Pedidos sem usuario/instituicao** | JOINs podem excluir pedidos orfaos | Usar LEFT JOIN onde apropriado, filtrar NULLs no adapter |
| 8 | **Seguranca** | SQL Injection via parametros | Usar parametros posicionais ($1, $2) em todas as raw queries, nunca concatenar |
| 9 | **Dados zerados** | Frontend pode quebrar com arrays vazios | Garantir que todas as metricas retornam defaults (0, []) em vez de null |
| 10 | **Granularidade da serie** | Frontend espera formato de data consistente | Day: `YYYY-MM-DD`, Month: `YYYY-MM`. Documentar no Swagger |

---

## Ordem de Implementacao

1. DTOs (query + response) - sem dependencias
2. Repository Interface (core) - contrato
3. Repository Implementation (infra) - queries SQL
4. Use Case (core) - orquestracao
5. Adapter (application) - mapeamento
6. Application Service - cola tudo
7. Controller - endpoint HTTP
8. Registro DI - modulos
9. Testes unitarios
10. Validacao manual via Swagger

---

## Estrutura Final de Arquivos

```
src/
  presentation/dashboard/
    controller/dashboard.controller.ts
    dto/dashboard-query.dto.ts
    dto/dashboard-response.dto.ts
  application/dashboard/
    get-dashboard.application.ts
    adapters/dashboard.adapter.ts
  core/dashboard/
    get-dashboard.usecase.ts
    dto/get-dashboard.dto.ts
    repositories/dashboard.repository.interface.ts
  infra/data/sql/repositories/
    dashboard.repository.ts
  di/
    (atualizar 4 modulos)
test/
  unit/core/dashboard/
    get-dashboard.usecase.spec.ts
  unit/application/dashboard/
    get-dashboard.application.spec.ts
    dashboard.adapter.spec.ts
```
