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

  it('delete usa o método DELETE e não retorna corpo (204)', async () => {
    localStorage.setItem('access_token', 'valid-access-token');
    await expect(productsAPI.delete('vestido-elegante')).resolves.toBeUndefined();
  });
});
