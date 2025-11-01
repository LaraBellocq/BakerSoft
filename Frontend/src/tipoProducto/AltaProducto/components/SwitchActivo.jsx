import PropTypes from 'prop-types';
import clsx from 'clsx';

function SwitchActivo({ checked, onChange, label = 'Activo' }) {
  const handleToggle = () => {
    onChange(!checked);
  };

  return (
    <div className="tp-switch-wrapper">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={handleToggle}
        className={clsx('tp-switch', { 'tp-switch-on': checked })}
      >
        <span className="tp-switch-thumb" />
      </button>
      <span className="tp-switch-label">{label}</span>
    </div>
  );
}

SwitchActivo.propTypes = {
  checked: PropTypes.bool.isRequired,
  onChange: PropTypes.func.isRequired,
  label: PropTypes.string,
};

export default SwitchActivo;
