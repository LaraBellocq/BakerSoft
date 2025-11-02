import { useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import clsx from 'clsx';
import './AppLayout.css';

const homeLink = { label: 'Inicio', to: '/', exact: true, icon: '🏠' };
const mainLinks = [
  { label: 'Pedidos', to: '/pedidos', icon: '🧾' },
  { label: 'Clientes', to: '/clientes', icon: '👥' },
  { label: 'Finanzas', to: '/finanzas', icon: '💰' },
];
const footerItem = { label: 'Configuraciones', to: '/configuraciones', icon: '⚙️' };
const productsSubmenuItems = [
  { label: 'Productos', to: '/productos' },
  { label: 'Tipo de Producto', to: '/productos/tipos' },
  { label: 'Stock', to: '/productos/stock' },
];

const productsSubmenuId = 'sidebar-products-submenu';

function Sidebar() {
  const location = useLocation();
  const isProductsRoute = location.pathname.startsWith('/productos');
  const [isProductsOpen, setIsProductsOpen] = useState(isProductsRoute);

  useEffect(() => {
    setIsProductsOpen(isProductsRoute);
  }, [isProductsRoute]);

  const handlePrimaryClick = () => {
    if (!isProductsRoute) {
      setIsProductsOpen(false);
    }
  };

  const toggleProducts = () => {
    setIsProductsOpen((prev) => !prev);
  };

  return (
    <aside className="app-sidebar">
      <div className="app-brand">
        <span className="app-brand-title">Panadería</span>
        <span className="app-brand-subtitle">PELLEGRINI</span>
      </div>

      <nav className="app-menu" aria-label="Menú principal">
        <NavLink
          key="inicio"
          to={homeLink.to}
          end
          role="menuitem"
          className={({ isActive }) => clsx('app-menu-link', { active: isActive })}
          onClick={handlePrimaryClick}
        >
          <span className="app-menu-icon" aria-hidden="true">
            {homeLink.icon}
          </span>
          <span className="app-menu-label">{homeLink.label}</span>
        </NavLink>

        <div className={clsx('app-menu-group-container', { open: isProductsOpen })}>
          <button
            type="button"
            className="app-menu-link app-menu-group-toggle"
            onClick={toggleProducts}
            aria-expanded={isProductsOpen}
            aria-controls={productsSubmenuId}
            aria-haspopup="true"
            role="menuitem"
          >
            <span className="app-menu-icon" aria-hidden="true">
              🍞
            </span>
            <span className="app-menu-label">Productos</span>
          </button>

          <div
            id={productsSubmenuId}
            className={clsx('app-submenu', { open: isProductsOpen })}
            role="group"
            aria-label="Submenú Productos"
          >
            {productsSubmenuItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                role="menuitem"
                className={({ isActive }) => clsx('app-submenu-link', { active: isActive })}
              >
                {item.label}
              </NavLink>
            ))}
          </div>
        </div>

        {mainLinks.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.exact}
            role="menuitem"
            className={({ isActive }) => clsx('app-menu-link', { active: isActive })}
            onClick={handlePrimaryClick}
          >
            <span className="app-menu-icon" aria-hidden="true">
              {item.icon}
            </span>
            <span className="app-menu-label">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="app-menu-footer">
        <NavLink
          to={footerItem.to}
          role="menuitem"
          className={({ isActive }) => clsx('app-menu-link', { active: isActive })}
          onClick={handlePrimaryClick}
        >
          <span className="app-menu-icon" aria-hidden="true">
            {footerItem.icon}
          </span>
          <span className="app-menu-label">{footerItem.label}</span>
        </NavLink>
      </div>
    </aside>
  );
}

export default Sidebar;



