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
    <section className="form" aria-labelledby="login-title">
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
        <h2 id="login-title">Iniciar sesión</h2>
        <p>Ingresa tus credenciales para continuar</p>
      </div>

      {globalSuccess ? (
        <div className="alert success" role="status" aria-live="polite">
          <div className="alert-message">
            <span>{globalSuccess}</span>
          </div>
        </div>
      ) : null}

      {globalError && !globalSuccess ? (
        <div className="alert error" role="alert" aria-live="assertive">
          {globalError}
        </div>
      ) : null}

      <form onSubmit={handleSubmit} noValidate>
        <div className="field">
          <label htmlFor="login-email">Correo electronico</label>
          <input
            id="login-email"
            type="email"
            autoComplete="email"
            placeholder="ejemplo@email.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            aria-required="true"
            aria-invalid={Boolean(emailError)}
            aria-describedby={emailError ? 'login-email-error' : undefined}
            className={emailError ? 'has-error' : ''}
            disabled={loading}
            required
          />
          {emailError ? (
            <p id="login-email-error" className="error" role="alert">
              {emailError}
            </p>
          ) : null}
        </div>

        <div className="field">
          <label htmlFor="login-password">Contraseña</label>
          <div className="input-with-icon">
            <input
              id="login-password"
              type={passwordType}
              autoComplete="current-password"
              placeholder="Ingresa tu contraseña"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              aria-required="true"
              aria-invalid={Boolean(passwordError)}
              aria-describedby={
                passwordError ? 'login-password-error' : undefined
              }
              className={passwordError ? 'has-error' : ''}
              disabled={loading}
              required
            />
            <button
              type="button"
              className="icon-button"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={passwordToggleLabel}
              disabled={loading}
            >
              <span aria-hidden="true">{showPassword ? '🙈' : '👁️'}</span>
            </button>
          </div>
          {passwordError ? (
            <p id="login-password-error" className="error" role="alert">
              {passwordError}
            </p>
          ) : null}
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            flexWrap: 'wrap',
          }}
        >
          <label
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontWeight: 600,
              color: '#1f2937',
            }}
          >
            <input
              type="checkbox"
              checked={remember}
              onChange={(event) => setRemember(event.target.checked)}
              disabled={loading}
            />
            <span>Recordarme</span>
          </label>
          <Link
            to="/forgot-password"
            style={{
              color: '#2563eb',
              fontWeight: 600,
              textDecoration: 'none',
            }}
          >
            Olvidé mi contraseña
          </Link>
        </div>

        <div className="actions">
          <button type="submit" className="primary full-width" disabled={loading}>
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>
        </div>
      </form>
    </section>
  );
}
