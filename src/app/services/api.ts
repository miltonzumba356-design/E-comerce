// Cliente de API tipado 1:1 com "E-Commerce API.yaml" (OpenAPI 3.0.3)

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

// Origem do backend (sem o sufixo "/api") — usada para resolver caminhos de mídia
// relativos (ex: "/media/products/foo.jpg") que o Django retorna quando o
// serializer não tem contexto de `request` para montar uma URL absoluta.
const API_ORIGIN = API_BASE_URL.replace(/\/api\/?$/, '');

const resolveMediaUrl = (url?: string | null): string | undefined => {
  if (!url) return undefined;
  if (/^(https?:)?\/\//i.test(url) || url.startsWith('data:') || url.startsWith('blob:')) return url;
  return `${API_ORIGIN}${url.startsWith('/') ? '' : '/'}${url}`;
};

// Assistente de IA (app "ia") — não documentado no "E-Commerce API.yaml", mas vive no
// backend real fora do prefixo /api/ (ex: https://.../ia/sessoes/), descoberto direto
// no servidor de produção. Mantém sua própria base de URL por isso.
const AI_BASE_URL = `${API_ORIGIN}/ia`;

// ========== TIPOS (schemas do OpenAPI) ==========

export type RoleEnum = 'admin' | 'customer';
export type OrderStatusEnum = 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
export type PaymentStatusEnum = 'pending' | 'approved' | 'declined' | 'refunded';

export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: RoleEnum;
  phone?: string;
  address?: string;
  date_joined: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
}

// Tipo de pele — filtro "By Skin Type" da loja. Ainda não existe no backend,
// ver BACKEND_PRODUCT_FILTERS.md para o que precisa ser adicionado.
export type SkinTypeEnum = 'normal' | 'oily' | 'dry' | 'combination' | 'sensitive';

export interface Product {
  id: number;
  category: string; // slug da categoria (escrita)
  category_detail: Category; // objeto completo (somente leitura)
  name: string;
  slug: string;
  description?: string;
  price: string;
  brand?: string;
  color?: string;
  material?: string;
  weight?: string;
  dimensions?: string;
  specifications?: Record<string, unknown> | null;
  image?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  // Campos ainda não implementados no backend — ver BACKEND_PRODUCT_FILTERS.md.
  rating?: number;
  review_count?: number;
  skin_type?: SkinTypeEnum;
  original_price?: string | null;
  is_best_seller?: boolean;
  is_new_arrival?: boolean;
  in_stock?: boolean;
}

export interface CartItem {
  id: number;
  product: number;
  product_detail: Product;
  quantity: number;
  subtotal: string;
}

export interface Cart {
  id: number;
  items: CartItem[];
  total: string;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: number;
  product: number | null;
  product_name: string;
  product_price: string;
  quantity: number;
  subtotal: string;
}

export interface Order {
  id: number;
  user: number;
  status: OrderStatusEnum;
  total: string;
  shipping_address: string;
  items: OrderItem[];
  created_at: string;
  updated_at: string;
}

export interface Payment {
  id: number;
  order: number;
  user: number;
  amount: string;
  method: string;
  status: PaymentStatusEnum;
  transaction_id: string;
  created_at: string;
  updated_at: string;
}

export interface Stock {
  id: number;
  product: number;
  product_detail: Product;
  quantity: number;
  reserved: number;
  available: string;
  low_stock_threshold: number;
  is_low_stock: string;
  updated_at: string;
}

export interface Paginated<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// Garante que `Product.image` seja sempre uma URL absoluta consumível diretamente
// em <img src>, mesmo quando o backend devolve um caminho relativo de mídia.
const normalizeProduct = (product: Product): Product => ({
  ...product,
  image: resolveMediaUrl(product.image) ?? null,
});

const normalizeCart = (cart: Cart): Cart => ({
  ...cart,
  items: cart.items.map((item) => ({ ...item, product_detail: normalizeProduct(item.product_detail) })),
});

const normalizeStock = (stock: Stock): Stock => ({
  ...stock,
  product_detail: normalizeProduct(stock.product_detail),
});

// ========== RELATÓRIOS (schemas agora tipados no spec) ==========

export interface DashboardStats {
  total_products: number;
  total_orders: number;
  total_customers: number;
  total_revenue: number;
  pending_orders: number;
  low_stock_items: number;
}

