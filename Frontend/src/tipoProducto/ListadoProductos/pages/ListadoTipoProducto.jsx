import { useMemo, useState } from 'react';
import BuscadorTipoProducto from '../components/BuscadorTipoProducto.jsx';
import BotonNuevoProducto from '../components/BotonNuevoProducto.jsx';
import TablaTiposProducto from '../components/TablaTiposProducto.jsx';
import { FiltroTipoProducto, MensajeResultados, MensajeSinResultados } from '../../HU04-ConsultaTipoProducto/index.js';
import '../../HU04-ConsultaTipoProducto/styles/ConsultaTipoProducto.css';
import '../styles/ListadoTipoProducto.css';

const tiposProductoMock = [
  { codigo: '001', nombre: 'Pan Francés', categoria: 'Panadería', estado: 'Activo' },
  { codigo: '002', nombre: 'Medialunas', categoria: 'Panadería', estado: 'Activo' },
  { codigo: '003', nombre: 'Chips de chocolate', categoria: 'Pastelería', estado: 'Activo' },
  { codigo: '004', nombre: 'Tarta frutal', categoria: 'Pastelería', estado: 'Activo' },
  { codigo: '005', nombre: 'Scones integrales', categoria: 'Panadería', estado: 'Inactivo' },
  { codigo: '006', nombre: 'Budín de limón', categoria: 'Pastelería', estado: 'Activo' },
  { codigo: '007', nombre: 'Focaccia mediterránea', categoria: 'Panadería', estado: 'Activo' },
  { codigo: '008', nombre: 'Brownies', categoria: 'Pastelería', estado: 'Activo' },
];

function ListadoTipoProducto() {
  const [searchTerm, setSearchTerm] = useState('');
  const [estadoFiltros, setEstadoFiltros] = useState([]);
  const [categoriaFiltros, setCategoriaFiltros] = useState([]);

  const tiposFiltrados = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return tiposProductoMock.filter((tipo) => {
      const matchesSearch =
        term.length === 0 ||
        tipo.nombre.toLowerCase().includes(term) ||
        tipo.codigo.toLowerCase().includes(term) ||
        tipo.categoria.toLowerCase().includes(term);

      const matchesEstado = estadoFiltros.length === 0 || estadoFiltros.includes(tipo.estado);
      const matchesCategoria = categoriaFiltros.length === 0 || categoriaFiltros.includes(tipo.categoria);

      return matchesSearch && matchesEstado && matchesCategoria;
    });
  }, [searchTerm, estadoFiltros, categoriaFiltros]);

  const manejarEdicion = (tipo) => {
    console.info('Editar tipo:', tipo);
  };

  const manejarEliminacion = (tipo) => {
    console.info('Eliminar tipo:', tipo);
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
            <BuscadorTipoProducto value={searchTerm} onChange={setSearchTerm}>
              <FiltroTipoProducto
                selectedEstados={estadoFiltros}
                selectedCategorias={categoriaFiltros}
                onChange={(nextEstados, nextCategorias) => {
                  setEstadoFiltros(nextEstados);
                  setCategoriaFiltros(nextCategorias);
                }}
              />
            </BuscadorTipoProducto>
          </div>
          <BotonNuevoProducto />
        </div>

        {tiposFiltrados.length > 0 ? (
          <>
            <MensajeResultados
              term={searchTerm}
              estados={estadoFiltros}
              categorias={categoriaFiltros}
              total={tiposFiltrados.length}
            />
            <TablaTiposProducto tipos={tiposFiltrados} onEdit={manejarEdicion} onDelete={manejarEliminacion} />
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

export default ListadoTipoProducto;
