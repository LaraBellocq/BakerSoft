import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import clsx from 'clsx';

function FilaTipoProducto({ tipo, onEdit, onDelete }) {
  const estadoActivo = tipo.estado === 'Activo';

  return (
    <tr className="ltp-row">
      <td>{tipo.codigo}</td>
      <td>{tipo.nombre}</td>
      <td>{tipo.categoria}</td>
      <td>
        <span className={clsx('ltp-status', { 'ltp-status-active': estadoActivo, 'ltp-status-inactive': !estadoActivo })}>
          {tipo.estado}
        </span>
      </td>
      <td>
        <div className="ltp-actions">
          <Link
            to={`/productos/tipos/editar/${tipo.codigo}`}
            className="ltp-action-button"
            onClick={() => onEdit(tipo)}
            aria-label={`Editar ${tipo.nombre}`}
          >
            ✏️
          </Link>
          <button type="button" className="ltp-action-button" onClick={() => onDelete(tipo)} aria-label={`Eliminar ${tipo.nombre}`}>
            🗑️
          </button>
        </div>
      </td>
    </tr>
  );
}

FilaTipoProducto.propTypes = {
  tipo: PropTypes.shape({
    codigo: PropTypes.string.isRequired,
    nombre: PropTypes.string.isRequired,
    categoria: PropTypes.string.isRequired,
    estado: PropTypes.oneOf(['Activo', 'Inactivo']).isRequired,
  }).isRequired,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
};

FilaTipoProducto.defaultProps = {
  onEdit: () => {},
  onDelete: () => {},
};

export default FilaTipoProducto;
