import { describe, it, expect, beforeEach } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '../mocks/server';
import { ordersAPI } from '../../app/services/api';

describe('ordersAPI', () => {
  beforeEach(() => {
    localStorage.setItem('access_token', 'valid-access-token');
  });

  it('getAll retorna pedidos paginados com status em minúsculo', async () => {
    const data = await ordersAPI.getAll();
    expect(data.results[0].status).toBe('pending');
    expect(data.results[0].items[0].product_name).toBe('Vestido Elegante');
  });

  it('create envia somente {shipping_address} — itens vêm do carrinho no servidor', async () => {
    let capturedBody: any = null;
    server.use(
      http.post('*/api/orders/', async ({ request }) => {
        capturedBody = await request.json();
        return HttpResponse.json(
          { id: 2, user: 1, status: 'pending', total: '0', shipping_address: capturedBody.shipping_address, items: [], created_at: '', updated_at: '' },
          { status: 201 }
        );
      })
    );

    const order = await ordersAPI.create('Rua Nova, 45');
    expect(capturedBody).toEqual({ shipping_address: 'Rua Nova, 45' });
    expect(order.shipping_address).toBe('Rua Nova, 45');
  });

  it('updateStatus envia {status} com um valor do OrderStatusEnum', async () => {
    let capturedBody: any = null;
    server.use(
      http.patch('*/api/orders/:id/status/', async ({ request, params }) => {
        capturedBody = await request.json();
        return HttpResponse.json({
          id: Number(params.id),
          user: 1,
          status: capturedBody.status,
          total: '0',
          shipping_address: '',
          items: [],
          created_at: '',
          updated_at: '',
        });
      })
    );

    const order = await ordersAPI.updateStatus(1, 'shipped');
    expect(capturedBody).toEqual({ status: 'shipped' });
    expect(order.status).toBe('shipped');
  });

  it('cancel faz POST para /orders/{id}/cancel/', async () => {
    const order = await ordersAPI.cancel(1);
    expect(order.status).toBe('cancelled');
  });
});
