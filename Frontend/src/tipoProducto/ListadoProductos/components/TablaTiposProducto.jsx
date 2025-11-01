import PropTypes from 'prop-types';
import FilaTipoProducto from './FilaTipoProducto.jsx';

function TablaTiposProducto({ tipos, onEdit, onDelete }) {
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
          {tipos.length > 0 ? (
            tipos.map((tipo) => (
              <FilaTipoProducto key={tipo.codigo} tipo={tipo} onEdit={onEdit} onDelete={onDelete} />
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

TablaTiposProducto.propTypes = {
  tipos: PropTypes.arrayOf(
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

TablaTiposProducto.defaultProps = {
  onEdit: () => {},
  onDelete: () => {},
};

export default TablaTiposProducto;
