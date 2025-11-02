import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import InputField from '../../HU01-AltaProducto/components/InputField.jsx';
import ImageUpload from '../../HU01-AltaProducto/components/ImageUpload.jsx';
import SwitchActivo from '../../HU01-AltaProducto/components/SwitchActivo.jsx';
import ModalConfirmacion from '../../HU03-BajaTipoProducto/components/ModalConfirmacion.jsx';

function FormEditarTipoProducto({ product }) {
  const navigate = useNavigate();
  const initialState = useMemo(
    () => ({
      code: product.code,
      category: product.category ?? '',
      name: product.name ?? '',
      price: product.price ? String(product.price) : '',
      description: product.description ?? '',
      image: product.image ?? null,
      active: product.active ?? true,
    }),
    [product],
  );

  const [formValues, setFormValues] = useState(initialState);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [statusMessage, setStatusMessage] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pendingActive, setPendingActive] = useState(null);
  const originalCode = useMemo(() => product.code, [product.code]);

  useEffect(() => {
    setFormValues(initialState);
    setErrors({});
    setSuccessMessage('');
    setErrorMessage('');
    setStatusMessage(null);
  }, [initialState]);

  const handleFieldChange = (event) => {
    const { name, value } = event.target;
    setFormValues((prev) => ({
      ...prev,
      [name]: value,
    }));
    setErrors((prev) => ({
      ...prev,
      [name]: '',
    }));
    setSuccessMessage('');
    setErrorMessage('');
    setStatusMessage(null);
  };

  const handleActiveChange = (checked) => {
    setPendingActive(checked);
    setIsModalOpen(true);
  };

  const handleImageChange = (image) => {
    if (formValues.image?.preview) {
      URL.revokeObjectURL(formValues.image.preview);
    }
    setFormValues((prev) => ({
      ...prev,
      image,
    }));
    setErrors((prev) => ({
      ...prev,
      image: '',
    }));
    setSuccessMessage('');
    setErrorMessage('');
    setStatusMessage(null);
  };

  useEffect(
    () => () => {
      if (formValues.image?.preview) {
        URL.revokeObjectURL(formValues.image.preview);
      }
    },
    [formValues.image],
  );

  useEffect(() => {
    if (!statusMessage) {
      return;
    }
    const timer = window.setTimeout(() => {
      setStatusMessage(null);
    }, 3000);
    return () => window.clearTimeout(timer);
  }, [statusMessage]);

  const validate = () => {
    const nextErrors = {};
    if (!formValues.category?.trim()) {
      nextErrors.category = 'La categoría es obligatoria.';
    }
    if (!formValues.name?.trim()) {
      nextErrors.name = 'El nombre es obligatorio.';
    }
    if (!formValues.price || Number(formValues.price) <= 0) {
      nextErrors.price = 'Ingrese un precio válido.';
    }
    if (formValues.description?.length > 250) {
      nextErrors.description = 'La descripción no puede superar 250 caracteres.';
    }
    return nextErrors;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setStatusMessage(null);

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setErrorMessage('');
      setSuccessMessage('');
      setIsSubmitting(false);
      return;
    }

    if (formValues.code !== originalCode) {
      setErrorMessage('El código no puede modificarse.');
      setSuccessMessage('');
      setIsSubmitting(false);
      return;
    }

    await new Promise((resolve) => {
      setTimeout(resolve, 600);
    });

    setSuccessMessage('Producto actualizado correctamente.');
    setErrorMessage('');
    setIsSubmitting(false);
  };

  const handleModalCancel = () => {
    setIsModalOpen(false);
    setPendingActive(null);
  };

  const handleModalConfirm = () => {
    if (pendingActive === null) {
      setIsModalOpen(false);
      return;
    }

    setFormValues((prev) => ({
      ...prev,
      active: pendingActive,
    }));
    setIsModalOpen(false);

    if (pendingActive) {
      setStatusMessage({ type: 'activated', text: 'El producto se activó correctamente.' });
    } else {
      setStatusMessage({ type: 'deactivated', text: 'El producto se marcó como inactivo.' });
    }

    setPendingActive(null);
  };

  const handleCancel = () => {
    navigate('/productos/tipos');
  };

  return (
    <form className="etp-form" onSubmit={handleSubmit} noValidate>
      <div className="etp-form-grid">
        <div className="etp-column">
          <InputField
            label="Código"
            name="code"
            value={formValues.code}
            onChange={handleFieldChange}
            required
            helperText="El código es único; los cambios no serán guardados."
          />

          <div className="tp-field">
            <label className="tp-label" htmlFor="category">
              Categoría<span className="tp-required">*</span>
            </label>
            <select
              id="category"
              name="category"
              className={clsx('tp-input', { 'tp-input-error': Boolean(errors.category) })}
              value={formValues.category}
              onChange={handleFieldChange}
              required
            >
              <option value="">Seleccionar categoría</option>
              <option value="Panadería">Panadería</option>
              <option value="Pastelería">Pastelería</option>
            </select>
            {errors.category ? <p className="tp-error">{errors.category}</p> : null}
          </div>

          <InputField
            label="Nombre"
            name="name"
            value={formValues.name}
            onChange={handleFieldChange}
            required
            maxLength={64}
            error={errors.name}
            placeholder="Nombre del producto"
          />

          <InputField
            label="Precio"
            name="price"
            type="number"
            value={formValues.price}
            onChange={handleFieldChange}
            required
            error={errors.price}
            min="0.01"
            step="0.01"
            placeholder="Ej: 3500"
          />

          <InputField
            label="Descripción"
            name="description"
            value={formValues.description}
            onChange={handleFieldChange}
            as="textarea"
            maxLength={250}
            showCounter
            error={errors.description}
            placeholder="Describe brevemente el producto"
          />

          {errorMessage ? (
            <div className="etp-inline-alert etp-alert etp-alert-error" role="alert">
              {errorMessage}
            </div>
          ) : null}

          {successMessage ? (
            <div className="etp-inline-alert etp-alert etp-alert-success" role="alert">
              {successMessage}
            </div>
          ) : null}

          {statusMessage ? (
            <div
              className={clsx('etp-inline-alert etp-alert', {
                'etp-alert-success': statusMessage.type === 'activated',
                'etp-alert-neutral': statusMessage.type === 'deactivated',
              })}
              role="alert"
            >
              {statusMessage.text}
            </div>
          ) : null}
        </div>

        <div className="etp-column etp-column-right">
          <ImageUpload value={formValues.image} onChange={handleImageChange} error={errors.image} />
          <SwitchActivo checked={formValues.active} onChange={handleActiveChange} />
        </div>
      </div>

      <div className="etp-actions">
        <button type="button" className="etp-btn etp-btn-secondary" onClick={handleCancel} disabled={isSubmitting}>
          Cancelar
        </button>
        <button type="submit" className="etp-btn etp-btn-primary" disabled={isSubmitting}>
          {isSubmitting ? 'Guardando...' : 'Guardar'}
        </button>
      </div>

      <ModalConfirmacion
        open={isModalOpen}
        mode={pendingActive ? 'activate' : 'deactivate'}
        productName={formValues.name || product.name || formValues.code}
        onCancel={handleModalCancel}
        onConfirm={handleModalConfirm}
      />
    </form>
  );
}

FormEditarTipoProducto.propTypes = {
  product: PropTypes.shape({
    code: PropTypes.string.isRequired,
    category: PropTypes.string,
    name: PropTypes.string,
    price: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    description: PropTypes.string,
    image: PropTypes.shape({
      file: PropTypes.object,
      preview: PropTypes.string,
    }),
    active: PropTypes.bool,
  }).isRequired,
};

export default FormEditarTipoProducto;
