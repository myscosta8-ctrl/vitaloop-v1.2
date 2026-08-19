// Cliente HTTP Typed para Comunicação com a API Fastify do Vitaloop UPA

const API_BASE = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3333';

let authToken: string | null = localStorage.getItem('vitaloop_token');

export function setAuthToken(token: string | null) {
  authToken = token;
  if (token) localStorage.setItem('vitaloop_token', token);
  else localStorage.removeItem('vitaloop_token');
}

export function getAuthToken(): string | null {
  return authToken;
}

export async function apiFetch<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> ?? {}),
  };

  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const contentType = res.headers.get('content-type');
  if (contentType?.includes('text/html')) {
    return (await res.text()) as unknown as T;
  }

  const data = await res.json();
  if (!res.ok) {
    const errObj = data as any;
    throw new Error(errObj?.message || errObj?.error || 'Erro na requisição');
  }

  return data as T;
}
