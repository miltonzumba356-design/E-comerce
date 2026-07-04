import { describe, it, expect } from 'vitest';
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
});
