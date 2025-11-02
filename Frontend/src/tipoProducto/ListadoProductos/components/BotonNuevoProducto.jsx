import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

function BotonNuevoProducto({ to }) {
  return (
    <Link to={to} className="ltp-new-button">
      Nuevo producto
    </Link>
  );
}

BotonNuevoProducto.propTypes = {
  to: PropTypes.string,
};

BotonNuevoProducto.defaultProps = {
  to: '/productos/tipos/nuevo',
};

export default BotonNuevoProducto;
