import { describe, it, expect } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '../mocks/server';
import { authAPI } from '../../app/services/api';

describe('authAPI', () => {
  it('login envia {username, password} e busca o usuário em /auth/me/', async () => {
    const { tokens, user } = await authAPI.login({ username: 'usuario_teste', password: 'senha123' });

    expect(tokens.access).toBe('valid-access-token');
    expect(tokens.refresh).toBe('valid-refresh-token');
    expect(user.username).toBe('usuario_teste');
    expect(user.role).toBe('customer');
    expect(localStorage.getItem('access_token')).toBe('valid-access-token');
  });

  it('register cria a conta e depois faz login automaticamente', async () => {
    let registerBody: any = null;
    server.use(
      http.post('*/api/auth/register/', async ({ request }) => {
        registerBody = await request.json();
        return HttpResponse.json({ id: 1, username: registerBody.username });
      })
    );

    const { user } = await authAPI.register({
      username: 'novo_usuario',
      email: 'novo@exemplo.com',
      password: 'senha123',
      password2: 'senha123',
      first_name: 'Novo',
      last_name: 'Usuário',
    });

    expect(registerBody.username).toBe('novo_usuario');
    expect(registerBody.password2).toBe('senha123');
    expect(user.username).toBe('usuario_teste'); // vem do mock de /auth/me/ após login
    expect(localStorage.getItem('access_token')).toBe('valid-access-token');
  });

  it('getCurrentUser falha sem token de acesso', async () => {
    await expect(authAPI.getCurrentUser()).rejects.toThrow();
  });

  it('renova o access token automaticamente em um 401 e repete a requisição', async () => {
    localStorage.setItem('access_token', 'expired-token');
    localStorage.setItem('refresh_token', 'valid-refresh-token');

    let callCount = 0;
    server.use(
      http.get('*/api/auth/me/', ({ request }) => {
        callCount += 1;
        const auth = request.headers.get('Authorization');
        if (auth === 'Bearer expired-token') {
          return HttpResponse.json({ detail: 'Token expirado' }, { status: 401 });
        }
        if (auth === 'Bearer refreshed-access-token') {
          return HttpResponse.json({
            id: 1,
            username: 'usuario_teste',
            email: 'teste@exemplo.com',
            first_name: 'Teste',
            last_name: 'Usuário',
            role: 'customer',
            date_joined: '2026-01-01T00:00:00Z',
          });
        }
        return HttpResponse.json({ detail: 'Não autorizado' }, { status: 401 });
      })
    );

    const user = await authAPI.getCurrentUser();

    expect(user.username).toBe('usuario_teste');
    expect(callCount).toBe(2); // 1ª tentativa (401) + repetição após refresh
    expect(localStorage.getItem('access_token')).toBe('refreshed-access-token');
  });
});
