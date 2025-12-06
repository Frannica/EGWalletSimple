import { API_BASE } from './client';

export type User = { id: string; email: string; region?: string };

export async function register(email: string, password: string, region?: string) {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, region })
  });
  if (!res.ok) throw new Error('Register failed');
  return res.json();
}

export async function login(email: string, password: string) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Login failed');
  }
  return res.json();
}

export async function me(token: string) {
  const res = await fetch(`${API_BASE}/me`, { headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) throw new Error('Fetch profile failed');
  return res.json();
}

export async function listWallets(token: string) {
  const res = await fetch(`${API_BASE}/wallets`, { headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) throw new Error('Fetch wallets failed');
  return res.json();
}
