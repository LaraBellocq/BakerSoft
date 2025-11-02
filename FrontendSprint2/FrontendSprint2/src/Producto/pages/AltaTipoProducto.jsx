import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createTipoProducto } from '../../services/tipoProductoService';
import '../styles/AltaTipoProducto.css';

function AltaTipoProducto() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: ''
  });
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    
    try {
      await createTipoProducto(formData);
      setShowSuccess(true);
      setTimeout(() => {
        navigate('/productos/tipos');
      }, 2000);
    } catch (err) {
      setError(err.message || 'Error al crear el tipo de producto');
      console.error('Error:', err);
    }
  };

  const handleCancel = () => {
    navigate('/productos/tipos');
  };

  return (
    <div className="tp-main">
      <header className="tp-main-header">
        <h1 className="tp-page-title">Nuevo tipo de producto</h1>
      </header>

      <section className="tp-card">
        <form onSubmit={handleSubmit} className="tp-form">
          {error && (
            <div className="tp-error-message">
              {error}
            </div>
          )}
          
          <div className="tp-form-group">
            <label htmlFor="nombre" className="tp-label">Nombre</label>
            <input
              type="text"
              id="nombre"
              name="nombre"
              className="tp-input"
              value={formData.nombre}
              onChange={handleChange}
              required
            />
          </div>

          <div className="tp-form-group">
            <label htmlFor="descripcion" className="tp-label">Descripción</label>
            <textarea
              id="descripcion"
              name="descripcion"
              className="tp-textarea"
              value={formData.descripcion}
              onChange={handleChange}
              maxLength={250}
            />
            <div className="tp-char-counter">
              {formData.descripcion.length}/250
            </div>
          </div>

          <div className="tp-button-group">
            <button
              type="button"
              className="tp-button-secondary"
              onClick={handleCancel}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="tp-button-primary"
            >
              Guardar
            </button>
          </div>
        </form>

        {showSuccess && (
          <div className="tp-success-message">
            <span className="tp-success-icon">✓</span>
            Tipo de producto creado correctamente
          </div>
        )}
      </section>
    </div>
  );
}

export default AltaTipoProducto;