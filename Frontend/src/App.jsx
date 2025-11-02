import { Navigate, Route, Routes } from 'react-router-dom';
import Login from './features/auth/Login.jsx';
<<<<<<< HEAD
import Register from './features/auth/Register.jsx';
import ForgotPassword from './features/auth/ForgotPassword.jsx';
import ResetPassword from './features/auth/ResetPassword.jsx';
=======
import { Dashboard } from './Dashboard';
>>>>>>> parent of b12540d (Actualizacion rutas-import)

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
<<<<<<< HEAD
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />
      <Route path="/dashboard" element={<Navigate to="/" replace />} />
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
=======
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/" element={<Navigate to="/login" replace />} />
>>>>>>> parent of b12540d (Actualizacion rutas-import)
    </Routes>
  );
}
