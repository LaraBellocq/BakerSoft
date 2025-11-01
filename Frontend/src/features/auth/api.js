import { fetchJson } from '../../services/api';

const AUTH_PREFIX = 'v1/auth/';

export async function pingApi() {
  return await fetchJson('ping/');
}

export async function registerUser({ name, email, password, confirm }) {
  return await fetchJson(`${AUTH_PREFIX}register/`, {
    method: 'POST',
    body: {
      nombre_completo: String(name || '').trim(),
      email: String(email || '').trim().toLowerCase(),
      password,
      password2: confirm,
    },
  });
}

export async function loginUser({ email, password }) {
  return await fetchJson(`${AUTH_PREFIX}login/`, {
    method: 'POST',
    body: {
      email: String(email || '').trim().toLowerCase(),
      password,
    },
  });
}

export async function refreshToken({ refresh }) {
  return await fetchJson(`${AUTH_PREFIX}refresh/`, {
    method: 'POST',
    body: { refresh },
  });
}

export async function requestPasswordReset({ email }) {
  return await fetchJson(`${AUTH_PREFIX}password/forgot/`, {
    method: 'POST',
    body: { email: String(email || '').trim().toLowerCase() },
  });
}

export async function validateResetToken({ token }) {
  const path = `${AUTH_PREFIX}password/reset/validate/?token=${encodeURIComponent(
    String(token || ''),
  )}`;
  return await fetchJson(path);
}

export async function confirmPasswordReset({ token, email, password, confirm }) {
  return await fetchJson(`${AUTH_PREFIX}password/reset/`, {
    method: 'POST',
    body: {
      ...(token ? { token: String(token) } : {}),
      ...(email ? { email: String(email).trim().toLowerCase() } : {}),
      password,
      password2: confirm ?? password,
    },
  });
}
