import { describe, it, expect, beforeEach } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '../mocks/server';
import { usersAPI } from '../../app/services/api';

describe('usersAPI', () => {
  beforeEach(() => {
    localStorage.setItem('access_token', 'valid-access-token');
  });

  it('getAll lista usuários paginados (admin)', async () => {
    const data = await usersAPI.getAll();
    expect(data.results[0].role).toBe('customer');
  });

  it('changeRole envia {role} para /change-role/', async () => {
    let capturedBody: any = null;
    server.use(
      http.patch('*/api/auth/admin/users/:id/change-role/', async ({ request }) => {
        capturedBody = await request.json();
        return HttpResponse.json({ id: 1, username: 'usuario_teste', role: capturedBody.role });
      })
    );

    const user = await usersAPI.changeRole(1, 'admin');
    expect(capturedBody).toEqual({ role: 'admin' });
    expect(user.role).toBe('admin');
  });

  it('create usa a rota genérica POST /api/auth/', async () => {
    const user = await usersAPI.create({ username: 'novo', password: 'senha123' } as any);
    expect(user.username).toBe('criado_pelo_admin');
  });

  it('exige Authorization: Bearer', async () => {
    localStorage.clear();
    await expect(usersAPI.getAll()).rejects.toThrow();
  });
});
