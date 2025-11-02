import { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import FormEditarTipoProducto from '../components/FormEditarTipoProducto.jsx';
import '../styles/EditarTipoProducto.css';
import '../../AltaProducto/styles/AltaTipoProducto.css';

const tiposProductoMock = [
  {
    code: '001',
    category: 'Panadería',
    name: 'Pan Francés',
    price: 3200,
    description: 'Pan clásico con corteza crocante y miga aireada.',
    active: true,
    image: null,
  },
  {
    code: '002',
    category: 'Panadería',
    name: 'Medialunas',
    price: 2800,
    description: 'Medialunas de manteca recién horneadas.',
    active: true,
    image: null,
  },
  {
    code: '005',
    category: 'Panadería',
    name: 'Scones integrales',
    price: 2100,
    description: 'Scones elaborados con harina integral y semillas.',
    active: false,
    image: null,
  },
];

function EditarTipoProducto() {
  const { codigo } = useParams();

  const product = useMemo(
    () => tiposProductoMock.find((item) => item.code === codigo) ?? null,
    [codigo],
  );

  if (!product) {
    return (
      <div className="etp-main">
        <header className="etp-header">
          <h1 className="etp-title">Editar producto</h1>
        </header>
        <div className="etp-card">
          <p>No encontramos el producto solicitado.</p>
          <Link className="etp-btn etp-btn-primary" to="/productos/tipos">
            Volver al listado
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="etp-main">
      <header className="etp-header">
        <div>
          <h1 className="etp-title">Editar producto</h1>
        </div>
        <div className="etp-user-badge" aria-hidden="true">
          <span>AP</span>
        </div>
      </header>

      <section className="etp-card">
        <FormEditarTipoProducto product={product} />
      </section>
    </div>
  );
}

export default EditarTipoProducto;
