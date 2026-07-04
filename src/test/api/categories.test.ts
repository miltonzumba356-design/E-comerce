import { describe, it, expect } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '../mocks/server';
import { categoriesAPI } from '../../app/services/api';

describe('categoriesAPI', () => {
  it('getAll retorna categorias paginadas sem autenticação', async () => {
    const data = await categoriesAPI.getAll();
    expect(data.results[0].slug).toBe('vestidos');
  });

  it('create exige Authorization: Bearer', async () => {
    await expect(categoriesAPI.create({ name: 'Nova', slug: 'nova' })).rejects.toThrow();

    localStorage.setItem('access_token', 'valid-access-token');
    const created = await categoriesAPI.create({ name: 'Nova', slug: 'nova' });
    expect(created.slug).toBeDefined();
  });

  it('delete retorna void em 204', async () => {
    localStorage.setItem('access_token', 'valid-access-token');
    await expect(categoriesAPI.delete('vestidos')).resolves.toBeUndefined();
  });

  it('replace usa PUT (substituição completa) com nome, slug e descrição', async () => {
    localStorage.setItem('access_token', 'valid-access-token');
    let capturedMethod = '';
    let capturedBody: any = null;

    server.use(
      http.put('*/api/products/categories/:slug/', async ({ request }) => {
        capturedMethod = request.method;
        capturedBody = await request.json();
        return HttpResponse.json({ id: 1, ...capturedBody });
      })
    );

    await categoriesAPI.replace('vestidos', { name: 'Vestidos', slug: 'vestidos', description: 'Nova descrição' });
    expect(capturedMethod).toBe('PUT');
    expect(capturedBody).toEqual({ name: 'Vestidos', slug: 'vestidos', description: 'Nova descrição' });
  });
});
