import FormAltaTipoProducto from '../components/FormAltaTipoProducto.jsx';
import '../styles/AltaTipoProducto.css';

function AltaTipoProducto() {
  return (
    <div className="tp-main">
      <header className="tp-main-header">
        <div>
          <h1 className="tp-page-title">Nuevo tipo de producto</h1>
        </div>
        <div className="tp-user-badge" title="Perfil">
          <span>AP</span>
        </div>
      </header>

      <section className="tp-card">
        <FormAltaTipoProducto />
      </section>
    </div>
  );
}

export default AltaTipoProducto;
