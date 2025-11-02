import { BrowserRouter as Router, Navigate, Route, Routes } from 'react-router-dom';
import Dashboard from './Dashboard/pages/Dashboard.jsx';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
