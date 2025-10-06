import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginForm from './components/LoginForm';
import AdminPage from './pages/AdminPage';
import DirectorPage from './pages/DirectorPage';
import ProfesorPage from './pages/ProfesorPage';
import EstudiantePage from './pages/EstudiantePage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginForm />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/director" element={<DirectorPage />} />
        <Route path="/profesor" element={<ProfesorPage />} />
        <Route path="/estudiante" element={<EstudiantePage />} />
      </Routes>
    </Router>
  );
}

export default App;
