import { describe, it, expect } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '../mocks/server';
import { authAPI } from '../../app/services/api';

const rejects = (promise: Promise<unknown>) =>
  promise.then(
    () => {
      throw new Error('esperava rejeição, mas a promise resolveu');
    },
    (error) => error
  );

describe('authAPI', () => {
  it('login envia {email, password} e busca o usuário em /auth/me/', async () => {
    let capturedBody: any = null;
    server.use(
      http.post('*/api/auth/login/', async ({ request }) => {
        capturedBody = await request.json();
        return HttpResponse.json({ access: 'valid-access-token', refresh: 'valid-refresh-token' });
      })
    );

    const { tokens, user } = await authAPI.login({ email: 'usuario@exemplo.com', password: 'senha123' });

    expect(capturedBody).toEqual({ email: 'usuario@exemplo.com', password: 'senha123' });
    expect(tokens.access).toBe('valid-access-token');
    expect(tokens.refresh).toBe('valid-refresh-token');
    expect(user.username).toBe('usuario_teste');
    expect(user.role).toBe('customer');
    expect(localStorage.getItem('access_token')).toBe('valid-access-token');
  });

  it('login usa o {user} da própria resposta quando presente (comportamento real do backend), sem round-trip extra a /auth/me/', async () => {
    let meCallCount = 0;
    server.use(
      http.post('*/api/auth/login/', () =>
        HttpResponse.json({
          access: 'valid-access-token',
          refresh: 'valid-refresh-token',
          user: { id: 9, username: 'direto_da_resposta', role: 'customer' },
        })
      ),
      http.get('*/api/auth/me/', () => {
        meCallCount += 1;
        return HttpResponse.json({ id: 9, username: 'nao_deveria_vir_daqui', role: 'customer' });
      })
    );

    const { user } = await authAPI.login({ email: 'x@example.com', password: 'y' });
    expect(user.username).toBe('direto_da_resposta');
    expect(meCallCount).toBe(0);
  });

  it('register usa {user, access, refresh} da própria resposta quando presentes, sem fazer login separado', async () => {
    let loginCallCount = 0;
    server.use(
      http.post('*/api/auth/register/', () =>
        HttpResponse.json({
          access: 'valid-access-token',
          refresh: 'valid-refresh-token',
          user: { id: 10, username: 'recem_criado', role: 'customer' },
        })
      ),
      http.post('*/api/auth/login/', () => {
        loginCallCount += 1;
        return HttpResponse.json({ access: 'x', refresh: 'y' });
      })
    );

    const { user } = await authAPI.register({
      username: 'recem_criado',
      email: 'x@example.com',
      password: 'senha123',
      password2: 'senha123',
    });

    expect(user.username).toBe('recem_criado');
    expect(loginCallCount).toBe(0);
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

  it('login com credenciais inválidas expõe a mensagem real, não "[object Object]" (envelope do backend em produção)', async () => {
    server.use(
      http.post('*/api/auth/login/', () =>
        HttpResponse.json(
          { error: true, message: null, detail: { non_field_errors: ['Invalid credentials.'] } },
          { status: 400 }
        )
      )
    );

    const error: any = await rejects(authAPI.login({ email: 'x@example.com', password: 'errada' }));
    expect(error.message).toBe('Invalid credentials.');
  });

  it('register com senhas diferentes expõe a mensagem de validação do campo (envelope do backend em produção)', async () => {
    server.use(
      http.post('*/api/auth/register/', () =>
        HttpResponse.json(
          { error: true, message: null, detail: { password: ['Passwords do not match.'] } },
          { status: 400 }
        )
      )
    );

    const error: any = await rejects(
      authAPI.register({ username: 'x', email: 'x@example.com', password: 'a', password2: 'b' })
    );
    expect(error.message).toBe('password: Passwords do not match.');
  });
});
