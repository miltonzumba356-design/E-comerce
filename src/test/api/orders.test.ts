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

  it('create envia {shipping_address, postal_code, payment_method} — itens vêm do carrinho no servidor', async () => {
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

    const order = await ordersAPI.create('Rua Nova, 45', '01001-SP', 'credit_card');
    expect(capturedBody).toEqual({
      shipping_address: 'Rua Nova, 45',
      postal_code: '01001-SP',
      payment_method: 'credit_card',
    });
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

  it('checkDelivery envia {product_id, postal_code, quantity} para /orders/delivery-check/', async () => {
    let capturedBody: any = null;
    server.use(
      http.post('*/api/orders/delivery-check/', async ({ request }) => {
        capturedBody = await request.json();
        return HttpResponse.json({
          available: true,
          product_id: capturedBody.product_id,
          postal_code: capturedBody.postal_code,
          region: 'Luanda',
          estimated_days: 2,
          shipping_cost: 1000,
          quantity: capturedBody.quantity,
        });
      })
    );

    const result = await ordersAPI.checkDelivery({ product_id: 10, postal_code: '01001-SP', quantity: 2 });
    expect(capturedBody).toEqual({ product_id: 10, postal_code: '01001-SP', quantity: 2 });
    expect(result.available).toBe(true);
    expect(result.region).toBe('Luanda');
  });

  it('checkDelivery propaga erro 400 quando faltam campos obrigatórios', async () => {
    server.use(
      http.post('*/api/orders/delivery-check/', () =>
        HttpResponse.json({ error: 'product_id and postal_code are required' }, { status: 400 })
      )
    );

    await expect(ordersAPI.checkDelivery({ product_id: 0, postal_code: '' })).rejects.toThrow();
  });
});
