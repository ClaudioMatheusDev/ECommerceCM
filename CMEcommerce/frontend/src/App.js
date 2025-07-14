import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import Produtos from './pages/Produto';

function App() {
  return (
    <Router>
      <nav style={{ padding: '1rem', background: '#eee' }}>
        <Link to="/" style={{ marginRight: '1rem' }}>Home</Link>
        <Link to="/produto">Produtos</Link>
      </nav>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/produto" element={<Produtos />} />
      </Routes>
    </Router>
  );
}

export default App;
