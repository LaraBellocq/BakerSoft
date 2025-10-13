import { fetchJson } from '../../services/api';

// HU-01: Registro (se mantiene contrato)
export async function registerUser({ fullName, email, password, confirmPassword }) {
  return await fetchJson('v1/auth/register/', {
    method: 'POST',
    body: {
      nombre_completo: String(fullName || '').trim(),
      email: String(email || '').trim().toLowerCase(),
      password,
      password2: confirmPassword,
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
        success: Boolean(success),
        ts: new Date().toISOString(),
      },
    });
  } catch {
    // No romper la UI si el endpoint no existe o falla
  }
}
