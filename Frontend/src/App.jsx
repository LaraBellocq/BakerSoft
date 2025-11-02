import { Navigate, Route, Routes } from 'react-router-dom';
import Login from './features/auth/Login.jsx';
import { Dashboard } from './Dashboard';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;
