import { Navigate, Route, Routes } from 'react-router-dom';
import Login from './features/auth/Login.jsx';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/dashboard"
        element={
          // TODO: Reemplazar este Navigate cuando exista el dashboard real.
          <Navigate to="/" replace />
        }
      />
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;