export interface BestSeller {
  product_name: string;
  product__id: number;
  total_sold: number;
  total_revenue: number;
}

export interface MonthlyRevenue {
  month: string;
  revenue: number;
  orders: number;
}

export interface OrderStatusCount {
  status: string;
  count: number;
}

export interface SalesReport {
  date: string;
  revenue: number;
  orders: number;
}

// ========== ASSISTENTE DE IA (app "ia", fora do /api/) ==========

export type AiMessageRole = 'user' | 'assistant' | 'tool';

export interface AiToolCall {
  tool: string;
  input: unknown;
  output: unknown;
}

export interface AiMessage {
  id: number;
  role: AiMessageRole;
  content: string;
  tool_name: string | null;
  tool_input: unknown;
  tool_output: unknown;
  image: string | null;
  created_at: string;
}

export interface AiSession {
  id: number;
  titulo: string;
  message_count: number;
  created_at: string;
  updated_at: string;
  messages?: AiMessage[];
}

export interface AiAskResponse {
  reply: string;
  tool_calls?: AiToolCall[];
}

// Verificação de entrega
export interface DeliveryCheckRequest {
  product_id: number;
  postal_code: string;
  quantity?: number;
}

export interface DeliveryCheckResponse {
  available: boolean;
  product_id: number;
  postal_code: string;
  region?: string;
  estimated_days?: number;
  estimated_date?: string;
  shipping_cost?: number;
  quantity?: number;
  error?: string;
}

// ========== TIPOS DE REQUISIÇÃO ==========

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  password2: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  address?: string;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

// ========== HELPERS DE TOKEN ==========

const getAccessToken = (): string | null => localStorage.getItem('access_token');
const getRefreshToken = (): string | null => localStorage.getItem('refresh_token');

const setTokens = (tokens: AuthTokens): void => {
  localStorage.setItem('access_token', tokens.access);
  localStorage.setItem('refresh_token', tokens.refresh);
};

const clearTokens = (): void => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
};

class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

// ========== CLIENTE HTTP COM REFRESH AUTOMÁTICO ==========

let refreshPromise: Promise<string | null> | null = null;

