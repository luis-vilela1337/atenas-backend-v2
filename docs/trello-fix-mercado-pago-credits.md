# [Frontend] Tratar novo fluxo de pagamento com credito

## Descricao
O `POST /v1/orders` agora retorna um campo `paymentMethod` que indica como o pedido foi pago. O frontend precisa tratar esse campo para decidir se redireciona ao Mercado Pago ou mostra tela de confirmacao.

## TODO

- [ ] Tratar `paymentMethod` no response do `POST /v1/orders`:
  - `"FREE"` → mostrar tela de confirmacao (pedido aprovado)
  - `"CREDIT"` → mostrar tela de confirmacao com credito usado e saldo restante
  - `"MERCADO_PAGO"` → redirecionar para `mercadoPagoCheckoutUrl`
- [ ] Exibir `creditUsed` e `remainingCredit` na tela de confirmacao quando `paymentMethod === "CREDIT"`
- [ ] Tela de cancelamento admin: `PUT /v1/orders/:id/cancel` retorna `creditReleased` (exibir quanto credito foi devolvido)

## Response do `POST /v1/orders`

```json
{
  "orderId": "uuid",
  "mercadoPagoCheckoutUrl": "https://...",
  "paymentMethod": "CREDIT",
  "contractNumber": "INST-001-002",
  "creditUsed": 150.00,
  "remainingCredit": 350.00
}
```

| Campo                    | Tipo   | Quando aparece            |
|--------------------------|--------|---------------------------|
| `orderId`                | string | Sempre                    |
| `mercadoPagoCheckoutUrl` | string | Sempre                    |
| `paymentMethod`          | string | Sempre                    |
| `contractNumber`         | string | Sempre                    |
| `creditUsed`             | number | `CREDIT` e `MERCADO_PAGO` |
| `remainingCredit`        | number | `CREDIT`                  |

## Criterios de aceite

1. Quando `paymentMethod === "FREE"` ou `"CREDIT"`, o frontend NAO redireciona para o Mercado Pago
2. Quando `paymentMethod === "CREDIT"`, exibir: "Credito utilizado: R$ X" e "Saldo restante: R$ Y"
3. Quando `paymentMethod === "MERCADO_PAGO"`, redirecionar normalmente para `mercadoPagoCheckoutUrl`

## Observacao
O backend ja foi atualizado e esta disponivel no staging. O `CreateOrderResponseDto` e o `OrderAdapter` agora expoe todos os campos: `paymentMethod`, `creditUsed`, `remainingCredit` e `contractNumber`. Testado e validado nos tres fluxos (CREDIT, MERCADO_PAGO e FREE).
