import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Callback from './components/Callback';
import UserDebug from './components/UserDebug';
import Home from './pages/Home';
import Produtos from './pages/Produto';
import Loja from './pages/Loja';
import Carrinho from './pages/Carrinho';
import ProdutoDetalhes from './pages/ProdutoDetalhes';
import AdminDashboard from './pages/AdminDashboard';
import CreateProduct from './pages/CreateProduct';
import UpdateProduct from './pages/UpdateProduct';
import DeleteProduct from './pages/DeleteProduct';
import Login from './pages/Login';
import Profile from './pages/Profile';
import AdminProductForm from './pages/AdminProductForm';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <div className="App">
            {/* Modern Navigation */}
            <nav className="modern-navbar">
              <div className="nav-container">
                <Link to="/" className="nav-logo">
                  🛍️ CMEcommerce
                </Link>
                <div className="nav-links">
                  <Link to="/" className="nav-link">Início</Link>
                  <Link to="/loja" className="nav-link">Loja</Link>
                  <Link to="/login" className="nav-link">Login</Link>
                  <Link to="/profile" className="nav-link">Perfil</Link>
                  <Link to="/admin" className="nav-link admin-link">Admin</Link>
                  <Link to="/carrinho" className="nav-link cart-link">
                    🛒 Carrinho
                  </Link>
                </div>
              </div>
            </nav>

            {/* Main Content */}
            <main className="main-content">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/produto" element={<Produtos />} />
                <Route path="/produtos" element={<Produtos />} />
                <Route path="/loja" element={<Loja />} />
                <Route path="/carrinho" element={<Carrinho />} />
                <Route path="/produto/:id" element={<ProdutoDetalhes />} />
                <Route path="/login" element={<Login />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/callback" element={<Callback />} />
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/debug" element={<UserDebug />} />
                
                {/* Rotas protegidas apenas para Admin */}
                <Route path="/admin/produtos/criar" element={
                  <ProtectedRoute requiredRole="Admin">
                    <AdminProductForm />
                  </ProtectedRoute>
                } />
                
                {/* Rotas antigas mantidas para compatibilidade - também protegidas */}
                <Route path="/product-create" element={
                  <ProtectedRoute requiredRole="Admin">
                    <CreateProduct />
                  </ProtectedRoute>
                } />
                <Route path="/product-update/:id" element={
                  <ProtectedRoute requiredRole="Admin">
                    <UpdateProduct />
                  </ProtectedRoute>
                } />
                <Route path="/product-delete/:id" element={
                  <ProtectedRoute requiredRole="Admin">
                    <DeleteProduct />
                  </ProtectedRoute>
                } />
              </Routes>
            </main>

            {/* Footer */}
            <footer className="modern-footer">
              <div className="footer-container">
                <div className="footer-content">
                  <div className="footer-section">
                    <h4>🛍️ CMEcommerce</h4>
                    <p>Sua loja online de confiança</p>
                  </div>
                  <div className="footer-section">
                    <h4>Links Rápidos</h4>
                    <Link to="/">Início</Link>
                    <Link to="/loja">Loja</Link>
                    <Link to="/profile">Perfil</Link>
                    <Link to="/admin">Admin</Link>
                  </div>
                  <div className="footer-section">
                    <h4>Contato</h4>
                    <p>claudiomatheus055@gmail.com</p>
                    <p>(18) 9999-9999</p>
                  </div>
                </div>
                <div className="footer-bottom">
                  <p>&copy; 2025 CMEcommerce. Todos os direitos reservados.</p>
                </div>
              </div>
            </footer>
          </div>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;