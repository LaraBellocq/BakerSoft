export const API_URL =
  import.meta?.env?.VITE_API_BASE?.replace(/\/?$/, '/') ||
  'http://127.0.0.1:8000/api/';

/**
 * fetchJson: helper único para todas las llamadas HTTP del Front.
 * - Agrega base URL (con / final).
 * - Fuerza JSON en request y parsea JSON en response (si hay body).
 * - En error, lanza { status, data } para manejo uniforme en UI.
 */
export async function fetchJson(path, options = {}) {
  const url = `${API_URL}${String(path).replace(/^\/+/, '')}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  let body = options.body;
  // Si pasan un objeto, serializarlo a JSON. Si ya es string, respetarlo.
  if (body && typeof body !== 'string') {
    body = JSON.stringify(body);
  }

  const res = await fetch(url, { ...options, headers, body });
  const text = await res.text();

  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    // respuesta no-JSON: data queda en null para no romper el manejo aguas arriba
  }

  if (!res.ok) {
    const err = new Error(`HTTP ${res.status}`);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}
