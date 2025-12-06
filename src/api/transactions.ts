import { API_BASE } from './client';

export async function sendTransaction(token: string, fromWalletId: string, toWalletId: string, amount: number, currency: string, memo?: string) {
  const res = await fetch(`/transactions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ` },
    body: JSON.stringify({ fromWalletId, toWalletId, amount, currency, memo }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Send failed');
  }
  return res.json();
}

export async function fetchTransactions(token: string, walletId: string) {
  const res = await fetch(`/wallets//transactions`, {
    headers: { Authorization: `Bearer ` },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Fetch transactions failed');
  }
  return res.json();
}
