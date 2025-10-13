import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { loginUser, logSignInAttempt } from './api';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const AUTH_KEYS = ['auth.access', 'auth.refresh', 'auth.user', 'auth.remember'];

function selectStorage(remember) {
  if (typeof window === 'undefined') {
    return {
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {},
    };
  }
  return remember ? window.localStorage : window.sessionStorage;
}

function oppositeStorage(remember) {
  if (typeof window === 'undefined') {
    return {
      removeItem: () => {},
    };
  }
  return remember ? window.sessionStorage : window.localStorage;
}

function getInitialRemember() {
  if (typeof window === 'undefined') {
    return false;
  }
  const stored =
    window.localStorage.getItem('auth.remember') ??
    window.sessionStorage.getItem('auth.remember');
  return stored === 'true';
}

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(getInitialRemember);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [clientErrors, setClientErrors] = useState({});
  const [serverErrors, setServerErrors] = useState({});
  const [globalError, setGlobalError] = useState('');
  const [globalSuccess, setGlobalSuccess] = useState('');

  const emailError = clientErrors.email || serverErrors.email;
  const passwordError = clientErrors.password || serverErrors.password;

  const passwordType = showPassword ? 'text' : 'password';

  const passwordToggleLabel = showPassword
    ? 'Ocultar contraseña'
    : 'Mostrar contraseña';

  const handleSubmit = async (event) => {
    event.preventDefault();
    setClientErrors({});
    setServerErrors({});
    setGlobalError('');
    setGlobalSuccess('');

    const nextClientErrors = {};
    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      nextClientErrors.email = 'El email es obligatorio';
    } else if (!emailRegex.test(trimmedEmail)) {
      nextClientErrors.email = 'Email inválido';
    }

    if (!password) {
      nextClientErrors.password = 'La contraseña es obligatoria';
    }

    if (Object.keys(nextClientErrors).length > 0) {
      setClientErrors(nextClientErrors);
      return;
    }

    setLoading(true);

    try {
      const data = await loginUser({ email: trimmedEmail, password });
      const activeStorage = selectStorage(remember);
      const secondaryStorage = oppositeStorage(remember);

      AUTH_KEYS.forEach((key) => secondaryStorage.removeItem(key));

      if (data?.access) {
        activeStorage.setItem('auth.access', data.access);
      }
      if (data?.refresh) {
        activeStorage.setItem('auth.refresh', data.refresh);
      }
      if (data?.user) {
        try {
          activeStorage.setItem('auth.user', JSON.stringify(data.user));
        } catch {
          // No hacemos nada si falla la serialización.
        }
      }
      activeStorage.setItem('auth.remember', String(remember));

      setGlobalSuccess('Sesión iniciada.');
      setGlobalError('');
      await logSignInAttempt({ email: trimmedEmail, success: true });

      navigate('/dashboard');
      // TODO: Si /dashboard aún no está disponible, usar la redirección temporal.
      // navigate('/');
    } catch (error) {
      const nextServerErrors = {};
      const responseData = error?.data;

      const detail =
        typeof responseData?.detail === 'string' ? responseData.detail : '';

      let nonFieldMessage = '';
      if (Array.isArray(responseData?.non_field_errors)) {
        nonFieldMessage = responseData.non_field_errors.join(' ');
      } else if (typeof responseData?.non_field_errors === 'string') {
        nonFieldMessage = responseData.non_field_errors;
      }

      const combined = [detail, nonFieldMessage]
        .map((message) => message?.trim())
        .filter(Boolean)
        .join(' ');

      const combinedLower = combined.toLowerCase();
      if (
        combinedLower &&
        /(invalid|credenciales|incorrect)/.test(combinedLower)
      ) {
        nextServerErrors.password = 'Credenciales inválidas';
        setPassword('');
      }

      if (Array.isArray(responseData?.email) && responseData.email.length > 0) {
        nextServerErrors.email = responseData.email[0];
      }

      if (
        Array.isArray(responseData?.password) &&
        responseData.password.length > 0
      ) {
        nextServerErrors.password = responseData.password[0];
      }

      setServerErrors(nextServerErrors);
      await logSignInAttempt({ email: trimmedEmail, success: false });

      if (!Object.keys(nextServerErrors).length && !combined) {
        setGlobalError('Ocurrió un error. Inténtalo nuevamente.');
      } else if (
        Object.keys(nextServerErrors).length === 0 &&
        combined &&
        !/(invalid|credenciales|incorrect)/.test(combinedLower)
      ) {
        setGlobalError('Ocurrió un error. Inténtalo nuevamente.');
      } else {
        setGlobalError('');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      {globalSuccess ? (
        <div className="auth-banner auth-banner--success" role="status">
          {globalSuccess}
        </div>
      ) : null}

      {globalError ? (
        <div className="auth-banner auth-banner--error" role="alert">
          {globalError}
        </div>
      ) : null}

      <div className="auth-card">
        <div className="auth-avatar" aria-hidden="true">
          <span className="auth-avatar__icon">[ ]</span>
        </div>

        <h1 className="auth-title">Iniciar sesión</h1>

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <div className="form-field">
            <label className="form-label" htmlFor="login-email">
              Email
            </label>
            <input
              id="login-email"
              type="email"
              className={`form-input${emailError ? ' form-input--error' : ''}`}
              placeholder="usuario@empresa.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              aria-invalid={emailError ? 'true' : 'false'}
              aria-describedby={emailError ? 'login-email-error' : undefined}
              disabled={loading}
            />
            {emailError ? (
              <p
                id="login-email-error"
                className="input-error"
                role="alert"
              >
                {emailError}
              </p>
            ) : null}
          </div>

          <div className="form-field">
            <label className="form-label" htmlFor="login-password">
              Contraseña
            </label>
            <div className="password-input-wrapper">
              <input
                id="login-password"
                type={passwordType}
                className={`form-input${
                  passwordError ? ' form-input--error' : ''
                }`}
                placeholder="Ingresa tu contraseña"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                aria-invalid={passwordError ? 'true' : 'false'}
                aria-describedby={
                  passwordError ? 'login-password-error' : undefined
                }
                disabled={loading}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={passwordToggleLabel}
                disabled={loading}
              >
                {showPassword ? 'Ocultar' : 'Mostrar'}
              </button>
            </div>
            {passwordError ? (
              <p
                id="login-password-error"
                className="input-error"
                role="alert"
              >
                {passwordError}
              </p>
            ) : null}
          </div>

          <div className="form-meta">
            <label className="remember-me">
              <input
                type="checkbox"
                checked={remember}
                onChange={(event) => setRemember(event.target.checked)}
                disabled={loading}
              />
              Recordarme
            </label>
            <Link className="forgot-link" to="/forgot-password">
              Olvidé mi contraseña
            </Link>
          </div>

          <button
            type="submit"
            className="primary-button"
            disabled={loading}
          >
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>
      </div>
    </div>
  );
}
