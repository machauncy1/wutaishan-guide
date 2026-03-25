const API_BASE = import.meta.env.VITE_API_BASE || '/api';

const TOKEN_KEY = 'avail_token';

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

interface ApiResult<T = unknown> {
  success: boolean;
  errMsg?: string;
  data?: T;
}

export async function request<T = unknown>(
  method: 'GET' | 'POST',
  path: string,
  payload?: Record<string, unknown>,
): Promise<ApiResult<T>> {
  const url =
    method === 'GET' && payload
      ? `${API_BASE}${path}?${new URLSearchParams(payload as Record<string, string>)}`
      : `${API_BASE}${path}`;

  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(url, {
    method,
    headers,
    body: method === 'POST' ? JSON.stringify(payload) : undefined,
  });

  if (res.status === 401) {
    clearToken();
    window.location.href = '/login';
    return { success: false, errMsg: '登录已过期' };
  }

  return res.json();
}
