# Configuração do Backend - INCLUSIVA E-commerce

## Visão Geral

Este projeto está configurado para se conectar a uma API Django REST Framework com autenticação JWT. A especificação completa da API está disponível em `E-Commerce API.yaml` (OpenAPI 3.0.3) na raiz do projeto — ela é a fonte da verdade para os tipos e endpoints implementados em `src/app/services/api.ts`.

## Configuração da URL da API

A URL base da API vem da variável de ambiente `VITE_API_BASE_URL`. Copie `.env.example` para `.env`:

```env
VITE_API_BASE_URL=http://localhost:8000/api
```

- Desenvolvimento local: `http://localhost:8000/api`
- Produção: `https://sua-api.com/api`

Não é necessário editar `api.ts` — ele já lê `import.meta.env.VITE_API_BASE_URL`.

## Endpoints Principais

### Autenticação
- `POST /auth/register/` - Registro de novo usuário (username, email, password, password2)
- `POST /auth/login/` - Login **por username** (não email) — retorna access e refresh tokens
- `POST /auth/refresh/` - Renovar access token
- `GET /auth/me/` - Obter dados do usuário atual
- `PATCH /auth/me_update/` - Atualizar perfil do usuário
- `POST /auth/` - Criação de usuário via rota administrativa genérica
- `GET/PATCH /auth/admin/users/` - Gestão de usuários e papéis (admin)

### Produtos
- `GET /products/` - Listar produtos (paginado)
- `GET /products/{slug}/` - Detalhes de um produto
- `POST /products/` - Criar produto (ADMIN)
- `PATCH /products/{slug}/` - Atualizar produto (ADMIN)
- `DELETE /products/{slug}/` - Excluir produto (ADMIN)

### Categorias
- `GET /products/categories/` - Listar categorias
- `GET /products/categories/{slug}/` - Detalhes de uma categoria
- `POST /products/categories/` - Criar categoria (ADMIN)

### Carrinho
- `GET /cart/` - Obter carrinho do usuário
- `POST /cart/add/` - Adicionar item ao carrinho
- `PATCH /cart/{id}/update_quantity/` - Atualizar quantidade
- `DELETE /cart/{id}/remove/` - Remover item
- `DELETE /cart/clear/` - Limpar carrinho

### Pedidos
- `GET /orders/` - Listar pedidos do usuário
- `GET /orders/{id}/` - Detalhes de um pedido
- `POST /orders/` - Criar novo pedido
- `POST /orders/{id}/cancel/` - Cancelar pedido
- `PATCH /orders/{id}/status/` - Atualizar status (ADMIN)

### Pagamentos
- `POST /payments/process/` - Processar pagamento
- `POST /payments/{id}/refund/` - Processar reembolso (ADMIN)

### Relatórios (ADMIN)
- `GET /reports/dashboard/` - Estatísticas do dashboard
- `GET /reports/sales/` - Relatório de vendas
- `GET /reports/best_sellers/` - Produtos mais vendidos
- `GET /reports/monthly_revenue/` - Receita mensal

## Autenticação JWT

O sistema usa JWT (JSON Web Tokens) para autenticação:

1. **Login**: Usuário faz login e recebe `access` e `refresh` tokens
2. **Armazenamento**: Tokens são salvos no `localStorage`
3. **Requisições**: Todas as requisições autenticadas incluem o header:
   ```
   Authorization: Bearer {access_token}
   ```
4. **Renovação**: Quando o access token expira, usa-se o refresh token para obter um novo

## Papéis de Usuário (RBAC)

- **CUSTOMER**: Cliente regular da loja
  - Acesso à loja pública
  - Gerenciar carrinho e pedidos
  - Ver histórico de compras

- **ADMIN**: Administrador da loja
  - Todos os acessos de CUSTOMER
  - Gerenciar produtos e categorias
  - Gerenciar pedidos de todos os usuários
  - Acessar relatórios e dashboard admin
  - Gerenciar inventário

## Testando a Integração

O frontend não tem mais fallback com dados mockados — todo o catálogo, carrinho e pedidos dependem do backend estar no ar. Para testar a camada de API sem subir um backend real, use os testes de contrato (Vitest + MSW): `npm run test`.

### Com Backend

1. **Inicie seu servidor Django**:
   ```bash
   python manage.py runserver
   ```

2. **Configure a URL no frontend** (`/src/app/services/api.ts`)

3. **Crie um super usuário admin**:
   ```bash
   python manage.py createsuperuser
   ```

4. **Teste os endpoints**:
   - Acesse `/login` e faça login
   - Crie produtos no painel admin (`/admin`)
   - Faça compras como cliente

## Variáveis de Ambiente

Copie `.env.example` para `.env` na raiz do projeto:

```env
VITE_API_BASE_URL=http://localhost:8000/api
```

## CORS (Cross-Origin Resource Sharing)

Certifique-se de que seu backend Django está configurado para aceitar requisições do frontend:

```python
# settings.py
INSTALLED_APPS = [
    ...
    'corsheaders',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    ...
]

CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",  # Vite dev server
    "http://localhost:3000",
]

# Ou para desenvolvimento:
CORS_ALLOW_ALL_ORIGINS = True
```

## Moeda e Localização

O sistema está configurado para Angola:
- Moeda: AOA (Kwanza Angolano)
- Formato: `10.000,00 Kz`
- Código de país: +244
- Idioma: Português (pt-AO)

## Próximos Passos

1. Configure seu backend Django
2. Atualize a URL da API
3. Crie alguns produtos de teste
4. Teste o fluxo completo de compra
5. Configure upload de imagens para produtos
6. Implemente gateway de pagamento real (se necessário)

## Suporte

Para dúvidas sobre a integração, consulte:
- Documentação da API: `/src/imports/pasted_text/ecommerce-api.txt`
- Código de serviço: `/src/app/services/api.ts`
