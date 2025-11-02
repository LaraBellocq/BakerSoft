import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import clsx from 'clsx';

function FilaProducto({ producto, onEdit, onDelete }) {
  const estadoActivo = producto.estado === 'Activo';

  return (
    <tr className="ltp-row">
      <td>{producto.codigo}</td>
      <td>{producto.nombre}</td>
      <td>{producto.categoria}</td>
      <td>
        <span className={clsx('ltp-status', { 'ltp-status-active': estadoActivo, 'ltp-status-inactive': !estadoActivo })}>
          {producto.estado}
        </span>
      </td>
      <td>
        <div className="ltp-actions">
          <Link
            to={`/productos/editar/${producto.codigo}`}
            className="ltp-action-button"
            onClick={() => onEdit(producto)}
            aria-label={`Editar ${producto.nombre}`}
          >
            ✏️
          </Link>
          <button type="button" className="ltp-action-button" onClick={() => onDelete(producto)} aria-label={`Eliminar ${producto.nombre}`}>
            🗑️
          </button>
        </div>
      </td>
    </tr>
  );
}

FilaProducto.propTypes = {
  producto: PropTypes.shape({
    codigo: PropTypes.string.isRequired,
    nombre: PropTypes.string.isRequired,
    categoria: PropTypes.string.isRequired,
    estado: PropTypes.oneOf(['Activo', 'Inactivo']).isRequired,
  }).isRequired,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
};

FilaProducto.defaultProps = {
  onEdit: () => {},
  onDelete: () => {},
};

export default FilaProducto;




