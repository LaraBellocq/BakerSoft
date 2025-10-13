import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { loginUser, logSignInAttempt } from './api';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const AUTH_KEYS = ['auth.access', 'auth.refresh', 'auth.user', 'auth.remember'];

function pickStorage(remember){ return typeof window==='undefined' ? {getItem(){},setItem(){},removeItem(){}} : (remember?localStorage:sessionStorage); }
function otherStorage(remember){ return typeof window==='undefined' ? {removeItem(){}} : (remember?sessionStorage:localStorage); }
function getInitialRemember(){ if(typeof window==='undefined') return false; const s=localStorage.getItem('auth.remember')??sessionStorage.getItem('auth.remember'); return s==='true'; }

export default function Login() {
  const navigate = useNavigate();
  const [email,setEmail] = useState('');
  const [password,setPassword] = useState('');
  const [remember,setRemember] = useState(getInitialRemember);
  const [showPassword,setShowPassword] = useState(false);
  const [loading,setLoading] = useState(false);
  const [clientErrors,setClientErrors] = useState({});
  const [serverErrors,setServerErrors] = useState({});
  const [globalError,setGlobalError] = useState('');
  const [globalSuccess,setGlobalSuccess] = useState('');

  const emailError = clientErrors.email || serverErrors.email;
  const passwordError = clientErrors.password || serverErrors.password;
  const passwordType = showPassword ? 'text' : 'password';
  const toggleLabel = showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña';

  async function handleSubmit(e){
    e.preventDefault();
    setClientErrors({}); setServerErrors({}); setGlobalError(''); setGlobalSuccess('');
    const errs = {};
    const trimmed = email.trim();
    if(!trimmed) errs.email='El email es obligatorio';
    else if(!emailRegex.test(trimmed)) errs.email='Email inválido';
    if(!password) errs.password='La contraseña es obligatoria';
    if(Object.keys(errs).length){ setClientErrors(errs); return; }

    setLoading(true);
    try{
      const data = await loginUser({ email: trimmed, password });
      const active = pickStorage(remember);
      const secondary = otherStorage(remember);
      AUTH_KEYS.forEach(k=>secondary.removeItem(k));
      if(data?.access) active.setItem('auth.access', data.access);
      if(data?.refresh) active.setItem('auth.refresh', data.refresh);
      if(data?.user) try{ active.setItem('auth.user', JSON.stringify(data.user)); }catch{}
      active.setItem('auth.remember', String(remember));
      setGlobalSuccess('Sesión iniciada.');
      await logSignInAttempt({ email: trimmed, success: true });
      navigate('/dashboard'); // placeholder según HU-02
    }catch(error){
      const d = error?.data;
      const next = {};
      const detail = typeof d?.detail==='string' ? d.detail : '';
      const nonField = Array.isArray(d?.non_field_errors) ? d.non_field_errors.join(' ') : (typeof d?.non_field_errors==='string' ? d.non_field_errors : '');
      const combined = [detail,nonField].map(s=>s?.trim()).filter(Boolean).join(' ').toLowerCase();
      if(combined && /(invalid|credenciales|incorrect)/.test(combined)){ next.password='Credenciales inválidas'; setPassword(''); }
      if(Array.isArray(d?.email)&&d.email[0]) next.email=d.email[0];
      if(Array.isArray(d?.password)&&d.password[0]) next.password=d.password[0];
      setServerErrors(next);
      await logSignInAttempt({ email: email.trim(), success: false });
      if(!Object.keys(next).length && !combined) setGlobalError('Ocurrió un error. Inténtalo nuevamente.');
      else if(Object.keys(next).length===0 && combined && !/(invalid|credenciales|incorrect)/.test(combined)) setGlobalError('Ocurrió un error. Inténtalo nuevamente.');
      else setGlobalError('');
    }finally{ setLoading(false); }
  }

  return (
    <section className="form" aria-labelledby="login-title">
      <div className="form-card">
        <div className="form-header">
          <div className="form-icon" aria-hidden="true">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path d="M12 12c2.761 0 5-2.239 5-5s-2.239-5-5-5-5 2.239-5 5 2.239 5 5 5Zm0 2c-3.866 0-7 3.134-7 7 0 .552.448 1 1 1h12c.552 0 1-.448 1-1 0-3.866-3.134-7-7-7Z" fill="#7A4D14"/>
            </svg>
          </div>
          <h2 id="login-title">Iniciar sesión</h2>
          <p>Ingresa tus credenciales para continuar</p>
        </div>

        {globalSuccess ? (
          <div className="alert success" role="status" aria-live="polite">
            <div className="alert-message"><span>{globalSuccess}</span></div>
          </div>
        ) : null}

        {globalError && !globalSuccess ? (
          <div className="alert error" role="alert" aria-live="assertive">{globalError}</div>
        ) : null}

        <form onSubmit={handleSubmit} noValidate>
          <div className="field">
            <label htmlFor="login-email">Correo electrónico</label>
            <input
              id="login-email" type="email" autoComplete="email" placeholder="ejemplo@email.com"
              value={email} onChange={e=>setEmail(e.target.value)}
              aria-required="true" aria-invalid={Boolean(emailError)}
              aria-describedby={emailError ? 'login-email-error' : undefined}
              className={emailError ? 'has-error' : ''} disabled={loading} required
            />
            {emailError ? <p id="login-email-error" className="error" role="alert">{emailError}</p> : null}
          </div>

          <div className="field">
            <label htmlFor="login-password">Contraseña</label>
            <div className="input-with-icon">
              <input
                id="login-password" type={passwordType} autoComplete="current-password" placeholder="Ingresa tu contraseña"
                value={password} onChange={e=>setPassword(e.target.value)}
                aria-required="true" aria-invalid={Boolean(passwordError)}
                aria-describedby={passwordError ? 'login-password-error' : undefined}
                className={passwordError ? 'has-error' : ''} disabled={loading} required
              />
              <button type="button" className="icon-button" onClick={()=>setShowPassword(p=>!p)} aria-label={toggleLabel} disabled={loading}>
                <span aria-hidden="true">{showPassword ? '🙈' : '👁️'}</span>
              </button>
            </div>
            {passwordError ? <p id="login-password-error" className="error" role="alert">{passwordError}</p> : null}
          </div>

          <div className="field field-inline">
            <label>
              <input type="checkbox" checked={remember} onChange={e=>setRemember(e.target.checked)} disabled={loading} />
              <span>Recordarme</span>
            </label>
            <Link to="/forgot-password">Olvidé mi contraseña</Link>
          </div>

          <div className="actions">
            <button type="submit" className="primary full-width" disabled={loading}>
              {loading ? 'Ingresando...' : 'Ingresar'}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
