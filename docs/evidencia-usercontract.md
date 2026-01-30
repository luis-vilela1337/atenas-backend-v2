# Evidência: Campo userContract Implementado

## Descrição
Campo `userContract` adicionado ao endpoint `/v1/users/{id}` retornando a concatenação do número de contrato da instituição com o identificador do aluno.

## Ambiente de Teste
- **URL:** https://atenas-backend-v2-stg.up.railway.app
- **Data:** 2026-01-30
- **Endpoint testado:** `GET /v1/users/{id}`

## Comando para Teste

### 1. Autenticação
```bash
curl -X POST https://atenas-backend-v2-stg.up.railway.app/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"atenasfsite@gmail.com","password":"Password1!"}'
```

**Resposta (token):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": { ... }
}
```

### 2. Teste do Campo userContract

```bash
# Substitua {TOKEN} pelo token obtido no passo anterior
curl -X GET "https://atenas-backend-v2-stg.up.railway.app/v1/users/3dcd7c6e-1d1e-4a9b-8abd-7c101d9ccf99" \
  -H "Authorization: Bearer {TOKEN}" \
  -H "Content-Type: application/json"
```

## Resultado do Teste

**Resposta (campos relevantes):**
```json
{
  "id": "3dcd7c6e-1d1e-4a9b-8abd-7c101d9ccf99",
  "name": "Atenas Formaturas fsite",
  "identifier": "011",
  "institutionId": "9398d2b1-8a42-4ee6-9ef5-69a7f28f9177",
  "userContract": "01-011",
  "email": "atenasfsite@gmail.com",
  "role": "admin"
}
```

## ✅ Validação

- ✅ Campo `userContract` presente na resposta
- ✅ Valor correto: `"01-011"` (contractNumber: "01" + "-" + identifier: "011")
- ✅ Formato padronizado com hífen entre contractNumber e identifier
- ✅ Consistente com endpoint de listagem `/v1/users`

## Comando Completo (Copy/Paste)

Para facilitar, aqui está um comando completo que faz login e testa automaticamente:

```bash
# Obter token e testar userContract
TOKEN=$(curl -s -X POST https://atenas-backend-v2-stg.up.railway.app/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"atenasfsite@gmail.com","password":"Password1!"}' | jq -r '.token')

echo "Token obtido: ${TOKEN:0:50}..."
echo ""
echo "=== Testando campo userContract ==="
echo ""

curl -s -X GET "https://atenas-backend-v2-stg.up.railway.app/v1/users/3dcd7c6e-1d1e-4a9b-8abd-7c101d9ccf99" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" | jq '{
  id,
  name,
  identifier,
  institutionId,
  userContract,
  email,
  role
}'
```

## Screenshot da Resposta

```
{
  "id": "3dcd7c6e-1d1e-4a9b-8abd-7c101d9ccf99",
  "name": "Atenas Formaturas fsite",
  "identifier": "011",
  "institutionId": "9398d2b1-8a42-4ee6-9ef5-69a7f28f9177",
  "userContract": "01-011",  ← CAMPO ADICIONADO
  "email": "atenasfsite@gmail.com",
  "role": "admin"
}
```
