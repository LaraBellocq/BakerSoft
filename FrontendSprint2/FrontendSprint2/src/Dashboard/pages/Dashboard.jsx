import ChartVentas from '../components/ChartVentas.jsx';
import CardResumen from '../components/CardResumen.jsx';
import TablaMasVendidos from '../components/TablaMasVendidos.jsx';
import TablaProximasEntregas from '../components/TablaProximasEntregas.jsx';
import '../styles/Dashboard.css';

const stockResumen = {
  alerta: 'Alerta: Bajo stock',
  items: [
    { label: 'Categorías', value: 8 },
    { label: 'Pedidos pendientes', value: 2 },
  ],
  badge: 10,
};

function Dashboard() {
  return (
    <div className="db-page">
      <header className="db-main-header">
        <h1 className="db-page-title">Actividades recientes</h1>
        <div className="db-user-icon" aria-hidden="true">
          <span>AP</span>
        </div>
      </header>

      <section className="db-grid">
        <CardResumen className="db-card-sales" title="Ventas">
          <div className="db-card-section-title">Resumen semanal</div>
          <ChartVentas />
        </CardResumen>

        <TablaMasVendidos />

        <CardResumen className="db-card-stock" title="Stock" accent="warning" helper="Ãšltima actualización: hoy">
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

