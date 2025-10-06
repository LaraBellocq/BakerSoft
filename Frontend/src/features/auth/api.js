import { fetchJson } from '../../services/api';

export function registerUser(payload) {
  const {
    name = '',
    email = '',
    password = '',
    confirm,
    confirmPassword = '',
  } = payload;

  const nombre_completo = name.trim();
  const emailTrimmed = email.trim();
  const password2 = confirm ?? confirmPassword;

  const body = {
    nombre_completo,
    email: emailTrimmed,
    password,
    password2,
  };

  console.log('Payload a enviar /register:', body);

  return fetchJson('v1/auth/register/', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}
