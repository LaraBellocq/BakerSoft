import PropTypes from 'prop-types';
import FilaProducto from './FilaProducto.jsx';

function TablaProductos({ productos, onEdit, onDelete }) {
  return (
    <div className="ltp-table-wrapper">
      <table className="ltp-table">
        <thead>
          <tr>
            <th>Código</th>
            <th>Nombre</th>
            <th>Categoría</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {productos.length > 0 ? (
            productos.map((producto) => (
              <FilaProducto key={producto.codigo} producto={producto} onEdit={onEdit} onDelete={onDelete} />
            ))
          ) : (
            <tr>
              <td colSpan={5} className="ltp-empty">
                No se encontraron productos con ese criterio.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

TablaProductos.propTypes = {
  productos: PropTypes.arrayOf(
    PropTypes.shape({
      codigo: PropTypes.string.isRequired,
      nombre: PropTypes.string.isRequired,
      categoria: PropTypes.string.isRequired,
      estado: PropTypes.oneOf(['Activo', 'Inactivo']).isRequired,
    }),
  ).isRequired,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
};

TablaProductos.defaultProps = {
  onEdit: () => {},
  onDelete: () => {},
};

export default TablaProductos;




