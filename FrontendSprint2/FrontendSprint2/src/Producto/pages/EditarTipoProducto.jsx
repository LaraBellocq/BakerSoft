import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getTipoProductoById, updateTipoProducto } from '../../services/tipoProductoService';
import '../styles/AltaTipoProducto.css';

function EditarTipoProducto() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    activo: true,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function fetchTipoProducto() {
      try {
        setIsLoading(true);
        setError(null);
        const data = await getTipoProductoById(id);
        if (cancelled) {
          return;
        }
        setFormData({
          nombre: data?.nombre ?? '',
          descripcion: data?.descripcion ?? '',
          activo: (data?.estado ?? '').toLowerCase() === 'activo',
        });
      } catch (fetchError) {
        if (!cancelled) {
          setError(fetchError?.message ?? 'Error al cargar el tipo de producto.');
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    fetchTipoProducto();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    try {
      await updateTipoProducto(id, {
        nombre: formData.nombre.trim(),
        descripcion: formData.descripcion.trim(),
        estado: formData.activo ? 'Activo' : 'Inactivo',
      });
      setShowSuccess(true);
      window.setTimeout(() => {
        navigate('/productos/tipos', { state: { refreshTipos: true } });
      }, 2000);
    } catch (submitError) {
      setError(submitError?.message ?? 'Error al actualizar el tipo de producto.');
    }
  };

  const handleCancel = () => {
    navigate('/productos/tipos');
  };

  return (
    <div className="tp-main">
      <header className="tp-main-header">
        <h1 className="tp-page-title">Editar tipo de producto</h1>
      </header>

      <section className="tp-card">
        <form onSubmit={handleSubmit} className="tp-form">
          {error ? <div className="tp-error-message">{error}</div> : null}

          {isLoading ? (
            <div className="tp-loading">Cargando...</div>
          ) : (
            <>
              <div className="tp-form-group">
                <label htmlFor="nombre" className="tp-label">
                  Nombre
                </label>
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
                <label htmlFor="descripcion" className="tp-label">
                  Descripción
                </label>
                <textarea
                  id="descripcion"
                  name="descripcion"
                  className="tp-textarea"
                  value={formData.descripcion}
                  onChange={handleChange}
                  maxLength={250}
                />
                <div className="tp-char-counter">{formData.descripcion.length}/250</div>
              </div>

              <div className="tp-form-group tp-form-switch">
                <label htmlFor="activo" className="tp-label">
                  Estado
                </label>
                <label htmlFor="activo" className="tp-switch-label">
                  <input
                    id="activo"
                    name="activo"
                    type="checkbox"
                    checked={formData.activo}
                    onChange={handleChange}
                  />
                  <span>{formData.activo ? 'Activo' : 'Inactivo'}</span>
                </label>
              </div>

              <div className="tp-button-group">
                <button type="button" className="tp-button-secondary" onClick={handleCancel}>
                  Cancelar
                </button>
                <button type="submit" className="tp-button-primary">
                  Guardar
                </button>
              </div>
            </>
          )}
        </form>

        {showSuccess ? (
          <div className="tp-success-message">
            <span className="tp-success-icon">✓</span>
            Tipo de producto actualizado correctamente
          </div>
        ) : null}
      </section>
    </div>
  );
}

export default EditarTipoProducto;