const refreshAccessToken = async (): Promise<string | null> => {
  const refresh = getRefreshToken();
  if (!refresh) return null;

  if (!refreshPromise) {
    refreshPromise = fetch(`${API_BASE_URL}/auth/refresh/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh }),
    })
      .then(async (res) => {
        if (!res.ok) return null;
        const data: AuthTokens = await res.json();
        setTokens(data);
        return data.access;
      })
      .catch(() => null)
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
};

// Extrai uma mensagem legível de um payload de erro do DRF, que pode vir como:
// - string simples: "Mensagem"
// - { detail: "Mensagem" } (erros de autenticação/permissão/404)
// - { non_field_errors: ["Mensagem"] } (erros de validação sem campo específico)
// - { campo: ["Mensagem"], outroCampo: [...] } (erros de validação por campo)
const extractFieldError = (payload: unknown): string | null => {
  if (typeof payload === 'string' && payload) return payload;
  if (!payload || typeof payload !== 'object') return null;

  const obj = payload as Record<string, unknown>;
  if (typeof obj.detail === 'string' && obj.detail) return obj.detail;

  const firstKey = Object.keys(obj)[0];
  if (!firstKey) return null;
  const value = obj[firstKey];
  const message = Array.isArray(value) ? value[0] : value;
  if (typeof message !== 'string' || !message) return null;

  return firstKey === 'non_field_errors' || firstKey === 'detail' ? message : `${firstKey}: ${message}`;
};

const parseErrorMessage = async (response: Response): Promise<string> => {
  try {
    const data = await response.json();
    if (typeof data === 'string' && data) return data;

    // Envelope customizado do backend: { error: true, message, detail: <payload real> }.
    // O payload de validação/erro de verdade fica em `detail`, não na raiz.
    if (data && typeof data === 'object' && 'detail' in data) {
      const fromDetail = extractFieldError(data.detail);
      if (fromDetail) return fromDetail;
    }

    if (typeof data?.message === 'string' && data.message) return data.message;

    const fromRoot = extractFieldError(data);
    if (fromRoot) return fromRoot;
  } catch {
    // resposta sem corpo JSON
  }
  return `Erro ${response.status}`;
};

interface RequestOptions extends RequestInit {
  auth?: boolean; // inclui Authorization: Bearer (padrão: true)
}

const apiRequest = async <T>(
  endpoint: string,
  options: RequestOptions = {},
  baseUrl: string = API_BASE_URL
): Promise<T> => {
  const { auth = true, headers, ...rest } = options;
  // FormData (upload de arquivo) e URLSearchParams (form-urlencoded) já definem seu
  // próprio Content-Type/boundary — o navegador cuida disso, não podemos sobrescrever.
  const hasSelfDescribingBody = rest.body instanceof FormData || rest.body instanceof URLSearchParams;

  const buildHeaders = (): HeadersInit => {
    const base: Record<string, string> = hasSelfDescribingBody ? {} : { 'Content-Type': 'application/json' };
    if (auth) {
      const token = getAccessToken();
      if (token) base['Authorization'] = `Bearer ${token}`;
    }
    return { ...base, ...(headers as Record<string, string>) };
  };

  let response: Response;
  try {
    response = await fetch(`${baseUrl}${endpoint}`, { ...rest, headers: buildHeaders() });
  } catch {
    // fetch rejeita (sem status HTTP) em falha de rede, DNS ou bloqueio de CORS — o
    // navegador não expõe o motivo exato ao JS, então damos uma mensagem acionável
    // em vez do "Failed to fetch" bruto do browser.
    throw new ApiError(
      0,
      'Não foi possível conectar ao servidor. Verifique sua conexão ou se o backend permite requisições desta origem (CORS).'
    );
  }

  if (response.status === 401 && auth && getRefreshToken()) {
    const newAccess = await refreshAccessToken();
    if (newAccess) {
      try {
        response = await fetch(`${baseUrl}${endpoint}`, {
          ...rest,
          headers: { ...buildHeaders(), Authorization: `Bearer ${newAccess}` },
        });
      } catch {
        throw new ApiError(
          0,
          'Não foi possível conectar ao servidor. Verifique sua conexão ou se o backend permite requisições desta origem (CORS).'
        );
      }
    } else {
      clearTokens();
    }
  }

  if (!response.ok) {
    throw new ApiError(response.status, await parseErrorMessage(response));
  }

  if (response.status === 204) return undefined as T;
  return response.json();
};

// ========== AUTENTICAÇÃO ==========

export const authAPI = {
  login: async (credentials: LoginCredentials): Promise<{ tokens: AuthTokens; user: User }> => {
    // O schema documenta a resposta de login como o schema `Login` (email/password),
    // mas o backend real retorna { user, access, refresh } diretamente — usar o `user`
    // da resposta quando presente, e só então cair para /auth/me/ como fallback.
    const response = await apiRequest<AuthTokens & { user?: User }>('/auth/login/', {
      method: 'POST',
      body: JSON.stringify(credentials),
      auth: false,
    });
    const tokens: AuthTokens = { access: response.access, refresh: response.refresh };
    setTokens(tokens);
    const user = response.user ?? (await authAPI.getCurrentUser());
    return { tokens, user };
  },

  register: async (data: RegisterData): Promise<{ tokens: AuthTokens; user: User }> => {
    // Mesma situação do login: o schema documenta a resposta como `Register`, mas o
    // backend real já retorna { user, access, refresh } — evita um round-trip extra
    // de login quando esses campos vêm presentes.
    const response = await apiRequest<Partial<AuthTokens> & { user?: User }>('/auth/register/', {
      method: 'POST',
      body: JSON.stringify(data),
      auth: false,
    });

    if (response.access && response.refresh) {
      const tokens: AuthTokens = { access: response.access, refresh: response.refresh };
      setTokens(tokens);
      const user = response.user ?? (await authAPI.getCurrentUser());
      return { tokens, user };
    }

    return authAPI.login({ email: data.email, password: data.password });
  },

  logout: (): void => {
    clearTokens();
  },

  getCurrentUser: async (): Promise<User> => {
    return apiRequest('/auth/me/');
  },

  updateProfile: async (data: Partial<User>): Promise<User> => {
    return apiRequest('/auth/me_update/', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },
};

// ========== PRODUTOS ==========

// `imageFile`: um File novo faz upload; `null` sinaliza remoção explícita da
// imagem existente (envia campo vazio); `undefined` não é chamado por aqui —
// nesse caso o payload segue como JSON puro, sem tocar no campo `image`.
const buildProductFormData = (data: Partial<Product>, imageFile: File | null): FormData => {
  const formData = new FormData();
  Object.entries(data).forEach(([key, value]) => {
    if (value === undefined || value === null || key === 'image') return;
    const serialized = typeof value === 'object' ? JSON.stringify(value) : String(value);
    formData.append(key, serialized);
  });
  if (imageFile) {
    formData.append('image', imageFile);
  } else {
    formData.append('image', ''); // remove a imagem existente no backend
  }
  return formData;
};

export const productsAPI = {
  getAll: async (page = 1, pageSize = 50): Promise<Paginated<Product>> => {
    const data = await apiRequest<Paginated<Product>>(`/products/?page=${page}&page_size=${pageSize}`, {
      auth: false,
    });
    return { ...data, results: data.results.map(normalizeProduct) };
  },

  getBySlug: async (slug: string): Promise<Product> => {
    const data = await apiRequest<Product>(`/products/${slug}/`, { auth: false });
    return normalizeProduct(data);
  },

  getByCategory: async (categorySlug: string): Promise<Product[]> => {
    const data = await apiRequest<Product[]>(
      `/products/by_category/?category=${encodeURIComponent(categorySlug)}`,
      { auth: false }
    );
    return data.map(normalizeProduct);
  },

  // `imageFile`: File novo faz upload; `null` remove a imagem existente
  // (só relevante em update/replace); `undefined`/omitido não altera a imagem.
  create: async (data: Partial<Product>, imageFile?: File | null): Promise<Product> => {
    if (imageFile !== undefined) {
      const result = await apiRequest<Product>('/products/', {
        method: 'POST',
        body: buildProductFormData(data, imageFile),
      });
      return normalizeProduct(result);
    }
    const result = await apiRequest<Product>('/products/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return normalizeProduct(result);
  },

  update: async (slug: string, data: Partial<Product>, imageFile?: File | null): Promise<Product> => {
    if (imageFile !== undefined) {
      const result = await apiRequest<Product>(`/products/${slug}/`, {
        method: 'PATCH',
        body: buildProductFormData(data, imageFile),
      });
      return normalizeProduct(result);
    }
    const result = await apiRequest<Product>(`/products/${slug}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
    return normalizeProduct(result);
  },

  // Substituição completa (PUT) — usada quando o formulário já fornece todos os
  // campos editáveis do produto, em vez de um PATCH parcial.
  replace: async (slug: string, data: Partial<Product>, imageFile?: File | null): Promise<Product> => {
    if (imageFile !== undefined) {
      const result = await apiRequest<Product>(`/products/${slug}/`, {
        method: 'PUT',
        body: buildProductFormData(data, imageFile),
      });
      return normalizeProduct(result);
    }
    const result = await apiRequest<Product>(`/products/${slug}/`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return normalizeProduct(result);
  },

  delete: async (slug: string): Promise<void> => {
    return apiRequest(`/products/${slug}/`, { method: 'DELETE' });
  },
};

// ========== CATEGORIAS ==========

export const categoriesAPI = {
  getAll: async (page = 1, pageSize = 50): Promise<Paginated<Category>> => {
    return apiRequest(`/products/categories/?page=${page}&page_size=${pageSize}`, { auth: false });
  },

  getBySlug: async (slug: string): Promise<Category> => {
    return apiRequest(`/products/categories/${slug}/`, { auth: false });
  },

  create: async (data: Partial<Category>): Promise<Category> => {
    return apiRequest('/products/categories/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (slug: string, data: Partial<Category>): Promise<Category> => {
    return apiRequest(`/products/categories/${slug}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  // Substituição completa (PUT) — usada quando o formulário fornece nome, slug e
  // descrição de uma vez (edição completa da categoria).
  replace: async (slug: string, data: Partial<Category>): Promise<Category> => {
    return apiRequest(`/products/categories/${slug}/`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  delete: async (slug: string): Promise<void> => {
    return apiRequest(`/products/categories/${slug}/`, { method: 'DELETE' });
  },
};

// ========== CARRINHO ==========

export const cartAPI = {
  get: async (): Promise<Cart> => {
    // O schema documenta a resposta como PaginatedCartList, mas o backend real
    // retorna o objeto Cart diretamente — aceita ambos os formatos.
    const response = await apiRequest<Paginated<Cart> | Cart>('/cart/');
    const cart =
      'results' in response
        ? response.results[0] || { id: 0, items: [], total: '0', created_at: '', updated_at: '' }
        : response;
    return normalizeCart(cart);
  },

  addItem: async (productId: number, quantity: number): Promise<Cart> => {
    const result = await apiRequest<Cart>('/cart/add/', {
      method: 'POST',
      body: JSON.stringify({ product: productId, quantity }),
    });
    return normalizeCart(result);
  },

  updateQuantity: async (itemId: number, quantity: number): Promise<Cart> => {
    const result = await apiRequest<Cart>(`/cart/${itemId}/update_quantity/`, {
      method: 'PATCH',
      body: JSON.stringify({ quantity }),
    });
    return normalizeCart(result);
  },

  removeItem: async (itemId: number): Promise<void> => {
    return apiRequest(`/cart/${itemId}/remove/`, { method: 'DELETE' });
  },

  clear: async (): Promise<void> => {
    return apiRequest('/cart/clear/', { method: 'DELETE' });
  },
};

// ========== PEDIDOS ==========

export const ordersAPI = {
  getAll: async (page = 1, pageSize = 100): Promise<Paginated<Order>> => {
    return apiRequest(`/orders/?page=${page}&page_size=${pageSize}`);
  },

  getById: async (id: number): Promise<Order> => {
    return apiRequest(`/orders/${id}/`);
  },

  create: async (shippingAddress: string): Promise<Order> => {
    return apiRequest('/orders/', {
      method: 'POST',
      body: JSON.stringify({ shipping_address: shippingAddress }),
    });
  },

  cancel: async (id: number): Promise<Order> => {
    return apiRequest(`/orders/${id}/cancel/`, {
      method: 'POST',
      body: JSON.stringify({}),
    });
  },

  updateStatus: async (id: number, status: OrderStatusEnum): Promise<Order> => {
    return apiRequest(`/orders/${id}/status/`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },

  // Verifica disponibilidade/prazo/custo de entrega para um produto + código postal.
  // Acesso anônimo permitido pelo spec, mas funciona igual autenticado.
  checkDelivery: async (data: DeliveryCheckRequest): Promise<DeliveryCheckResponse> => {
    return apiRequest('/orders/delivery-check/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};

// ========== PAGAMENTOS ==========

export const paymentsAPI = {
  process: async (orderId: number, method: string): Promise<Payment> => {
    return apiRequest('/payments/process/', {
      method: 'POST',
      body: JSON.stringify({ order: orderId, method }),
    });
  },

  refund: async (paymentId: number): Promise<Payment> => {
    return apiRequest(`/payments/${paymentId}/refund/`, {
      method: 'POST',
      body: JSON.stringify({}),
    });
  },
};

// ========== INVENTÁRIO (ADMIN) ==========

export const inventoryAPI = {
  getAll: async (page = 1, pageSize = 50): Promise<Paginated<Stock>> => {
    const data = await apiRequest<Paginated<Stock>>(`/inventory/?page=${page}&page_size=${pageSize}`);
    return { ...data, results: data.results.map(normalizeStock) };
  },

  getById: async (id: number): Promise<Stock> => {
    const data = await apiRequest<Stock>(`/inventory/${id}/`);
    return normalizeStock(data);
  },

  // O schema documenta a resposta como um único Stock, mas o backend provavelmente
  // retorna uma lista (é uma listagem de "produtos com estoque baixo") — aceita os
  // três formatos possíveis de forma defensiva.
  getLowStock: async (): Promise<Stock[]> => {
    const response = await apiRequest<Stock | Stock[] | Paginated<Stock>>('/inventory/low_stock/');
    const stocks = Array.isArray(response) ? response : response && 'results' in response ? response.results : response ? [response] : [];
    return stocks.map(normalizeStock);
  },

  adjust: async (id: number, quantity: number): Promise<Stock> => {
    const data = await apiRequest<Stock>(`/inventory/${id}/adjust/`, {
      method: 'PATCH',
      body: JSON.stringify({ quantity }),
    });
    return normalizeStock(data);
  },
};

// ========== RELATÓRIOS (ADMIN) ==========

export const reportsAPI = {
  // GET /reports/ — lista os endpoints de relatórios disponíveis (shape genérico).
  list: async (): Promise<unknown> => {
    return apiRequest('/reports/');
  },

  getDashboard: async (): Promise<DashboardStats> => {
    return apiRequest('/reports/dashboard/');
  },

  getSales: async (days = 30, page = 1, pageSize = 50): Promise<Paginated<SalesReport>> => {
    return apiRequest(`/reports/sales/?days=${days}&page=${page}&page_size=${pageSize}`);
  },

  getBestSellers: async (limit = 10, page = 1, pageSize = 50): Promise<Paginated<BestSeller>> => {
    return apiRequest(`/reports/best_sellers/?limit=${limit}&page=${page}&page_size=${pageSize}`);
  },

  getMonthlyRevenue: async (months = 6, page = 1, pageSize = 50): Promise<Paginated<MonthlyRevenue>> => {
    return apiRequest(`/reports/monthly_revenue/?months=${months}&page=${page}&page_size=${pageSize}`);
  },

  getOrdersByStatus: async (page = 1, pageSize = 50): Promise<Paginated<OrderStatusCount>> => {
    return apiRequest(`/reports/orders_by_status/?page=${page}&page_size=${pageSize}`);
  },
};

// ========== USUÁRIOS (ADMIN) ==========

export const usersAPI = {
  getAll: async (page = 1): Promise<Paginated<User>> => {
    return apiRequest(`/auth/admin/users/?page=${page}`);
  },

  getById: async (id: number): Promise<User> => {
    return apiRequest(`/auth/admin/users/${id}/`);
  },

  changeRole: async (id: number, role: RoleEnum): Promise<User> => {
    return apiRequest(`/auth/admin/users/${id}/change-role/`, {
      method: 'PATCH',
      body: JSON.stringify({ role }),
    });
  },

  // POST /api/auth/ — rota genérica de criação de usuário exposta pelo router da API.
  create: async (data: Partial<User> & { password?: string }): Promise<User> => {
    return apiRequest('/auth/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};

// ========== ASSISTENTE DE IA (chat de compras) ==========
// Vive em https://<backend>/ia/ — fora do prefixo /api/ — por isso usa AI_BASE_URL
// em vez de API_BASE_URL. Rotas confirmadas direto no backend de produção:
//   GET/POST   /ia/sessoes/
//   GET/PUT/PATCH/DELETE /ia/sessoes/{id}/
//   GET        /ia/sessoes/{id}/mensagens/
//   POST       /ia/sessoes/{id}/perguntar/
export const aiAPI = {
  listSessions: async (page = 1): Promise<Paginated<AiSession>> => {
    return apiRequest(`/sessoes/?page=${page}`, {}, AI_BASE_URL);
  },

  getSession: async (id: number): Promise<AiSession> => {
    return apiRequest(`/sessoes/${id}/`, {}, AI_BASE_URL);
  },

  createSession: async (titulo?: string): Promise<AiSession> => {
    return apiRequest(
      '/sessoes/',
      { method: 'POST', body: JSON.stringify(titulo ? { titulo } : {}) },
      AI_BASE_URL
    );
  },

  getMessages: async (sessionId: number): Promise<AiMessage[]> => {
    return apiRequest(`/sessoes/${sessionId}/mensagens/`, {}, AI_BASE_URL);
  },

  // O endpoint /perguntar/ só aceita form-urlencoded/multipart (confirmado no backend
  // real — envia JSON e ele responde 415 Unsupported Media Type), nunca JSON puro.
  // Body vai como string (não a instância URLSearchParams) com o Content-Type explícito
  // porque alguns interceptors de teste (MSW) falham na checagem `instanceof
  // URLSearchParams` entre realms diferentes — como string funciona igual no navegador.
  ask: async (sessionId: number, pergunta: string): Promise<AiAskResponse> => {
    return apiRequest(
      `/sessoes/${sessionId}/perguntar/`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ pergunta }).toString(),
      },
      AI_BASE_URL
    );
  },

  deleteSession: async (id: number): Promise<void> => {
    return apiRequest(`/sessoes/${id}/`, { method: 'DELETE' }, AI_BASE_URL);
  },
};
