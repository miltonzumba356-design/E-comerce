import { describe, it, expect } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '../mocks/server';
import { aiAPI } from '../../app/services/api';

describe('aiAPI', () => {
  it('listSessions exige Authorization: Bearer', async () => {
    await expect(aiAPI.listSessions()).rejects.toThrow();

    localStorage.setItem('access_token', 'valid-access-token');
    const data = await aiAPI.listSessions();
    expect(data.results[0].titulo).toBe('Sessão 1');
  });

  it('createSession envia JSON e retorna a sessão criada', async () => {
    localStorage.setItem('access_token', 'valid-access-token');
    let capturedContentType: string | null = null;
    let capturedBody: any = null;

    server.use(
      http.post('*/ia/sessoes/', async ({ request }) => {
        capturedContentType = request.headers.get('Content-Type');
        capturedBody = await request.json();
        return HttpResponse.json(
          { id: 5, titulo: capturedBody.titulo ?? '', message_count: 0, created_at: '', updated_at: '' },
          { status: 201 }
        );
      })
    );

    const session = await aiAPI.createSession('Dúvida sobre entrega');
    expect(capturedContentType).toBe('application/json');
    expect(capturedBody).toEqual({ titulo: 'Dúvida sobre entrega' });
    expect(session.id).toBe(5);
  });

  it('getMessages retorna a lista de mensagens da sessão (array simples, sem paginação)', async () => {
    localStorage.setItem('access_token', 'valid-access-token');
    const messages = await aiAPI.getMessages(1);
    expect(messages).toHaveLength(2);
    expect(messages[1].role).toBe('assistant');
  });

  it('ask envia como application/x-www-form-urlencoded, nunca JSON (backend real responde 415 pra JSON)', async () => {
    localStorage.setItem('access_token', 'valid-access-token');
    let capturedContentType: string | null = null;
    let capturedBody = '';

    server.use(
      http.post('*/ia/sessoes/:id/perguntar/', async ({ request }) => {
        capturedContentType = request.headers.get('Content-Type');
        capturedBody = await request.text();
        return HttpResponse.json({ reply: 'ok' });
      })
    );

    const response = await aiAPI.ask(1, 'Quais produtos vocês têm de eletrônicos?');
    expect(capturedContentType).toContain('application/x-www-form-urlencoded');
    expect(capturedBody).toBe('pergunta=Quais+produtos+voc%C3%AAs+t%C3%AAm+de+eletr%C3%B4nicos%3F');
    expect(response.reply).toBe('ok');
  });

  it('deleteSession usa DELETE e não retorna corpo (204)', async () => {
    localStorage.setItem('access_token', 'valid-access-token');
    await expect(aiAPI.deleteSession(1)).resolves.toBeUndefined();
  });
});
