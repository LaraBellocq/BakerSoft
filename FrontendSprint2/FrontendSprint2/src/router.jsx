import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import AppLayout from './layout/AppLayout.jsx';
import Dashboard from './Dashboard/pages/Dashboard.jsx';
import { 
  ListadoProductoPage,
  AltaProductoPage,
  EditarProductoPage,
  TipoProductoPage,
  AltaTipoProductoPage,
  EditarTipoProductoPage
} from './Producto';
import Placeholder from './pages/Placeholder.jsx';

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AppLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="productos">
            <Route index element={<ListadoProductoPage />} />
            <Route path="nuevo" element={<AltaProductoPage />} />
            <Route path="editar/:codigo" element={<EditarProductoPage />} />
            <Route path="tipos" element={<TipoProductoPage />} />
            <Route path="tipos/nuevo" element={<AltaTipoProductoPage />} />
            <Route path="tipos/editar/:id" element={<EditarTipoProductoPage />} />
            <Route path="stock" element={<Placeholder title="Stock de productos" />} />
          </Route>
          <Route path="stock" element={<Navigate to="/productos/stock" replace />} />
          <Route path="pedidos" element={<Placeholder title="Pedidos" />} />
          <Route path="clientes" element={<Placeholder title="Clientes" />} />
          <Route path="finanzas" element={<Placeholder title="Finanzas" />} />
          <Route path="configuraciones" element={<Placeholder title="Configuraciones" />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter;
