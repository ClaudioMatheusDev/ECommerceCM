import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Callback from './components/Callback';
import UserDebug from './components/UserDebug';
import AuthService from './services/AuthService';
import Home from './pages/Home';
import Produtos from './pages/Produto';
import Loja from './pages/Loja';
import Carrinho from './pages/Carrinho';
import Checkout from './pages/Checkout';
import Pedidos from './pages/Pedidos';
import ProdutoDetalhes from './pages/ProdutoDetalhes';
import AdminDashboard from './pages/AdminDashboard';
import CreateProduct from './pages/CreateProduct';
import UpdateProduct from './pages/UpdateProduct';
import DeleteProduct from './pages/DeleteProduct';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import './App.css';

function App() {
  const isAuthenticated = AuthService.isAuthenticated();
  const userInfo = AuthService.getUserInfo();

  const handleLogin = () => {
    AuthService.login();
  };

  const handleLogout = () => {
    AuthService.logout();
  };

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
                  
                  {!isAuthenticated ? (
                    <>
                      <button onClick={handleLogin} className="nav-link nav-btn">Login</button>
                      <Link to="/register" className="nav-link nav-btn">Registrar</Link>
                    </>
                  ) : (
                    <>
                      <span className="nav-user">Olá, {userInfo?.name || userInfo?.preferred_username || 'Usuário'}</span>
                      <Link to="/profile" className="nav-link">Perfil</Link>
                      <button onClick={handleLogout} className="nav-link nav-btn">Logout</button>
                    </>
                  )}
                  
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
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/pedidos" element={<Pedidos />} />
                <Route path="/produto/:id" element={<ProdutoDetalhes />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/callback" element={<Callback />} />
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/debug" element={<UserDebug />} />
                                
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