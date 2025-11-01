import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { confirmPasswordReset, validateResetToken } from './api';

const passwordPolicyRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

function parseDrfErrors(data) {
  const fieldErrors = {};
  let globalMessage = '';

  if (!data || typeof data !== 'object') {
    return { fieldErrors, globalMessage };
  }

  if (typeof data.detail === 'string') {
    globalMessage = data.detail;
  }

  const nonField =
    Array.isArray(data.non_field_errors) && data.non_field_errors.length > 0
      ? data.non_field_errors.join(' ')
      : typeof data.non_field_errors === 'string'
      ? data.non_field_errors
      : '';

  if (nonField) {
    globalMessage = nonField;
  }

  const mapField = (keys, alias) => {
    keys.forEach((key) => {
      if (Array.isArray(data[key]) && data[key].length > 0 && !fieldErrors[alias]) {
        fieldErrors[alias] = String(data[key][0]);
      }
    });
  };

  mapField(['email'], 'email');
  mapField(['password', 'new_password', 'new_password1'], 'password');
  mapField(['password2', 'new_password2', 'confirm_password'], 'confirmPassword');
  mapField(['token'], 'token');

  return { fieldErrors, globalMessage };
}

export default function ResetPassword() {
  const { token } = useParams();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [clientErrors, setClientErrors] = useState({});
  const [serverErrors, setServerErrors] = useState({});
  const [globalError, setGlobalError] = useState(token ? '' : 'Token invalido o expirado.');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [tokenIssue, setTokenIssue] = useState(!token);

  const passwordError = clientErrors.password || serverErrors.password;
  const confirmError = clientErrors.confirmPassword || serverErrors.confirmPassword;

  useEffect(() => {
    let cancelled = false;

    if (!token) {
      setGlobalError('Token invalido o expirado.');
      setTokenIssue(true);
      return () => {
        cancelled = true;
      };
    }

    setTokenIssue(false);
    setGlobalError('');

    (async () => {
      try {
        await validateResetToken({ token });
      } catch (error) {
        if (cancelled) return;
        const message =
          error?.data?.detail ||
          (Array.isArray(error?.data?.token) && error.data.token[0]) ||
          'Token invalido o expirado.';
        setGlobalError(message);
        setTokenIssue(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [token]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setClientErrors({});
    setServerErrors({});
    setGlobalError('');
    setSuccessMessage('');
    setTokenIssue(false);

    const nextClientErrors = {};

    if (!password) {
      nextClientErrors.password = 'La contrasena es obligatoria';
    } else if (!passwordPolicyRegex.test(password)) {
      nextClientErrors.password = 'Debe cumplir la politica de seguridad';
    }

    if (!confirmPassword) {
      nextClientErrors.confirmPassword = 'Confirma tu contrasena';
    } else if (password && password !== confirmPassword) {
      nextClientErrors.confirmPassword = 'Las contrasenas no coinciden';
    }

    if (!token) {
      setGlobalError('Token invalido o expirado.');
      setTokenIssue(true);
    }

    if (Object.keys(nextClientErrors).length > 0 || !token) {
      setClientErrors(nextClientErrors);
      return;
    }

    setLoading(true);

    try {
      await confirmPasswordReset({ token, password, confirm: confirmPassword });
      setServerErrors({});
      setClientErrors({});
      setSuccessMessage('Contrasena restablecida correctamente. Ya puedes iniciar sesion.');
      setPassword('');
      setConfirmPassword('');
    } catch (error) {
      const { fieldErrors, globalMessage } = parseDrfErrors(error?.data);
      const tokenMessage = fieldErrors.token;
      if (tokenMessage) {
        delete fieldErrors.token;
      }
      setServerErrors(fieldErrors);
      const message = tokenMessage || globalMessage || 'Ocurrio un error. Intentalo nuevamente.';
      setGlobalError(message);
      setTokenIssue(Boolean(tokenMessage) || message.toLowerCase().includes('token'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="form" aria-labelledby="reset-password-title">
      <div className="form-card">
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
          <h2 id="reset-password-title">Restablecer contrasena</h2>
          <p>Ingresa una nueva contrasena segura para tu cuenta.</p>
        </div>

        {successMessage ? (
          <div className="alert success" role="status" aria-live="polite">
            <div className="alert-message">
              <span>{successMessage}</span>
            </div>
            <Link className="secondary full-width" to="/login">
              Ir a iniciar sesion
            </Link>
          </div>
        ) : null}

        {globalError && !successMessage ? (
          <div className="alert error" role="alert" aria-live="assertive">
            <p>{globalError}</p>
            {tokenIssue ? (
              <Link className="secondary full-width" to="/forgot-password">
                Volver a solicitar enlace
              </Link>
            ) : null}
          </div>
        ) : null}

        <form onSubmit={handleSubmit} noValidate>
          <div className="field">
            <label htmlFor="reset-password">Nueva contrasena</label>
            <input
              id="reset-password"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              aria-required="true"
              aria-invalid={Boolean(passwordError)}
              aria-describedby={
                passwordError ? 'reset-password-error reset-password-hint' : 'reset-password-hint'
              }
              className={passwordError ? 'has-error' : ''}
              disabled={loading}
              required
            />
            <p id="reset-password-hint" className="hint">
              Debe cumplir la politica de seguridad.
            </p>
            {passwordError ? (
              <p id="reset-password-error" className="error" role="alert">
                {passwordError}
              </p>
            ) : null}
          </div>

          <div className="field">
            <label htmlFor="reset-confirm-password">Confirmar contrasena</label>
            <input
              id="reset-confirm-password"
              type="password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              aria-required="true"
              aria-invalid={Boolean(confirmError)}
              aria-describedby={confirmError ? 'reset-confirm-password-error' : undefined}
              className={confirmError ? 'has-error' : ''}
              disabled={loading}
              required
            />
            {confirmError ? (
              <p id="reset-confirm-password-error" className="error" role="alert">
                {confirmError}
              </p>
            ) : null}
          </div>

          <div className="actions">
            <button type="submit" className="primary full-width" disabled={loading}>
              {loading ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
