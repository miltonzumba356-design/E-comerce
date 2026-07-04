import { describe, it, expect, beforeEach } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '../mocks/server';
import { paymentsAPI } from '../../app/services/api';

describe('paymentsAPI', () => {
  beforeEach(() => {
    localStorage.setItem('access_token', 'valid-access-token');
  });

  it('process envia {order, method} — amount/status são calculados no servidor', async () => {
    let capturedBody: any = null;
    server.use(
      http.post('*/api/payments/process/', async ({ request }) => {
        capturedBody = await request.json();
        return HttpResponse.json({
          id: 1,
          order: capturedBody.order,
          user: 1,
          amount: '50000.00',
          method: capturedBody.method,
          status: 'approved',
          transaction_id: 'txn_1',
          created_at: '',
          updated_at: '',
        });
      })
    );

    const payment = await paymentsAPI.process(2, 'bank_transfer');
    expect(capturedBody).toEqual({ order: 2, method: 'bank_transfer' });
    expect(payment.status).toBe('approved');
  });

  it('refund faz POST para /payments/{id}/refund/', async () => {
    const payment = await paymentsAPI.refund(1);
    expect(payment.status).toBe('refunded');
  });

  it('exige Authorization: Bearer', async () => {
    localStorage.clear();
    await expect(paymentsAPI.process(2, 'card')).rejects.toThrow();
  });
});
