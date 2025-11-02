export const API_URL =
  import.meta?.env?.VITE_API_BASE?.replace(/\/?$/, '/') || 'http://127.0.0.1:8000/api/';

const ACCESS_KEY = 'auth.access';
const REFRESH_KEY = 'auth.refresh';

function getStorages() {
  if (typeof window === 'undefined') {
    return [];
  }
  return [window.sessionStorage, window.localStorage];
}

function safeGetItem(storage, key) {
  if (!storage) {
    return null;
  }
  try {
    return storage.getItem(key);
  } catch {
    return null;
  }
}

export function getStoredAccessToken() {
  for (const storage of getStorages()) {
    const value = safeGetItem(storage, ACCESS_KEY);
    if (value) {
      return value;
    }
  }
  return null;
}

export function getStoredRefreshToken() {
  for (const storage of getStorages()) {
    const value = safeGetItem(storage, REFRESH_KEY);
    if (value) {
      return value;
    }
  }
  return null;
}

function isFormData(body) {
  return typeof FormData !== 'undefined' && body instanceof FormData;
}

function isBlob(body) {
  return typeof Blob !== 'undefined' && body instanceof Blob;
}

function isUrlSearchParams(body) {
  return typeof URLSearchParams !== 'undefined' && body instanceof URLSearchParams;
}

function ensureAcceptHeader(headers) {
  if (!headers.Accept && !headers.accept) {
    headers.Accept = 'application/json';
  }
}

/**
 * fetchJson: helper unico para todas las llamadas HTTP del Front.
 * - Agrega base URL (con / final).
 * - Maneja JSON automaticamente (headers y parsing).
 * - Si options.auth es true, suma el Authorization Bearer con el access token almacenado.
 * - En error, lanza { status, data } para manejo uniforme en UI.
 */
export async function fetchJson(path, options = {}) {
  const { auth = false, headers: customHeaders = {}, body: rawBody, ...rest } = options;
  const url = `${API_URL}${String(path).replace(/^\/+/, '')}`;

  const headers = { ...customHeaders };
  ensureAcceptHeader(headers);

  let body = rawBody;
  const bodyIsFormData = isFormData(body);
  const bodyIsBlob = isBlob(body);
  const shouldStringify =
    body && typeof body === 'object' && !bodyIsFormData && !bodyIsBlob && !isUrlSearchParams(body);

  if (shouldStringify) {
    body = JSON.stringify(body);
  }

  if (!bodyIsFormData && !bodyIsBlob && !headers['Content-Type'] && !headers['content-type']) {
    headers['Content-Type'] = 'application/json';
  }

  if (auth) {
    const token = getStoredAccessToken();
    if (token && !headers.Authorization && !headers.authorization) {
      headers.Authorization = `Bearer ${token}`;
    }
  }

  const response = await fetch(url, {
    ...rest,
    headers,
    body,
  });

  const hasBody = response.status !== 204 && response.status !== 205;
  const text = hasBody ? await response.text() : '';

  let data = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }

  if (!response.ok) {
    const error = new Error(`HTTP ${response.status}`);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}
