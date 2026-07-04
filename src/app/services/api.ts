// Cliente de API tipado 1:1 com "E-Commerce API.yaml" (OpenAPI 3.0.3)

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

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

export interface Product {
  id: number;
  category: string; // slug da categoria (escrita)
  category_detail: Category; // objeto completo (somente leitura)
  name: string;
  slug: string;
  description?: string;
  price: string;
  image?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
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

// Relatórios: o spec não documenta o corpo da resposta ("No response body").
// Tipar como registro solto e consumir a UI de forma defensiva.
export type ReportData = Record<string, unknown>;

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

const parseErrorMessage = async (response: Response): Promise<string> => {
  try {
    const data = await response.json();
    if (typeof data === 'string') return data;
    if (data?.detail) return data.detail;
    const firstKey = Object.keys(data || {})[0];
    if (firstKey) {
      const value = data[firstKey];
      return Array.isArray(value) ? `${firstKey}: ${value[0]}` : String(value);
    }
  } catch {
    // resposta sem corpo JSON
  }
  return `Erro ${response.status}`;
};

interface RequestOptions extends RequestInit {
  auth?: boolean; // inclui Authorization: Bearer (padrão: true)
}

const apiRequest = async <T>(endpoint: string, options: RequestOptions = {}): Promise<T> => {
  const { auth = true, headers, ...rest } = options;
  const isFormData = rest.body instanceof FormData;

  const buildHeaders = (): HeadersInit => {
    // Ao enviar FormData (upload de arquivo), não define Content-Type manualmente —
    // o navegador precisa gerar o boundary do multipart/form-data sozinho.
    const base: Record<string, string> = isFormData ? {} : { 'Content-Type': 'application/json' };
    if (auth) {
      const token = getAccessToken();
      if (token) base['Authorization'] = `Bearer ${token}`;
    }
    return { ...base, ...(headers as Record<string, string>) };
  };

  let response = await fetch(`${API_BASE_URL}${endpoint}`, { ...rest, headers: buildHeaders() });

  if (response.status === 401 && auth && getRefreshToken()) {
    const newAccess = await refreshAccessToken();
    if (newAccess) {
      response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...rest,
        headers: { ...buildHeaders(), Authorization: `Bearer ${newAccess}` },
      });
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

const buildProductFormData = (data: Partial<Product>, imageFile: File): FormData => {
  const formData = new FormData();
  Object.entries(data).forEach(([key, value]) => {
    if (value === undefined || value === null || key === 'image') return;
    formData.append(key, String(value));
  });
  formData.append('image', imageFile);
  return formData;
};

export const productsAPI = {
  getAll: async (page = 1, pageSize = 50): Promise<Paginated<Product>> => {
    return apiRequest(`/products/?page=${page}&page_size=${pageSize}`, { auth: false });
  },

  getBySlug: async (slug: string): Promise<Product> => {
    return apiRequest(`/products/${slug}/`, { auth: false });
  },

  getByCategory: async (categorySlug: string): Promise<Product[]> => {
    return apiRequest(`/products/by_category/?category=${encodeURIComponent(categorySlug)}`, { auth: false });
  },

  create: async (data: Partial<Product>, imageFile?: File | null): Promise<Product> => {
    if (imageFile) {
      return apiRequest('/products/', { method: 'POST', body: buildProductFormData(data, imageFile) });
    }
    return apiRequest('/products/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (slug: string, data: Partial<Product>, imageFile?: File | null): Promise<Product> => {
    if (imageFile) {
      return apiRequest(`/products/${slug}/`, { method: 'PATCH', body: buildProductFormData(data, imageFile) });
    }
    return apiRequest(`/products/${slug}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
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
    if ('results' in response) {
      return response.results[0] || { id: 0, items: [], total: '0', created_at: '', updated_at: '' };
    }
    return response;
  },

  addItem: async (productId: number, quantity: number): Promise<Cart> => {
    return apiRequest('/cart/add/', {
      method: 'POST',
      body: JSON.stringify({ product: productId, quantity }),
    });
  },

  updateQuantity: async (itemId: number, quantity: number): Promise<Cart> => {
    return apiRequest(`/cart/${itemId}/update_quantity/`, {
      method: 'PATCH',
      body: JSON.stringify({ quantity }),
    });
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
    return apiRequest(`/inventory/?page=${page}&page_size=${pageSize}`);
  },

  getById: async (id: number): Promise<Stock> => {
    return apiRequest(`/inventory/${id}/`);
  },

  getLowStock: async (): Promise<Stock> => {
    return apiRequest('/inventory/low_stock/');
  },

  adjust: async (id: number, quantity: number): Promise<Stock> => {
    return apiRequest(`/inventory/${id}/adjust/`, {
      method: 'PATCH',
      body: JSON.stringify({ quantity }),
    });
  },
};

// ========== RELATÓRIOS (ADMIN) ==========

export const reportsAPI = {
  getDashboard: async (): Promise<ReportData> => {
    return apiRequest('/reports/dashboard/');
  },

  getSales: async (): Promise<ReportData> => {
    return apiRequest('/reports/sales/');
  },

  getBestSellers: async (): Promise<ReportData> => {
    return apiRequest('/reports/best_sellers/');
  },

  getMonthlyRevenue: async (): Promise<ReportData> => {
    return apiRequest('/reports/monthly_revenue/');
  },

  getOrdersByStatus: async (): Promise<ReportData> => {
    return apiRequest('/reports/orders_by_status/');
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
