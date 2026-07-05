import { describe, it, expect } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '../mocks/server';
import { productsAPI } from '../../app/services/api';

describe('productsAPI', () => {
  it('getAll retorna a resposta paginada tal qual o schema PaginatedProductList', async () => {
    const data = await productsAPI.getAll();
    expect(data).toHaveProperty('count');
    expect(data).toHaveProperty('results');
    expect(data.results[0].category_detail.name).toBe('Vestidos');
  });

  it('getBySlug busca /products/{slug}/ sem autenticação', async () => {
    const product = await productsAPI.getBySlug('vestido-elegante');
    expect(product.slug).toBe('vestido-elegante');
  });

  it('getByCategory envia a categoria como query param', async () => {
    let capturedUrl = '';
    server.use(
      http.get('*/api/products/by_category/', ({ request }) => {
        capturedUrl = request.url;
        return HttpResponse.json([]);
      })
    );

    await productsAPI.getByCategory('vestidos');
    expect(capturedUrl).toContain('category=vestidos');
  });

  it('create exige Authorization: Bearer', async () => {
    await expect(productsAPI.create({ name: 'Novo' })).rejects.toThrow();

    localStorage.setItem('access_token', 'valid-access-token');
    const created = await productsAPI.create({ name: 'Novo' });
    expect(created.name).toBeDefined();
  });

  it('create expõe a mensagem real de "sem permissão" (envelope do backend em produção), não "[object Object]"', async () => {
    localStorage.setItem('access_token', 'valid-access-token');
    server.use(
      http.post('*/api/products/', () =>
        HttpResponse.json(
          { error: true, message: null, detail: { detail: 'You do not have permission to perform this action.' } },
          { status: 403 }
        )
      )
    );

    await expect(productsAPI.create({ name: 'Novo' })).rejects.toThrow(
      'You do not have permission to perform this action.'
    );
  });

  it('delete usa o método DELETE e não retorna corpo (204)', async () => {
    localStorage.setItem('access_token', 'valid-access-token');
    await expect(productsAPI.delete('vestido-elegante')).resolves.toBeUndefined();
  });

  it('create com imageFile envia multipart/form-data (upload real, sem Content-Type manual)', async () => {
    localStorage.setItem('access_token', 'valid-access-token');
    let capturedContentType: string | null = null;

    server.use(
      http.post('*/api/products/', ({ request }) => {
        capturedContentType = request.headers.get('Content-Type');
        return HttpResponse.json({}, { status: 201 });
      })
    );

    const file = new File(['conteudo-fake'], 'produto.jpg', { type: 'image/jpeg' });
    await productsAPI.create({ name: 'Com Imagem', price: '1000.00' }, file);

    // O boundary do multipart é definido pelo próprio fetch — nunca fixo em "application/json".
    expect(capturedContentType).toMatch(/^multipart\/form-data/);
  });

  it('create sem imageFile envia JSON normal', async () => {
    localStorage.setItem('access_token', 'valid-access-token');
    let capturedContentType: string | null = null;

    server.use(
      http.post('*/api/products/', ({ request }) => {
        capturedContentType = request.headers.get('Content-Type');
        return HttpResponse.json({}, { status: 201 });
      })
    );

    await productsAPI.create({ name: 'Sem Imagem' });
    expect(capturedContentType).toBe('application/json');
  });

  it('replace usa PUT (substituição completa) e envia os campos novos do produto', async () => {
    localStorage.setItem('access_token', 'valid-access-token');
    let capturedMethod = '';
    let capturedBody: any = null;

    server.use(
      http.put('*/api/products/:slug/', async ({ request }) => {
        capturedMethod = request.method;
        capturedBody = await request.json();
        return HttpResponse.json({ ...capturedBody, id: 1 });
      })
    );

    await productsAPI.replace('vestido-elegante', {
      name: 'Vestido Atualizado',
      price: '30000.00',
      brand: 'GOSEN',
      color: 'Azul',
      specifications: { voltagem: '220V' },
    });

    expect(capturedMethod).toBe('PUT');
    expect(capturedBody.brand).toBe('GOSEN');
    expect(capturedBody.specifications).toEqual({ voltagem: '220V' });
  });

  it('replace com imageFile envia multipart/form-data (upload real na edição completa)', async () => {
    localStorage.setItem('access_token', 'valid-access-token');
    let capturedContentType: string | null = null;
    let capturedMethod = '';

    server.use(
      http.put('*/api/products/:slug/', ({ request }) => {
        capturedContentType = request.headers.get('Content-Type');
        capturedMethod = request.method;
        return HttpResponse.json({}, { status: 200 });
      })
    );

    const file = new File(['x'], 'produto.jpg', { type: 'image/jpeg' });
    await productsAPI.replace('vestido-elegante', { specifications: { cor: 'azul' } }, file);

    expect(capturedMethod).toBe('PUT');
    expect(capturedContentType).toMatch(/^multipart\/form-data/);
  });

  it('replace com imageFile: null sinaliza remoção da imagem existente (campo vazio no multipart)', async () => {
    localStorage.setItem('access_token', 'valid-access-token');
    let capturedImageValue: FormDataEntryValue | null = null;

    server.use(
      http.put('*/api/products/:slug/', async ({ request }) => {
        const form = await request.formData();
        capturedImageValue = form.get('image');
        return HttpResponse.json({}, { status: 200 });
      })
    );

    await productsAPI.replace('vestido-elegante', { specifications: { cor: 'azul' } }, null);

    expect(capturedImageValue).toBe('');
  });

  it('getAll/getBySlug resolvem image relativo ("/media/...") para URL absoluta usando a origem do backend', async () => {
    server.use(
      http.get('*/api/products/', () =>
        HttpResponse.json({
          count: 1,
          next: null,
          previous: null,
          results: [
            {
              id: 10,
              category: 'vestidos',
              category_detail: { id: 1, name: 'Vestidos', slug: 'vestidos' },
              name: 'Vestido Elegante',
              slug: 'vestido-elegante',
              price: '25000.00',
              image: '/media/products/vestido.jpg',
              is_active: true,
              created_at: '2026-01-01T00:00:00Z',
              updated_at: '2026-01-01T00:00:00Z',
            },
          ],
        })
      )
    );

    const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';
    const expectedOrigin = apiBase.replace(/\/api\/?$/, '');

    const data = await productsAPI.getAll();
    expect(data.results[0].image).toBe(`${expectedOrigin}/media/products/vestido.jpg`);
  });

  it('não reescreve image que já é uma URL absoluta', async () => {
    server.use(
      http.get('*/api/products/:slug/', () =>
        HttpResponse.json({
          id: 10,
          category: 'vestidos',
          category_detail: { id: 1, name: 'Vestidos', slug: 'vestidos' },
          name: 'Vestido Elegante',
          slug: 'vestido-elegante',
          price: '25000.00',
          image: 'https://cdn.exemplo.com/vestido.jpg',
          is_active: true,
          created_at: '2026-01-01T00:00:00Z',
          updated_at: '2026-01-01T00:00:00Z',
        })
      )
    );

    const product = await productsAPI.getBySlug('vestido-elegante');
    expect(product.image).toBe('https://cdn.exemplo.com/vestido.jpg');
  });
});
