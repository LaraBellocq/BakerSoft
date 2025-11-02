import FormAltaProducto from '../components/FormAltaProducto.jsx';
import '../styles.css';

function AltaProducto() {
  return (
    <div className="tp-main">
      <header className="tp-main-header">
        <div>
          <h1 className="tp-page-title">Nuevo producto</h1>
        </div>
        <div className="tp-user-badge" title="Perfil">
          <span>AP</span>
        </div>
      </header>

      <section className="tp-card">
        <FormAltaProducto />
      </section>
    </div>
  );
}

export default AltaProducto;
