const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

async function request(path, options = {}) {
  const token = localStorage.getItem('token');
  const headers = { ...(options.body ? { 'Content-Type': 'application/json' } : {}), ...(options.headers || {}) };
  if (token) headers.Authorization = `Bearer ${token}`;
  const response = await fetch(`${API_URL}${path}`, { ...options, headers });
  if (response.status === 204) return null;
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || data.error || 'Something went wrong');
  return data;
}

export const api = {
  login: (body) => request('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  register: (body) => request('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  profile: () => request('/profile'),
  transactions: (params = {}) => {
    const query = new URLSearchParams({ page: 0, size: 1000, ...params });
    Object.keys(params).forEach(k => params[k] == null || params[k] === '' ? query.delete(k) : null);
    return request(`/transactions?${query.toString()}`);
  },
  createTransaction: (body) => request('/transactions', { method: 'POST', body: JSON.stringify(body) }),
  updateTransaction: (id, body) => request(`/transactions/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteTransaction: (id) => request(`/transactions/${id}`, { method: 'DELETE' })
};
