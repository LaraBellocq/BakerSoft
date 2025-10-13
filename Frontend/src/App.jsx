import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './features/auth/Login.jsx';
import Register from './features/auth/Register.jsx';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      {/* Placeholder de dashboard hasta que exista */}
      <Route path="/dashboard" element={<Navigate to="/" replace />} />
      {/* Fallbacks */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
