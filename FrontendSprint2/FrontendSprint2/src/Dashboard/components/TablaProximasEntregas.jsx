const proximasEntregas = [
  { cliente: 'Colón', contacto: 'Ramón', producto: 'Medialunas', cantidad: '30 uds.', pedidos: '4 pedidos' },
  {
    cliente: 'General Paz',
    contacto: 'Ramón',
    producto: 'Tarta frutal',
    cantidad: '140 uds.',
    pedidos: '10 pedidos',
  },
  {
    cliente: 'Panrícos',
    contacto: 'Pedro',
    producto: 'Pan crocante',
    cantidad: '50 uds.',
    pedidos: '2 pedidos',
  },
];

function TablaProximasEntregas() {
  return (
    <div className="db-card db-card-table">
      <header className="db-card-header">
        <h4 className="db-subtitle">Próximas entregas...</h4>
        <button type="button" className="db-link-button">
          Ver más...
        </button>
      </header>

      <table className="db-table">
        <thead>
          <tr>
            <th>Cliente</th>
            <th>Contacto</th>
            <th>Producto</th>
            <th>Cantidad</th>
            <th>Pedidos</th>
          </tr>
        </thead>
        <tbody>
          {proximasEntregas.map((entrega) => (
            <tr key={`${entrega.cliente}-${entrega.producto}`}>
              <td>{entrega.cliente}</td>
              <td>{entrega.contacto}</td>
              <td>{entrega.producto}</td>
              <td>{entrega.cantidad}</td>
              <td>{entrega.pedidos}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default TablaProximasEntregas;

