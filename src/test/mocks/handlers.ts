import { http, HttpResponse } from 'msw';

// Handlers espelham cada path de "E-Commerce API.yaml": método, URL, shape de
// payload/resposta e a exigência de Authorization: Bearer quando o spec marca
// `security: jwtAuth` (sem o `- {}` de acesso anônimo) para aquele endpoint.

const paginated = <T>(results: T[]) => ({ count: results.length, next: null, previous: null, results });

const requireAuth = (request: Request) => {
  const auth = request.headers.get('Authorization');
  return auth === 'Bearer valid-access-token';
};

const category = { id: 1, name: 'Vestidos', slug: 'vestidos', description: 'Categoria de teste' };

const product = {
  id: 10,
  category: 'vestidos',
  category_detail: category,
  name: 'Vestido Elegante',
  slug: 'vestido-elegante',
  description: 'Um vestido',
  price: '25000.00',
  image: null,
  is_active: true,
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
};

export const handlers = [
  // ---------- AUTH ----------
  http.post('*/api/auth/login/', () =>
    HttpResponse.json({ access: 'valid-access-token', refresh: 'valid-refresh-token' })
  ),

  http.post('*/api/auth/register/', () => HttpResponse.json({ id: 1, username: 'novo_usuario' }, { status: 200 })),

  http.post('*/api/auth/refresh/', async ({ request }) => {
    const body = (await request.json()) as { refresh: string };
    if (body.refresh !== 'valid-refresh-token') {
      return HttpResponse.json({ detail: 'Token inválido' }, { status: 401 });
    }
    return HttpResponse.json({ access: 'refreshed-access-token', refresh: 'valid-refresh-token' });
  }),

  http.get('*/api/auth/me/', ({ request }) => {
    if (!requireAuth(request)) {
      return HttpResponse.json({ detail: 'Authentication credentials were not provided.' }, { status: 401 });
    }
    return HttpResponse.json({
      id: 1,
      username: 'usuario_teste',
      email: 'teste@exemplo.com',
      first_name: 'Teste',
      last_name: 'Usuário',
      role: 'customer',
      phone: '',
      address: '',
      date_joined: '2026-01-01T00:00:00Z',
    });
  }),

  http.patch('*/api/auth/me_update/', ({ request }) => {
    if (!requireAuth(request)) return HttpResponse.json({}, { status: 401 });
    return HttpResponse.json({ id: 1, username: 'usuario_teste', role: 'customer' });
  }),

  http.post('*/api/auth/', ({ request }) => {
    if (!requireAuth(request)) return HttpResponse.json({}, { status: 401 });
    return HttpResponse.json({ id: 5, username: 'criado_pelo_admin' }, { status: 201 });
  }),

  http.get('*/api/auth/admin/users/', ({ request }) => {
    if (!requireAuth(request)) return HttpResponse.json({}, { status: 401 });
    return HttpResponse.json(
      paginated([
        {
          id: 1,
          username: 'usuario_teste',
          email: 'teste@exemplo.com',
          first_name: 'Teste',
          last_name: 'Usuário',
          role: 'customer',
          date_joined: '2026-01-01T00:00:00Z',
        },
      ])
    );
  }),

  http.get('*/api/auth/admin/users/:id/', ({ request }) => {
    if (!requireAuth(request)) return HttpResponse.json({}, { status: 401 });
    return HttpResponse.json({ id: 1, username: 'usuario_teste', role: 'customer' });
  }),

  http.patch('*/api/auth/admin/users/:id/change-role/', async ({ request }) => {
    if (!requireAuth(request)) return HttpResponse.json({}, { status: 401 });
    const body = (await request.json()) as { role: string };
    return HttpResponse.json({ id: 1, username: 'usuario_teste', role: body.role });
  }),

  // ---------- PRODUCTS ----------
  // Nota: rotas literais (categories/, by_category/) precisam ser registradas
  // ANTES de '/api/products/:slug/' — como MSW casa handlers na ordem em que
  // foram declarados, um catch-all de parâmetro de segmento único intercepta
  // qualquer literal de um segmento só ("categories", "by_category") se vier
  // primeiro na lista.
  http.get('*/api/products/', () => HttpResponse.json(paginated([product]))),

  http.get('*/api/products/by_category/', ({ request }) => {
    const url = new URL(request.url);
    const categorySlug = url.searchParams.get('category');
    return HttpResponse.json(categorySlug ? [product] : []);
  }),

  // ---------- CATEGORIES (GET literal, deve vir antes de '/api/products/:slug/') ----------
  http.get('*/api/products/categories/', () => HttpResponse.json(paginated([category]))),

  http.get('*/api/products/categories/:slug/', ({ params }) =>
    HttpResponse.json({ ...category, slug: params.slug as string })
  ),

  http.get('*/api/products/:slug/', ({ params }) =>
    HttpResponse.json({ ...product, slug: params.slug as string })
  ),

  http.post('*/api/products/', ({ request }) => {
    if (!requireAuth(request)) return HttpResponse.json({}, { status: 401 });
    return HttpResponse.json(product, { status: 201 });
  }),

  http.patch('*/api/products/:slug/', ({ request }) => {
    if (!requireAuth(request)) return HttpResponse.json({}, { status: 401 });
    return HttpResponse.json(product);
  }),

  http.put('*/api/products/:slug/', ({ request }) => {
    if (!requireAuth(request)) return HttpResponse.json({}, { status: 401 });
    return HttpResponse.json(product);
  }),

  http.delete('*/api/products/:slug/', ({ request }) => {
    if (!requireAuth(request)) return HttpResponse.json({}, { status: 401 });
    return new HttpResponse(null, { status: 204 });
  }),

  // ---------- CATEGORIES (escrita) ----------
  http.post('*/api/products/categories/', ({ request }) => {
    if (!requireAuth(request)) return HttpResponse.json({}, { status: 401 });
    return HttpResponse.json(category, { status: 201 });
  }),

  http.patch('*/api/products/categories/:slug/', ({ request }) => {
    if (!requireAuth(request)) return HttpResponse.json({}, { status: 401 });
    return HttpResponse.json(category);
  }),

  http.put('*/api/products/categories/:slug/', ({ request }) => {
    if (!requireAuth(request)) return HttpResponse.json({}, { status: 401 });
    return HttpResponse.json(category);
  }),

  http.delete('*/api/products/categories/:slug/', ({ request }) => {
    if (!requireAuth(request)) return HttpResponse.json({}, { status: 401 });
    return new HttpResponse(null, { status: 204 });
  }),

  // ---------- CART ----------
  http.get('*/api/cart/', ({ request }) => {
    if (!requireAuth(request)) return HttpResponse.json({}, { status: 401 });
    return HttpResponse.json(
      paginated([
        {
          id: 1,
          items: [{ id: 100, product: 10, product_detail: product, quantity: 2, subtotal: '50000.00' }],
          total: '50000.00',
          created_at: '2026-01-01T00:00:00Z',
          updated_at: '2026-01-01T00:00:00Z',
        },
      ])
    );
  }),

  http.post('*/api/cart/add/', async ({ request }) => {
    if (!requireAuth(request)) return HttpResponse.json({}, { status: 401 });
    const body = (await request.json()) as Record<string, unknown>;
    return HttpResponse.json({
      id: 1,
      items: [
        {
          id: 100,
          product: body.product,
          product_detail: product,
          quantity: body.quantity,
          subtotal: '50000.00',
        },
      ],
      total: '50000.00',
      created_at: '2026-01-01T00:00:00Z',
      updated_at: '2026-01-01T00:00:00Z',
    });
  }),

  http.patch('*/api/cart/:id/update_quantity/', async ({ request }) => {
    if (!requireAuth(request)) return HttpResponse.json({}, { status: 401 });
    const body = (await request.json()) as Record<string, unknown>;
    return HttpResponse.json({
      id: 1,
      items: [
        { id: 100, product: 10, product_detail: product, quantity: body.quantity, subtotal: '50000.00' },
      ],
      total: '50000.00',
      created_at: '2026-01-01T00:00:00Z',
      updated_at: '2026-01-01T00:00:00Z',
    });
  }),

  http.delete('*/api/cart/:id/remove/', ({ request }) => {
    if (!requireAuth(request)) return HttpResponse.json({}, { status: 401 });
    return new HttpResponse(null, { status: 204 });
  }),

  http.delete('*/api/cart/clear/', ({ request }) => {
    if (!requireAuth(request)) return HttpResponse.json({}, { status: 401 });
    return new HttpResponse(null, { status: 204 });
  }),

  // ---------- ORDERS ----------
  http.get('*/api/orders/', ({ request }) => {
    if (!requireAuth(request)) return HttpResponse.json({}, { status: 401 });
    return HttpResponse.json(
      paginated([
        {
          id: 1,
          user: 1,
          status: 'pending',
          total: '50000.00',
          shipping_address: 'Rua Teste, 123',
          items: [
            { id: 1, product: 10, product_name: 'Vestido Elegante', product_price: '25000.00', quantity: 2, subtotal: '50000.00' },
          ],
          created_at: '2026-01-01T00:00:00Z',
          updated_at: '2026-01-01T00:00:00Z',
        },
      ])
    );
  }),

  http.get('*/api/orders/:id/', ({ request }) => {
    if (!requireAuth(request)) return HttpResponse.json({}, { status: 401 });
    return HttpResponse.json({
      id: 1,
      user: 1,
      status: 'pending',
      total: '50000.00',
      shipping_address: 'Rua Teste, 123',
      items: [],
      created_at: '2026-01-01T00:00:00Z',
      updated_at: '2026-01-01T00:00:00Z',
    });
  }),

  http.post('*/api/orders/', async ({ request }) => {
    if (!requireAuth(request)) return HttpResponse.json({}, { status: 401 });
    const body = (await request.json()) as Record<string, unknown>;
    return HttpResponse.json(
      {
        id: 2,
        user: 1,
        status: 'pending',
        total: '50000.00',
        shipping_address: body.shipping_address,
        items: [],
        created_at: '2026-01-01T00:00:00Z',
        updated_at: '2026-01-01T00:00:00Z',
      },
      { status: 201 }
    );
  }),

  http.post('*/api/orders/:id/cancel/', ({ request, params }) => {
    if (!requireAuth(request)) return HttpResponse.json({}, { status: 401 });
    return HttpResponse.json({
      id: Number(params.id),
      user: 1,
      status: 'cancelled',
      total: '50000.00',
      shipping_address: 'Rua Teste, 123',
      items: [],
      created_at: '2026-01-01T00:00:00Z',
      updated_at: '2026-01-01T00:00:00Z',
    });
  }),

  http.patch('*/api/orders/:id/status/', async ({ request, params }) => {
    if (!requireAuth(request)) return HttpResponse.json({}, { status: 401 });
    const body = (await request.json()) as Record<string, unknown>;
    return HttpResponse.json({
      id: Number(params.id),
      user: 1,
      status: body.status,
      total: '50000.00',
      shipping_address: 'Rua Teste, 123',
      items: [],
      created_at: '2026-01-01T00:00:00Z',
      updated_at: '2026-01-01T00:00:00Z',
    });
  }),

  http.post('*/api/orders/delivery-check/', async ({ request }) => {
    const body = (await request.json()) as { product_id: number; postal_code: string; quantity?: number };
    if (!body.product_id || !body.postal_code) {
      return HttpResponse.json({ error: 'product_id and postal_code are required' }, { status: 400 });
    }
    return HttpResponse.json({
      available: true,
      product_id: body.product_id,
      postal_code: body.postal_code,
      region: 'Luanda',
      estimated_days: 3,
      estimated_date: '2026-07-10',
      shipping_cost: 2500,
      quantity: body.quantity ?? 1,
    });
  }),

  // ---------- PAYMENTS ----------
  http.post('*/api/payments/process/', async ({ request }) => {
    if (!requireAuth(request)) return HttpResponse.json({}, { status: 401 });
    const body = (await request.json()) as Record<string, unknown>;
    return HttpResponse.json({
      id: 1,
      order: body.order,
      user: 1,
      amount: '50000.00',
      method: body.method,
      status: 'approved',
      transaction_id: 'txn_123',
      created_at: '2026-01-01T00:00:00Z',
      updated_at: '2026-01-01T00:00:00Z',
    });
  }),

  http.post('*/api/payments/:id/refund/', ({ request, params }) => {
    if (!requireAuth(request)) return HttpResponse.json({}, { status: 401 });
    return HttpResponse.json({
      id: Number(params.id),
      order: 1,
      user: 1,
      amount: '50000.00',
      method: 'card',
      status: 'refunded',
      transaction_id: 'txn_123',
      created_at: '2026-01-01T00:00:00Z',
      updated_at: '2026-01-01T00:00:00Z',
    });
  }),

  // ---------- INVENTORY ----------
  http.get('*/api/inventory/', ({ request }) => {
    if (!requireAuth(request)) return HttpResponse.json({}, { status: 401 });
    return HttpResponse.json(
      paginated([
        {
          id: 1,
          product: 10,
          product_detail: product,
          quantity: 20,
          reserved: 2,
          available: '18',
          low_stock_threshold: 5,
          is_low_stock: 'False',
          updated_at: '2026-01-01T00:00:00Z',
        },
      ])
    );
  }),

  // 'low_stock/' precisa vir antes de '/api/inventory/:id/' pelo mesmo motivo
  // documentado acima em PRODUCTS — senão ':id' captura o literal "low_stock".
  // O schema documenta a resposta como um único Stock, mas na prática é uma
  // listagem — o mock retorna paginado, e o cliente aceita os dois formatos.
  http.get('*/api/inventory/low_stock/', ({ request }) => {
    if (!requireAuth(request)) return HttpResponse.json({}, { status: 401 });
    return HttpResponse.json(
      paginated([
        {
          id: 2,
          product: 10,
          product_detail: product,
          quantity: 2,
          reserved: 0,
          available: '2',
          low_stock_threshold: 5,
          is_low_stock: 'True',
          updated_at: '2026-01-01T00:00:00Z',
        },
      ])
    );
  }),

  http.get('*/api/inventory/:id/', ({ request, params }) => {
    if (!requireAuth(request)) return HttpResponse.json({}, { status: 401 });
    return HttpResponse.json({
      id: Number(params.id),
      product: 10,
      product_detail: product,
      quantity: 20,
      reserved: 2,
      available: '18',
      low_stock_threshold: 5,
      is_low_stock: 'False',
      updated_at: '2026-01-01T00:00:00Z',
    });
  }),

  http.patch('*/api/inventory/:id/adjust/', async ({ request, params }) => {
    if (!requireAuth(request)) return HttpResponse.json({}, { status: 401 });
    const body = (await request.json()) as Record<string, unknown>;
    return HttpResponse.json({
      id: Number(params.id),
      product: 10,
      product_detail: product,
      quantity: body.quantity,
      reserved: 0,
      available: String(body.quantity),
      low_stock_threshold: 5,
      is_low_stock: 'False',
      updated_at: '2026-01-01T00:00:00Z',
    });
  }),

  // ---------- REPORTS (schemas tipados) ----------
  // '/reports/' (lista de endpoints) não documenta schema — shape genérico.
  http.get('*/api/reports/', ({ request }) => {
    if (!requireAuth(request)) return HttpResponse.json({}, { status: 401 });
    return HttpResponse.json(['dashboard', 'sales', 'best_sellers', 'monthly_revenue', 'orders_by_status']);
  }),

  http.get('*/api/reports/dashboard/', ({ request }) => {
    if (!requireAuth(request)) return HttpResponse.json({}, { status: 401 });
    return HttpResponse.json({
      total_products: 12,
      total_orders: 5,
      total_customers: 3,
      total_revenue: 100000.0,
      pending_orders: 1,
      low_stock_items: 2,
    });
  }),

  http.get('*/api/reports/sales/', ({ request }) => {
    if (!requireAuth(request)) return HttpResponse.json({}, { status: 401 });
    return HttpResponse.json(paginated([{ date: '2026-07-01', revenue: 50000.0, orders: 2 }]));
  }),

  http.get('*/api/reports/best_sellers/', ({ request }) => {
    if (!requireAuth(request)) return HttpResponse.json({}, { status: 401 });
    return HttpResponse.json(
      paginated([{ product_name: 'Vestido Elegante', product__id: 10, total_sold: 10, total_revenue: 250000.0 }])
    );
  }),

  http.get('*/api/reports/monthly_revenue/', ({ request }) => {
    if (!requireAuth(request)) return HttpResponse.json({}, { status: 401 });
    return HttpResponse.json(paginated([{ month: 'jul/26', revenue: 100000.0, orders: 5 }]));
  }),

  http.get('*/api/reports/orders_by_status/', ({ request }) => {
    if (!requireAuth(request)) return HttpResponse.json({}, { status: 401 });
    return HttpResponse.json(paginated([{ status: 'pending', count: 1 }, { status: 'delivered', count: 4 }]));
  }),

  // ---------- IA (assistente de compras — fora do prefixo /api/) ----------
  http.get('*/ia/sessoes/', ({ request }) => {
    if (!requireAuth(request)) return HttpResponse.json({}, { status: 401 });
    return HttpResponse.json(paginated([{ id: 1, titulo: 'Sessão 1', message_count: 2, created_at: '2026-01-01T00:00:00Z', updated_at: '2026-01-01T00:00:00Z' }]));
  }),

  http.post('*/ia/sessoes/', ({ request }) => {
    if (!requireAuth(request)) return HttpResponse.json({}, { status: 401 });
    return HttpResponse.json(
      { id: 1, titulo: 'Nova sessão', message_count: 0, created_at: '2026-01-01T00:00:00Z', updated_at: '2026-01-01T00:00:00Z' },
      { status: 201 }
    );
  }),

  http.get('*/ia/sessoes/:id/mensagens/', ({ request }) => {
    if (!requireAuth(request)) return HttpResponse.json({}, { status: 401 });
    return HttpResponse.json([
      { id: 1, role: 'user', content: 'Oi', tool_name: null, tool_input: null, tool_output: null, image: null, created_at: '2026-01-01T00:00:00Z' },
      { id: 2, role: 'assistant', content: 'Olá! Como posso ajudar?', tool_name: null, tool_input: null, tool_output: null, image: null, created_at: '2026-01-01T00:00:01Z' },
    ]);
  }),

  http.post('*/ia/sessoes/:id/perguntar/', ({ request }) => {
    if (!requireAuth(request)) return HttpResponse.json({}, { status: 401 });
    return HttpResponse.json({ reply: 'Aqui está sua resposta.', tool_calls: [] });
  }),

  http.delete('*/ia/sessoes/:id/', ({ request }) => {
    if (!requireAuth(request)) return HttpResponse.json({}, { status: 401 });
    return new HttpResponse(null, { status: 204 });
  }),
];
