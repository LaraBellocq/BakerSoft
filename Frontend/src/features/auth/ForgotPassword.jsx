import { useState } from 'react';
import { requestPasswordReset } from './api';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function normalizeEmail(value) {
  return String(value || '').trim().toLowerCase();
}

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

  if (Array.isArray(data.email) && data.email.length > 0) {
    fieldErrors.email = String(data.email[0]);
  }

  return { fieldErrors, globalMessage };
}

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [clientErrors, setClientErrors] = useState({});
  const [serverErrors, setServerErrors] = useState({});
  const [globalError, setGlobalError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const emailError = clientErrors.email || serverErrors.email;

  const handleSubmit = async (event) => {
    event.preventDefault();
    setClientErrors({});
    setServerErrors({});
    setGlobalError('');
    setSuccessMessage('');

    const trimmedEmail = email.trim();
    const nextClientErrors = {};

    if (!trimmedEmail) {
      nextClientErrors.email = 'El email es requerido';
    } else if (!emailRegex.test(trimmedEmail)) {
      nextClientErrors.email = 'Email invalido';
    }

    if (Object.keys(nextClientErrors).length > 0) {
      setClientErrors(nextClientErrors);
      return;
    }

    setLoading(true);
    const normalizedEmail = normalizeEmail(trimmedEmail);

    try {
      await requestPasswordReset({ email: normalizedEmail });
      setSuccessMessage('Si existe una cuenta, enviamos un enlace.');
    } catch (error) {
      const { fieldErrors, globalMessage } = parseDrfErrors(error?.data);
      setServerErrors(fieldErrors);
      setGlobalError(globalMessage || 'Intentalo nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="form" aria-labelledby="forgot-password-title">
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
          <h2 id="forgot-password-title">Olvide mi contraseña</h2>
          <p>Te enviaremos un enlace para restablecerla.</p>
        </div>

        {successMessage ? (
          <div className="alert success" role="status" aria-live="polite">
            <div className="alert-message">
              <span>{successMessage}</span>
            </div>
          </div>
        ) : null}

        {globalError && !successMessage ? (
          <div className="alert error" role="alert" aria-live="assertive">
            {globalError}
          </div>
        ) : null}

        <form onSubmit={handleSubmit} noValidate>
          <div className="field">
            <label htmlFor="forgot-email">Correo electronico</label>
            <input
              id="forgot-email"
              type="email"
              autoComplete="email"
              placeholder="ejemplo@email.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              aria-required="true"
              aria-invalid={Boolean(emailError)}
              aria-describedby={emailError ? 'forgot-email-error' : undefined}
              className={emailError ? 'has-error' : ''}
              disabled={loading}
              required
            />
            {emailError ? (
              <p id="forgot-email-error" className="error" role="alert">
                {emailError}
              </p>
            ) : null}
          </div>

          <div className="actions">
            <button type="submit" className="primary full-width" disabled={loading}>
              {loading ? 'Enviando...' : 'Enviar enlace'}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
