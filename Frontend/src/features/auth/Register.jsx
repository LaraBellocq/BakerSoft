import { useState } from 'react';
import { registerUser } from './api';
import { validateRegister, isDuplicateEmailMessage } from './validators';

const initialValues = {
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
};

const fallbackMessage = 'No se pudo completar el registro. Intentalo nuevamente.';

const getPasswordStrength = (value) => {
  if (!value) {
    return { label: 'Baja', level: 'empty', percent: 0 };
  }

  let score = 0;
  if (value.length >= 8) score += 1;
  if (/[A-Za-z]/.test(value) && /\d/.test(value)) score += 1;
  if (/[^A-Za-z0-9]/.test(value)) score += 1;

  const levels = ['Baja', 'Baja', 'Media', 'Alta'];
  const kinds = ['weak', 'weak', 'medium', 'strong'];

  return {
    label: levels[score],
    level: kinds[score],
    percent: Math.min((score / 3) * 100, 100),
  };
};

const getFieldError = (clientErrors, serverErrors, field) => {
  return clientErrors[field] || serverErrors[field] || '';
};

export default function Register() {
  const [values, setValues] = useState(initialValues);
  const [clientErrors, setClientErrors] = useState({});
  const [serverErrors, setServerErrors] = useState({});
  const [globalError, setGlobalError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const passwordStrength = getPasswordStrength(values.password);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setValues((prev) => ({ ...prev, [name]: value }));
    if (clientErrors[name]) {
      setClientErrors((prev) => ({ ...prev, [name]: '' }));
    }
    if (serverErrors[name]) {
      setServerErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSuccessMessage('');
    setGlobalError('');

    const validationErrors = validateRegister(values);
    if (Object.keys(validationErrors).length > 0) {
      setClientErrors(validationErrors);
      return;
    }

    setClientErrors({});
    setServerErrors({});
    setIsLoading(true);

    try {
      await registerUser({
        name: values.name.trim(),
        email: values.email.trim(),
        password: values.password,
        confirm: values.confirmPassword, // ✅ importante
      });

      setSuccessMessage('Registro exitoso.');
      setValues(initialValues);
    } catch (error) {
      const responseData = error?.data;
      const nextServerErrors = {};

      // Importá el helper arriba:  import { validateRegister, isDuplicateEmailMessage } from './validators';
      console.log('Register error payload:', { status: error?.status, data: responseData });

      if (responseData) {
        // 1) detail global
        if (typeof responseData.detail === 'string') {
          if (isDuplicateEmailMessage(responseData.detail)) {
            nextServerErrors.email = 'Ya existe una cuenta con ese email';
          } else {
            setGlobalError(responseData.detail);
          }
        }

        // 2) errores por campo (email, password, etc.)
        const applyFieldErrors = (fieldKey, targetKey = fieldKey) => {
          const fieldErrors = responseData[fieldKey];
          if (Array.isArray(fieldErrors) && fieldErrors.length > 0) {
            let message = String(fieldErrors[0]);
            if (targetKey === 'email' && isDuplicateEmailMessage(message)) {
              message = 'Ya existe una cuenta con ese email';
            }
            nextServerErrors[targetKey] = message;
          }
        };

        [
          ['nombre_completo', 'name'],
          ['name', 'name'],
          ['email', 'email'],
          ['password', 'password'],
          ['password2', 'confirmPassword'],
          ['confirm_password', 'confirmPassword'],
        ].forEach(([k, t]) => applyFieldErrors(k, t));

        // 3) non_field_errors (a veces llega ahí)
        const nfe = responseData.non_field_errors;
        if (Array.isArray(nfe) && nfe.length > 0) {
          const msg = String(nfe[0]);
          if (!nextServerErrors.email && isDuplicateEmailMessage(msg)) {
            nextServerErrors.email = 'Ya existe una cuenta con ese email';
          } else if (!responseData.detail) {
            setGlobalError(msg);
          }
        }

        // 4) Fallback para 400/409 cuando el JSON trae pistas de "unique/existe…" pero no por campo
        if (
          (error?.status === 400 || error?.status === 409) &&
          !nextServerErrors.email &&
          (isDuplicateEmailMessage(responseData?.message) ||
            isDuplicateEmailMessage(JSON.stringify(responseData)))
        ) {
          nextServerErrors.email = 'Ya existe una cuenta con ese email';
        }

        // 5) Si no hay nada mapeado y tampoco detail/nfe, mensaje genérico
        if (!responseData.detail &&
            !(Array.isArray(nfe) && nfe.length > 0) &&
            Object.keys(nextServerErrors).length === 0) {
          setGlobalError('No se pudo completar el registro. Intentalo nuevamente.');
        }
      } else {
        setGlobalError('No se pudo completar el registro. Intentalo nuevamente.');
      }

  setServerErrors(nextServerErrors);
    } finally {
      setIsLoading(false);
    }
  };


  const nameError = getFieldError(clientErrors, serverErrors, 'name');
  const emailError = getFieldError(clientErrors, serverErrors, 'email');
  const passwordError = getFieldError(clientErrors, serverErrors, 'password');
  const confirmError = getFieldError(clientErrors, serverErrors, 'confirmPassword');

  return (
    <section className="form" aria-labelledby="register-title">
      <div className="form-header">
        <div className="form-icon" aria-hidden="true">
          <svg
            width="36"
            height="36"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path
              d="M12 12c2.761 0 5-2.239 5-5s-2.239-5-5-5-5 2.239-5 5 2.239 5 5 5Zm0 2c-3.866 0-7 3.134-7 7 0 .552.448 1 1 1h12c.552 0 1-.448 1-1 0-3.866-3.134-7-7-7Z"
              fill="#7A4D14"
            />
          </svg>
        </div>
        <h2 id="register-title">Crear cuenta</h2>
        <p>Completa tus datos para comenzar</p>
      </div>

      {successMessage && (
        <div className="alert success" role="status" aria-live="polite">
          <div className="alert-message">
            <span>{successMessage}</span>
          </div>
          <button
            type="button"
            className="secondary full-width"
            onClick={() => {
              window.location.href = '/login';
            }}
          >
            Ir a iniciar sesion
          </button>
        </div>
      )}

      {globalError && !successMessage && (
        <div className="alert error" role="alert" aria-live="assertive">
          {globalError}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <div className="field">
          <label htmlFor="name">Nombre completo</label>
          <input
            id="name"
            name="name"
            type="text"
            autoComplete="name"
            value={values.name}
            onChange={handleChange}
            aria-required="true"
            aria-invalid={Boolean(nameError)}
            aria-describedby={nameError ? 'name-error' : undefined}
            className={nameError ? 'has-error' : ''}
            disabled={isLoading}
            required
          />
          {nameError && (
            <p id="name-error" className="error" role="alert">
              {nameError}
            </p>
          )}
        </div>

        <div className="field">
          <label htmlFor="email">Correo electronico</label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            value={values.email}
            onChange={handleChange}
            aria-required="true"
            aria-invalid={Boolean(emailError)}
            aria-describedby={emailError ? 'email-error' : undefined}
            className={emailError ? 'has-error' : ''}
            disabled={isLoading}
            required
          />
          {emailError && (
            <p id="email-error" className="error" role="alert">
              {emailError}
            </p>
          )}
        </div>

        <div className="field">
          <label htmlFor="password">Contrasena</label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            value={values.password}
            onChange={handleChange}
            aria-required="true"
            aria-invalid={Boolean(passwordError)}
            aria-describedby={passwordError ? 'password-error password-help' : 'password-help'}
            className={passwordError ? 'has-error' : ''}
            disabled={isLoading}
            required
          />
          <p id="password-help" className="hint">
            Min. 8 caracteres, 1 letra, 1 numero y 1 caracter especial.
          </p>
          <div className="strength" role="status" aria-live="polite">
            <span>Fortaleza: {passwordStrength.label}</span>
            <div className="strength-meter" aria-hidden="true">
              <span
                style={{ width: `${passwordStrength.percent}%` }}
                data-strength={passwordStrength.level}
              />
            </div>
          </div>
          {passwordError && (
            <p id="password-error" className="error" role="alert">
              {passwordError}
            </p>
          )}
        </div>

        <div className="field">
          <label htmlFor="confirmPassword">Confirmar contrasena</label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            value={values.confirmPassword}
            onChange={handleChange}
            aria-required="true"
            aria-invalid={Boolean(confirmError)}
            aria-describedby={confirmError ? 'confirmPassword-error' : undefined}
            className={confirmError ? 'has-error' : ''}
            disabled={isLoading}
            required
          />
          {confirmError && (
            <p id="confirmPassword-error" className="error" role="alert">
              {confirmError}
            </p>
          )}
        </div>

        <div className="actions">
          <button type="submit" className="primary full-width" disabled={isLoading}>
            {isLoading ? 'Registrando...' : 'Registrarme'}
          </button>
        </div>
      </form>
    </section>
  );
}








