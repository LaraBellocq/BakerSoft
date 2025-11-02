const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const hasLetter = /[A-Za-z]/;
const hasNumber = /\d/;
const hasSpecial = /[^A-Za-z0-9]/;

export function validateName(name) {
  if (!name || !name.trim()) {
    return 'El nombre es obligatorio';
  }
  if (name.trim().length < 2) {
    return 'El nombre debe tener al menos 2 caracteres';
  }
  return '';
}

export function validateEmail(email) {
  if (!email || !email.trim()) {
    return 'El email es obligatorio';
  }
  if (!emailPattern.test(email.trim())) {
    return 'Formato de email invalido';
  }
  return '';
}

export function validatePassword(password) {
  if (!password) {
    return 'La contrasena es obligatoria';
  }
  if (password.length < 8) {
    return 'La contrasena debe tener al menos 8 caracteres';
  }
  if (!hasLetter.test(password) || !hasNumber.test(password) || !hasSpecial.test(password)) {
    return 'Debe incluir letras, numeros y un caracter especial';
  }
  return '';
}

export function validatePasswordConfirmation(password, confirmPassword) {
  if (!confirmPassword) {
    return 'Confirma tu contrasena';
  }
  if (password !== confirmPassword) {
    return 'Las contrasenas no coinciden';
  }
  return '';
}

export function validateRegister(values) {
  const errors = {};

  const nameError = validateName(values.name);
  if (nameError) errors.name = nameError;

  const emailError = validateEmail(values.email);
  if (emailError) errors.email = emailError;

  const passwordError = validatePassword(values.password);
  if (passwordError) errors.password = passwordError;

  const confirmError = validatePasswordConfirmation(values.password, values.confirmPassword);
  if (confirmError) errors.confirmPassword = confirmError;

  return errors;
}

// Detecta textos típicos de DRF/validators para email duplicado
export function isDuplicateEmailMessage(msg = '') {
  return /unique|único|unico|existe|already|in use|registrad/i.test(String(msg));
}
