import { describe, it, expect, beforeEach } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '../mocks/server';
import { inventoryAPI } from '../../app/services/api';

describe('inventoryAPI', () => {
  beforeEach(() => {
    localStorage.setItem('access_token', 'valid-access-token');
  });

  it('getAll retorna estoques paginados', async () => {
    const data = await inventoryAPI.getAll();
    expect(data.results[0].product_detail.name).toBe('Vestido Elegante');
  });

  it('getLowStock retorna um único Stock, conforme o schema (não um array)', async () => {
    const stock = await inventoryAPI.getLowStock();
    expect(stock.is_low_stock).toBe('True');
  });

  it('adjust envia somente {quantity}', async () => {
    let capturedBody: any = null;
    server.use(
      http.patch('*/api/inventory/:id/adjust/', async ({ request, params }) => {
        capturedBody = await request.json();
        return HttpResponse.json({
          id: Number(params.id),
          product: 10,
          product_detail: {},
          quantity: capturedBody.quantity,
          reserved: 0,
          available: String(capturedBody.quantity),
          low_stock_threshold: 5,
          is_low_stock: 'False',
          updated_at: '',
        });
      })
    );

    const stock = await inventoryAPI.adjust(1, 15);
    expect(capturedBody).toEqual({ quantity: 15 });
    expect(stock.quantity).toBe(15);
  });

  it('exige Authorization: Bearer', async () => {
    localStorage.clear();
    await expect(inventoryAPI.getAll()).rejects.toThrow();
  });
});
