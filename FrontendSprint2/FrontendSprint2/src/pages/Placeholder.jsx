import PropTypes from 'prop-types';

function Placeholder({ title }) {
  return (
    <div className="placeholder-page">
      <h1>{title}</h1>
      <p>Sección en construcción.</p>
    </div>
  );
}

Placeholder.propTypes = {
  title: PropTypes.string.isRequired,
};

export default Placeholder;

