import { describe, it, expect } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '../mocks/server';
import { reportsAPI } from '../../app/services/api';

describe('reportsAPI', () => {
  it('getDashboard exige Authorization: Bearer e retorna o schema Dashboard tipado', async () => {
    await expect(reportsAPI.getDashboard()).rejects.toThrow();

    localStorage.setItem('access_token', 'valid-access-token');
    const data = await reportsAPI.getDashboard();
    expect(data.total_products).toBe(12);
    expect(data.total_revenue).toBe(100000.0);
    expect(data.low_stock_items).toBe(2);
  });

  it('getSales envia o parâmetro days e retorna resultados paginados de SalesReport', async () => {
    localStorage.setItem('access_token', 'valid-access-token');
    let capturedUrl = '';
    server.use(
      http.get('*/api/reports/sales/', ({ request }) => {
        capturedUrl = request.url;
        return HttpResponse.json({
          count: 1,
          next: null,
          previous: null,
          results: [{ date: '2026-07-01', revenue: 1000, orders: 1 }],
        });
      })
    );

    const data = await reportsAPI.getSales(90);
    expect(capturedUrl).toContain('days=90');
    expect(data.results[0].date).toBe('2026-07-01');
  });

  it('getBestSellers envia o parâmetro limit e retorna resultados paginados de BestSeller', async () => {
    localStorage.setItem('access_token', 'valid-access-token');
    let capturedUrl = '';
    server.use(
      http.get('*/api/reports/best_sellers/', ({ request }) => {
        capturedUrl = request.url;
        return HttpResponse.json({
          count: 1,
          next: null,
          previous: null,
          results: [{ product_name: 'Vestido', product__id: 1, total_sold: 5, total_revenue: 500 }],
        });
      })
    );

    const data = await reportsAPI.getBestSellers(5);
    expect(capturedUrl).toContain('limit=5');
    expect(data.results[0].product_name).toBe('Vestido');
  });

  it('getMonthlyRevenue envia o parâmetro months e retorna resultados paginados de MonthlyRevenue', async () => {
    localStorage.setItem('access_token', 'valid-access-token');
    let capturedUrl = '';
    server.use(
      http.get('*/api/reports/monthly_revenue/', ({ request }) => {
        capturedUrl = request.url;
        return HttpResponse.json({
          count: 1,
          next: null,
          previous: null,
          results: [{ month: 'jul/26', revenue: 1000, orders: 1 }],
        });
      })
    );

    const data = await reportsAPI.getMonthlyRevenue(3);
    expect(capturedUrl).toContain('months=3');
    expect(data.results[0].month).toBe('jul/26');
  });

  it('getOrdersByStatus retorna resultados paginados de OrderStatusCount', async () => {
    localStorage.setItem('access_token', 'valid-access-token');
    const data = await reportsAPI.getOrdersByStatus();
    expect(data.results).toEqual(
      expect.arrayContaining([expect.objectContaining({ status: 'pending', count: 1 })])
    );
  });

  it('list() retorna o corpo bruto de /reports/ (schema não documentado)', async () => {
    localStorage.setItem('access_token', 'valid-access-token');
    const data = await reportsAPI.list();
    expect(Array.isArray(data)).toBe(true);
  });

  it('getSales normaliza um array puro (sem envelope paginado) em {results}', async () => {
    localStorage.setItem('access_token', 'valid-access-token');
    server.use(
      http.get('*/api/reports/sales/', () =>
        HttpResponse.json([{ date: '2026-07-01', revenue: 1000, orders: 1 }])
      )
    );

    const data = await reportsAPI.getSales(90);
    expect(data.results).toHaveLength(1);
    expect(data.results[0].date).toBe('2026-07-01');
  });

  it('getBestSellers normaliza um array puro (sem envelope paginado) em {results}', async () => {
    localStorage.setItem('access_token', 'valid-access-token');
    server.use(
      http.get('*/api/reports/best_sellers/', () =>
        HttpResponse.json([{ product_name: 'Vestido', product__id: 1, total_sold: 5, total_revenue: 500 }])
      )
    );

    const data = await reportsAPI.getBestSellers(5);
    expect(data.results).toHaveLength(1);
    expect(data.results[0].product_name).toBe('Vestido');
  });
});
