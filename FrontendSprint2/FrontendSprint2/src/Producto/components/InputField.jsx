import PropTypes from 'prop-types';
import clsx from 'clsx';

function InputField({
  label,
  name,
  type = 'text',
  value,
  onChange,
  placeholder,
  required,
  error,
  helperText,
  maxLength,
  as,
  showCounter,
  min,
  step,
  readOnly,
  disabled,
}) {
  const isTextArea = as === 'textarea';

  return (
    <div className="tp-field">
      <label className="tp-label" htmlFor={name}>
        {label}
        {required ? <span className="tp-required">*</span> : null}
      </label>

      {isTextArea ? (
        <textarea
          id={name}
          name={name}
          className={clsx('tp-input', 'tp-textarea', { 'tp-input-error': Boolean(error) })}
          value={value}
          placeholder={placeholder}
          onChange={onChange}
          maxLength={maxLength}
          readOnly={readOnly}
          disabled={disabled}
        />
      ) : (
        <input
          id={name}
          name={name}
          type={type}
          className={clsx('tp-input', { 'tp-input-error': Boolean(error) })}
          value={value}
          placeholder={placeholder}
          onChange={onChange}
          required={required}
          maxLength={maxLength}
          min={min}
          step={step}
          readOnly={readOnly}
          disabled={disabled}
        />
      )}

      <div className="tp-field-footer">
        {helperText ? <span className="tp-helper">{helperText}</span> : <span />}
        {showCounter && maxLength ? (
          <span className="tp-counter">
            {value?.length ?? 0}/{maxLength}
          </span>
        ) : null}
      </div>

      {error ? <p className="tp-error">{error}</p> : null}
    </div>
  );
}

InputField.propTypes = {
  label: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  type: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  required: PropTypes.bool,
  error: PropTypes.string,
  helperText: PropTypes.string,
  maxLength: PropTypes.number,
  as: PropTypes.oneOf(['textarea']),
  showCounter: PropTypes.bool,
  min: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  step: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  readOnly: PropTypes.bool,
  disabled: PropTypes.bool,
};

export default InputField;
