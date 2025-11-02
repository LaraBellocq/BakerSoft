import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import InputField from './InputField.jsx';
import ImageUpload from './ImageUpload.jsx';
import SwitchActivo from './SwitchActivo.jsx';

const initialValues = {
  code: '',
  category: '',
  name: '',
  price: '',
  description: '',
  image: null,
  active: true,
};

const existingRecords = [
  { code: '001', name: 'Pan Francés' },
  { code: '002', name: 'Medialunas' },
  { code: '010', name: 'Tarta Frutal' },
];

function FormAltaProducto() {
  const [formValues, setFormValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    return () => {
      if (formValues.image?.preview) {
        URL.revokeObjectURL(formValues.image.preview);
      }
    };
  }, [formValues.image]);

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
  };

  const handleActiveChange = (checked) => {
    setFormValues((prev) => ({
      ...prev,
      active: checked,
    }));
  };

  const handleImageChange = (image) => {
    setFormValues((prev) => ({
      ...prev,
      image,
    }));
    setErrors((prev) => ({
      ...prev,
      image: '',
    }));
  };

  const validate = () => {
    const nextErrors = {};
    if (!formValues.code.trim()) {
      nextErrors.code = 'El código es obligatorio.';
    }
    if (!formValues.category.trim()) {
      nextErrors.category = 'La categoría es obligatoria.';
    }
    if (!formValues.name.trim()) {
      nextErrors.name = 'El nombre es obligatorio.';
    }
    if (!formValues.price || Number(formValues.price) <= 0) {
      nextErrors.price = 'Ingrese un precio válido.';
    }
    if (formValues.description.length > 250) {
      nextErrors.description = 'La descripción no puede superar 250 caracteres.';
    }
    return nextErrors;
  };

  const resetForm = () => {
    if (formValues.image?.preview) {
      URL.revokeObjectURL(formValues.image.preview);
    }
    setFormValues(initialValues);
    setErrors({});
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus(null);
    setIsSubmitting(true);

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setIsSubmitting(false);
      return;
    }

    const normalizedCode = formValues.code.trim();
    const normalizedName = formValues.name.trim().toLowerCase();

    const duplicatedRecord = existingRecords.find(
      (record) =>
        record.code === normalizedCode || record.name.toLowerCase() === normalizedName,
    );

    await new Promise((resolve) => {
      setTimeout(resolve, 600);
    });

    if (duplicatedRecord) {
      setStatus({
        type: 'error',
        message: 'El código o nombre ya existen.',
      });
      setIsSubmitting(false);
      return;
    }

    setStatus({
      type: 'success',
      message: 'Producto creado correctamente.',
    });

    resetForm();
    setIsSubmitting(false);
  };

  return (
    <form className="tp-form" onSubmit={handleSubmit} noValidate>
      <div className="tp-form-grid">
        <div className="tp-form-column">
          <InputField
            label="Código"
            name="code"
            value={formValues.code}
            onChange={handleFieldChange}
            placeholder="Ej: 001"
            required
            error={errors.code}
            helperText="Identificador único del producto."
            maxLength={8}
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
            placeholder="Ej: Pan Francés"
            required
            error={errors.name}
            maxLength={64}
          />

          <InputField
            label="Precio"
            name="price"
            type="number"
            value={formValues.price}
            onChange={handleFieldChange}
            placeholder="Ej: 3500"
            required
            error={errors.price}
            min="0.01"
            step="0.01"
          />

          <InputField
            label="Descripción"
            name="description"
            value={formValues.description}
            onChange={handleFieldChange}
            placeholder="Describe brevemente el producto"
            error={errors.description}
            as="textarea"
            maxLength={250}
            showCounter
          />
        </div>

        <div className="tp-form-column tp-form-column-right">
          <ImageUpload value={formValues.image} onChange={handleImageChange} error={errors.image} />
          <SwitchActivo checked={formValues.active} onChange={handleActiveChange} />
        </div>
      </div>

      <div className="tp-alert-area">
        {status ? (
          <div
            className={clsx('tp-alert', {
              'tp-alert-success': status.type === 'success',
              'tp-alert-error': status.type === 'error',
            })}
            role="alert"
          >
            {status.message}
          </div>
        ) : (
          <div className="tp-alert-placeholder" />
        )}
      </div>

      <div className="tp-form-actions">
        <button
          type="button"
          className="tp-button-secondary"
          onClick={() => navigate('/productos')}
          disabled={isSubmitting}
        >
          Cancelar
        </button>
        <button type="submit" className="tp-button-primary" disabled={isSubmitting}>
          {isSubmitting ? 'Guardando...' : 'Guardar'}
        </button>
      </div>
    </form>
  );
}

export default FormAltaProducto;







