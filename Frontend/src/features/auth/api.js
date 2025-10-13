import { fetchJson } from '../../services/api';

// HU-01: Registro — MANTENER contrato usado por Register.jsx
export async function registerUser({ name, email, password, confirm }) {
  return await fetchJson('v1/auth/register/', {
    method: 'POST',
    body: {
      nombre_completo: String(name || '').trim(),
      email: String(email || '').trim().toLowerCase(),
      password,
      password2: confirm,
    },
  });
}

// HU-02: Login
export async function loginUser({ email, password }) {
  return await fetchJson('v1/auth/login/', {
    method: 'POST',
    body: {
      email: String(email || '').trim().toLowerCase(),
      password,
    },
  });
}

// HU-02: Log de intentos (silencioso)
export async function logSignInAttempt({ email, success }) {
  try {
    await fetchJson('v1/auth/login/logs/', {
      method: 'POST',
      body: {
        email: String(email || '').trim().toLowerCase(),
        success,
        ts: new Date().toISOString(),
      },
    });
  } catch {}
}

// HU-03: Solicitud de restablecimiento
export async function requestPasswordReset({ email }) {
  return await fetchJson('v1/auth/password/reset/', {
    method: 'POST',
    body: { email: String(email || '').trim().toLowerCase() },
  });
}

// HU-03: Confirmación de restablecimiento
export async function confirmPasswordReset({ token, password }) {
  return await fetchJson('v1/auth/password/reset/confirm/', {
    method: 'POST',
    body: { token: String(token || ''), password },
  });
}

// HU-03: Log de eventos de contraseña (silencioso)
export async function logPasswordEvent({ email = '', action, success }) {
  try {
    await fetchJson('v1/auth/password/logs/', {
      method: 'POST',
      body: {
        email: String(email || '').trim().toLowerCase(),
        action,
        success: Boolean(success),
        ts: new Date().toISOString(),
      },
    });
  } catch {}
}
