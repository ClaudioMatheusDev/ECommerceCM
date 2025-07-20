import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import Produtos from './pages/Produto';
import CreateProduct from './pages/CreateProduct';
import UpdateProduct from './pages/UpdateProduct';
import DeleteProduct from './pages/DeleteProduct';

function App() {
  return (
    <Router>
      <nav style={{ padding: '1rem', background: '#eee' }}>
        <Link to="/" style={{ marginRight: '1rem' }}>Home</Link>
        <Link to="/produto" style={{ marginRight: '1rem' }}>Produtos</Link>
      </nav>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/produto" element={<Produtos />} />
        <Route path="/product-create" element={<CreateProduct />} />
        <Route path="/product-update/:id" element={<UpdateProduct />} />
        <Route path="/product-delete/:id" element={<DeleteProduct />} />
      </Routes>
    </Router>
  );
}

export default App;