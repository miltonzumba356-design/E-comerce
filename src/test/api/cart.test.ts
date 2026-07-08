import { describe, it, expect, beforeEach } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '../mocks/server';
import { cartAPI } from '../../app/services/api';

describe('cartAPI', () => {
  beforeEach(() => {
    localStorage.setItem('access_token', 'valid-access-token');
  });

  it('get() desembrulha o primeiro item da lista paginada de carrinhos', async () => {
    const cart = await cartAPI.get();
    expect(cart.items[0].product_detail.name).toBe('Vestido Elegante');
    expect(cart.total).toBe('50000.00');
  });

  it('get() também aceita o Cart retornado diretamente (comportamento real do backend, divergente do schema documentado)', async () => {
    server.use(
      http.get('*/api/cart/', () =>
        HttpResponse.json({ id: 5, items: [], total: '0', created_at: '', updated_at: '' })
      )
    );

    const cart = await cartAPI.get();
    expect(cart.id).toBe(5);
  });

  it('addItem envia {product_id, quantity} — não o objeto Cart inteiro', async () => {
    let capturedBody: any = null;
    server.use(
      http.post('*/api/cart/add/', async ({ request }) => {
        capturedBody = await request.json();
        return HttpResponse.json({ id: 1, items: [], total: '0', created_at: '', updated_at: '' });
      })
    );

    await cartAPI.addItem(10, 3);
    expect(capturedBody).toEqual({ product_id: 10, quantity: 3 });
  });

  it('updateQuantity envia somente {quantity}', async () => {
    let capturedBody: any = null;
    server.use(
      http.patch('*/api/cart/:id/update_quantity/', async ({ request }) => {
        capturedBody = await request.json();
        return HttpResponse.json({ id: 1, items: [], total: '0', created_at: '', updated_at: '' });
      })
    );

    await cartAPI.updateQuantity(100, 5);
    expect(capturedBody).toEqual({ quantity: 5 });
  });

  it('removeItem e clear retornam void em 204', async () => {
    await expect(cartAPI.removeItem(100)).resolves.toBeUndefined();
    await expect(cartAPI.clear()).resolves.toBeUndefined();
  });

  it('todas as operações exigem Authorization: Bearer', async () => {
    localStorage.clear();
    await expect(cartAPI.get()).rejects.toThrow();
  });
});
