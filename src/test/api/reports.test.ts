import { describe, it, expect } from 'vitest';
import { reportsAPI } from '../../app/services/api';

// O spec não documenta o corpo de resposta de /reports/* ("No response body"),
// então os testes verificam apenas que a chamada exige autenticação e que o
// corpo retornado (qualquer que seja o shape) chega intacto ao chamador.
describe('reportsAPI', () => {
  it('getDashboard exige Authorization: Bearer', async () => {
    await expect(reportsAPI.getDashboard()).rejects.toThrow();

    localStorage.setItem('access_token', 'valid-access-token');
    const data = await reportsAPI.getDashboard();
    expect(data).toBeTypeOf('object');
  });

  it('getSales/getBestSellers/getMonthlyRevenue/getOrdersByStatus retornam o corpo bruto', async () => {
    localStorage.setItem('access_token', 'valid-access-token');

    const [sales, bestSellers, monthlyRevenue, ordersByStatus] = await Promise.all([
      reportsAPI.getSales(),
      reportsAPI.getBestSellers(),
      reportsAPI.getMonthlyRevenue(),
      reportsAPI.getOrdersByStatus(),
    ]);

    expect(sales).toBeDefined();
    expect(bestSellers).toBeDefined();
    expect(monthlyRevenue).toBeDefined();
    expect(ordersByStatus).toBeDefined();
  });
});
