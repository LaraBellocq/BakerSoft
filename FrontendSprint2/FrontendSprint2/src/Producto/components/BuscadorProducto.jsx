import PropTypes from 'prop-types';

function BuscadorProducto({ value, onChange, placeholder = 'Buscar por nombre, código o categoría...', children }) {
  return (
    <div className="ltp-search">
      <span className="ltp-search-icon" aria-hidden="true">🔍</span>
      <input
        type="search"
        className="ltp-search-input"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        aria-label="Buscar producto"
      />
      {children}
    </div>
  );
}

BuscadorProducto.propTypes = {
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  children: PropTypes.node,
};

BuscadorProducto.defaultProps = {
  placeholder: 'Buscar por nombre, código o categoría...',
  children: null,
};

export default BuscadorProducto;
