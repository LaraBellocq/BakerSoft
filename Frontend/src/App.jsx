import { useState } from 'react';
import './App.css';
import Register from './features/auth/Register';

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api/ping/';

function App() {
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeView, setActiveView] = useState('register');

  const handleSelectView = (view) => {
    setActiveView(view);
  };

  const handleCheckConnection = async () => {
    if (activeView !== 'connection') {
      setActiveView('connection');
    }

    setIsLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await fetch(API_URL);
      if (!response.ok) {
        throw new Error(`Respuesta inesperada: ${response.status}`);
      }
      const data = await response.json();
      setMessage(`Conectado: ${JSON.stringify(data)}`);
    } catch (err) {
      setError(`No se pudo conectar: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="page">
      <nav className="toolbar" aria-label="Menu principal">
        <button
          type="button"
          className={`tab ${activeView === 'connection' ? 'is-active' : ''}`}
          onClick={() => handleSelectView('connection')}
        >
          Probar conexion
        </button>
        <button
          type="button"
          className={`tab ${activeView === 'register' ? 'is-active' : ''}`}
          onClick={() => handleSelectView('register')}
        >
          Registrar usuario
        </button>
      </nav>

      <div className="card">
        {activeView === 'connection' ? (
          <section className="form form-connection" aria-labelledby="connection-title">
            <div className="form-header">
              <div className="form-icon" aria-hidden="true">
                <span>API</span>
              </div>
              <h2 id="connection-title">Probar conexion</h2>
              <p>Consulta el endpoint de ping del backend para validar la comunicacion.</p>
            </div>
            <div className="actions">
              <button
                type="button"
                className="primary full-width"
                onClick={handleCheckConnection}
                disabled={isLoading}
              >
                {isLoading ? 'Conectando...' : 'Probar conexion'}
              </button>
            </div>
            {message && (
              <p className="status success" role="status" aria-live="polite">
                {message}
              </p>
            )}
            {error && (
              <p className="status error" role="alert" aria-live="assertive">
                {error}
              </p>
            )}
          </section>
        ) : (
          <Register />
        )}
      </div>
    </main>
  );
}

export default App;


