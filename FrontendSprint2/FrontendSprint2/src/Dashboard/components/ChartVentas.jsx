const ventasMock = [
  { estado: 'Confirmadas', cantidad: 120 },
  { estado: 'Pendientes', cantidad: 80 },
  { estado: 'En camino', cantidad: 65 },
  { estado: 'Entregadas', cantidad: 180 },
];

function ChartVentas() {
  const maxValue = Math.max(...ventasMock.map((item) => item.cantidad));

  return (
    <div className="db-chart">
      <div className="db-chart-wrapper">
        {ventasMock.map((item) => {
          const height = Math.round((item.cantidad / maxValue) * 100);
          return (
            <div key={item.estado} className="db-chart-column">
              <div className="db-chart-bar" style={{ '--h': `${height}%` }} aria-label={`${item.estado}: ${item.cantidad}`} />
              <span className="db-chart-label">{item.estado}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default ChartVentas;
