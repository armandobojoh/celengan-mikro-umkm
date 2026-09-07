const API_BASE = 'http://localhost:5000';

async function apiFetch(path, options = {}) {
  const token = localStorage.getItem('modalrt_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };
  if (token) headers['Authorization'] = 'Bearer ' + token;

  const res = await fetch(API_BASE + path, { ...options, headers });
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.message || 'Terjadi kesalahan');
  }
  return data;
}