import { useMemo } from 'react';
import ChartVentas from '../components/ChartVentas.jsx';
import CardResumen from '../components/CardResumen.jsx';
import TablaMasVendidos from '../components/TablaMasVendidos.jsx';
import TablaProximasEntregas from '../components/TablaProximasEntregas.jsx';
import '../styles/Dashboard.css';
import { useAuth } from '../../features/auth/AuthContext.jsx';
import { getUserInitials, getUserName } from '../../features/auth/userUtils.js';

const stockResumen = {
  alerta: 'Alerta: Bajo stock',
  items: [
    { label: 'Categorias', value: 8 },
    { label: 'Pedidos pendientes', value: 2 },
  ],
  badge: 10,
};

function Dashboard() {
  const { user } = useAuth();
  const userInitials = useMemo(() => getUserInitials(user), [user]);
  const userName = useMemo(() => getUserName(user) || 'Usuario', [user]);

  return (
    <div className="db-page">
      <header className="db-main-header">
        <h1 className="db-page-title">Actividades recientes</h1>
        <div className="db-user-icon" title={userName} aria-label={`Perfil de ${userName}`}>
          <span aria-hidden="true">{userInitials}</span>
        </div>
      </header>

      <section className="db-grid">
        <CardResumen className="db-card-sales" title="Ventas">
          <div className="db-card-section-title">Resumen semanal</div>
          <ChartVentas />
        </CardResumen>

        <TablaMasVendidos />

        <CardResumen
          className="db-card-stock"
          title="Stock"
          accent="warning"
          helper="Ultima actualizacion: hoy"
        >
          <div className="db-stock">
            <div className="db-stock-alert">
              <span className="db-stock-alert-text">{stockResumen.alerta}</span>
              <span className="db-stock-alert-badge">{stockResumen.badge}</span>
            </div>
            <ul className="db-stock-list">
              {stockResumen.items.map((item) => (
                <li key={item.label}>
                  <span>{item.label}</span>
                  <span className="db-stock-value">{item.value}</span>
                </li>
              ))}
            </ul>
          </div>
        </CardResumen>

        <TablaProximasEntregas />
      </section>
    </div>
  );
}

export default Dashboard;
