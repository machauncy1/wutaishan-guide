import { request, setToken, clearToken, getToken } from '../api/client';

interface LoginData {
  token: string;
  role: UserRole;
  name: string;
}

interface MeData {
  id: string;
  name: string;
  phone: string;
  role: UserRole;
  guideId: string | null;
}

export async function login(phone: string) {
  const res = await request<LoginData>('POST', '/login', { phone });
  if (res.success && res.data) {
    setToken(res.data.token);
    localStorage.setItem('avail_role', res.data.role);
    localStorage.setItem('avail_name', res.data.name);
  }
  return res;
}

export async function getMe() {
  return request<MeData>('GET', '/me');
}

export function logout() {
  clearToken();
  localStorage.removeItem('avail_role');
  localStorage.removeItem('avail_name');
  window.location.href = '/login';
}

export function isLoggedIn(): boolean {
  return !!getToken();
}

export function getSavedRole(): UserRole | null {
  return localStorage.getItem('avail_role') as UserRole | null;
}
