import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/TipoProducto.css';
import { getTiposProducto, deleteTipoProducto } from '../../services/tipoProductoService';

function TipoProducto() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [tiposProducto, setTiposProducto] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchTiposProducto() {
      try {
        setIsLoading(true);
        setError(null);
        const data = await getTiposProducto({ search: searchTerm });

        if (cancelled) {
          return;
        }

        const resultados = Array.isArray(data?.results) ? data.results : data ?? [];
        setTiposProducto(resultados);
      } catch (err) {
        if (!cancelled) {
          setError('Error al cargar los tipos de producto');
          console.error(err);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    const timeoutId = window.setTimeout(fetchTiposProducto, 300);
    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, [searchTerm]);

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleDeleteClick = (tipo) => {
    setDeleteError(null);
    setDeleteTarget(tipo);
  };

  const handleCancelDelete = () => {
    if (isDeleting) {
      return;
    }

    setDeleteTarget(null);
    setDeleteError(null);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) {
      return;
    }

    try {
      setIsDeleting(true);
      setDeleteError(null);
      await deleteTipoProducto(deleteTarget.id);
      setTiposProducto((prevTipos) => prevTipos.filter((tipo) => tipo.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (err) {
      const message = err?.message || 'Error al eliminar el tipo de producto';
      setDeleteError(message);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="tp-main">
      {deleteTarget ? (
        <div className="tp-modal-backdrop" role="presentation">
          <div
            className="tp-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="tp-delete-modal-title"
            aria-describedby="tp-delete-modal-description"
          >
            <header className="tp-modal-header">
              <h2 id="tp-delete-modal-title">Eliminar tipo de producto</h2>
            </header>
            <p id="tp-delete-modal-description" className="tp-modal-description">
              {`Estas seguro de que quieres eliminar "${deleteTarget.nombre}"? Esta accion no se puede deshacer.`}
            </p>
            {deleteError ? <p className="tp-modal-error">{deleteError}</p> : null}
            <footer className="tp-modal-actions">
              <button
                type="button"
                className="tp-modal-button tp-modal-button-secondary"
                onClick={handleCancelDelete}
                disabled={isDeleting}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="tp-modal-button tp-modal-button-danger"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
              >
                {isDeleting ? 'Eliminando...' : 'Eliminar'}
              </button>
            </footer>
          </div>
        </div>
      ) : null}
      <header className="tp-main-header">
        <div>
          <h1 className="tp-page-title">Lista de tipos de producto</h1>
        </div>
        <div className="tp-user-badge" title="Perfil">
          <span>AP</span>
        </div>
      </header>

      <section className="tp-card">
        <div className="tp-toolbar">
          <div className="tp-search-wrapper">
            <div className="tp-search">
              <input
                type="text"
                className="tp-search-input"
                placeholder="Buscar..."
                value={searchTerm}
                onChange={handleSearch}
                aria-label="Buscar tipos"
              />
            </div>
          </div>

          <button
            className="tp-button-primary tp-new-btn"
            onClick={() => navigate('/productos/tipos/nuevo')}
          >
            <span className="tp-button-icon">+</span>
            Nuevo tipo de producto
          </button>
        </div>

        <div className="tp-table-container">
          <table className="tp-table">
            <thead>
              <tr>
                <th className="tp-th">ID</th>
                <th className="tp-th">Nombre</th>
                <th className="tp-th">Descripción</th>
                <th className="tp-th">Estado</th>
                <th className="tp-th tp-actions">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="tp-td-center">
                    Cargando...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={5} className="tp-td-center tp-error">
                    {error}
                  </td>
                </tr>
              ) : tiposProducto.length === 0 ? (
                <tr>
                  <td colSpan={5} className="tp-td-center">
                    No se encontraron tipos de producto
                  </td>
                </tr>
              ) : (
                tiposProducto.map((tipo) => (
                  <tr key={tipo.id} className="tp-tr">
                    <td className="tp-td tp-code">{tipo.id}</td>
                    <td className="tp-td">{tipo.nombre}</td>
                    <td className="tp-td">{tipo.descripcion}</td>
                    <td className="tp-td">{tipo.estado}</td>
                    <td className="tp-td tp-td-actions">
                      <button
                        className="tp-action-button"
                        onClick={() => navigate(`/productos/tipos/editar/${tipo.id}`)}
                        aria-label={`Editar ${tipo.nombre}`}
                      >
                        ✏️
                      </button>
                      <button
                        className="tp-action-button tp-action-delete"
                        onClick={() => handleDeleteClick(tipo)}
                        aria-label={`Eliminar ${tipo.nombre}`}
                        disabled={isDeleting && deleteTarget?.id === tipo.id}
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

export default TipoProducto;
