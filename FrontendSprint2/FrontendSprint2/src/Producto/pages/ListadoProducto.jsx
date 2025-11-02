import { useMemo, useState } from 'react';
import BuscadorProducto from '../components/BuscadorProducto.jsx';
import BotonNuevoProducto from '../components/BotonNuevoProducto.jsx';
import TablaProductos from '../components/TablaProductos.jsx';
import FiltroProducto from '../components/FiltroProducto.jsx';
import MensajeResultados from '../components/MensajeResultados.jsx';
import MensajeSinResultados from '../components/MensajeSinResultados.jsx';
import '../ConsultaProducto.css';
import '../ListadoProducto.css';

const productosMock = [
  { codigo: '001', nombre: 'Pan Francés', categoria: 'Panadería', estado: 'Activo' },
  { codigo: '002', nombre: 'Medialunas', categoria: 'Panadería', estado: 'Activo' },
  { codigo: '003', nombre: 'Chips de chocolate', categoria: 'Pastelería', estado: 'Activo' },
  { codigo: '004', nombre: 'Tarta frutal', categoria: 'Pastelería', estado: 'Activo' },
  { codigo: '005', nombre: 'Scones integrales', categoria: 'Panadería', estado: 'Inactivo' },
  { codigo: '006', nombre: 'Budín de limón', categoria: 'Pastelería', estado: 'Activo' },
  { codigo: '007', nombre: 'Focaccia mediterránea', categoria: 'Panadería', estado: 'Activo' },
  { codigo: '008', nombre: 'Brownies', categoria: 'Pastelería', estado: 'Activo' },
];

function ListadoProducto() {
  const [searchTerm, setSearchTerm] = useState('');
  const [estadoFiltros, setEstadoFiltros] = useState([]);
  const [categoriaFiltros, setCategoriaFiltros] = useState([]);

  const productosFiltrados = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return productosMock.filter((producto) => {
      const matchesSearch =
        term.length === 0 ||
        producto.nombre.toLowerCase().includes(term) ||
        producto.codigo.toLowerCase().includes(term) ||
        producto.categoria.toLowerCase().includes(term);

      const matchesEstado = estadoFiltros.length === 0 || estadoFiltros.includes(producto.estado);
      const matchesCategoria = categoriaFiltros.length === 0 || categoriaFiltros.includes(producto.categoria);

      return matchesSearch && matchesEstado && matchesCategoria;
    });
  }, [searchTerm, estadoFiltros, categoriaFiltros]);

  const manejarEdicion = (producto) => {
    console.info('Editar producto:', producto);
  };

  const manejarEliminacion = (producto) => {
    console.info('Eliminar producto:', producto);
  };

  return (
    <div className="ltp-main">
      <header className="ltp-main-header">
        <div>
          <h1 className="ltp-page-title">Lista de productos</h1>
        </div>
        <div className="ltp-user-badge">AP</div>
      </header>

      <section className="ltp-card">
        <div className="ltp-toolbar">
          <div className="ctp-search-wrapper">
            <BuscadorProducto value={searchTerm} onChange={setSearchTerm}>
              <FiltroProducto
                selectedEstados={estadoFiltros}
                selectedCategorias={categoriaFiltros}
                onChange={(nextEstados, nextCategorias) => {
                  setEstadoFiltros(nextEstados);
                  setCategoriaFiltros(nextCategorias);
                }}
              />
            </BuscadorProducto>
          </div>
          <BotonNuevoProducto />
        </div>

        {productosFiltrados.length > 0 ? (
          <>
            <MensajeResultados
              term={searchTerm}
              estados={estadoFiltros}
              categorias={categoriaFiltros}
              total={productosFiltrados.length}
            />
            <TablaProductos productos={productosFiltrados} onEdit={manejarEdicion} onDelete={manejarEliminacion} />
          </>
        ) : (
          <>
            <MensajeResultados
              term={searchTerm}
              estados={estadoFiltros}
              categorias={categoriaFiltros}
              total={0}
            />
            <MensajeSinResultados
              onReset={() => {
                setSearchTerm('');
                setEstadoFiltros([]);
                setCategoriaFiltros([]);
              }}
            />
          </>
        )}
      </section>
    </div>
  );
}

export default ListadoProducto;

