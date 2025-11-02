import { useRef } from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';

function ImageUpload({ value, onChange, error }) {
  const inputRef = useRef(null);

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    if (value?.preview) {
      URL.revokeObjectURL(value.preview);
    }

    const preview = URL.createObjectURL(file);
    onChange({ file, preview });
  };

  const handleRemove = () => {
    if (value?.preview) {
      URL.revokeObjectURL(value.preview);
    }
    if (inputRef.current) {
      inputRef.current.value = '';
    }
    onChange(null);
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      inputRef.current?.click();
    }
  };

  return (
    <div className="tp-upload-section">
      <p className="tp-label">Imagen</p>
      <div
        className={clsx('tp-upload', { 'tp-upload-has-image': Boolean(value), 'tp-upload-error': Boolean(error) })}
        role="button"
        tabIndex={0}
        onKeyDown={handleKeyDown}
        onClick={() => inputRef.current?.click()}
      >
        {value?.preview ? (
          <img className="tp-upload-preview" src={value.preview} alt={value.file?.name ?? 'Imagen cargada'} />
        ) : (
          <div className="tp-upload-placeholder">
            <span className="tp-upload-plus">+</span>
            <span className="tp-upload-text">Subir imagen</span>
          </div>
        )}
        <input
          ref={inputRef}
          className="tp-upload-input"
          type="file"
          accept="image/*"
          tabIndex={-1}
          onChange={handleFileChange}
        />
      </div>
      {value ? (
        <div className="tp-upload-actions">
          <button type="button" className="tp-upload-remove" onClick={handleRemove}>
            Quitar
          </button>
        </div>
      ) : null}
      {error ? <p className="tp-error">{error}</p> : null}
    </div>
  );
}

ImageUpload.propTypes = {
  value: PropTypes.shape({
    file: PropTypes.instanceOf(File),
    preview: PropTypes.string,
  }),
  onChange: PropTypes.func.isRequired,
  error: PropTypes.string,
};

export default ImageUpload;
