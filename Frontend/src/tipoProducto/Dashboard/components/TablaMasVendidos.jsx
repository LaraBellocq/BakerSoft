const productosMasVendidos = [
  { nombre: 'Alfajores de maicena', cantidad: 220 },
  { nombre: 'Facturas de crema', cantidad: 140 },
  { nombre: 'Chips', cantidad: 70 },
  { nombre: 'Pan Francés', cantidad: 30 },
];

function TablaMasVendidos() {
  return (
    <div className="db-card db-card-list">
      <h4 className="db-subtitle">Más vendidos...</h4>
      <ul className="db-list">
        {productosMasVendidos.map((producto) => (
          <li key={producto.nombre} className="db-list-item">
            <span className="db-list-icon" aria-hidden="true">
              🔥
            </span>
            <div className="db-list-text">
              <span className="db-list-label">{producto.nombre}</span>
              <span className="db-list-value">{producto.cantidad} uds.</span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default TablaMasVendidos;
