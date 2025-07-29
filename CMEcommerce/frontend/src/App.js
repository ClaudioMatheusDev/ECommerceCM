import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Produtos from './pages/Produto';
import CreateProduct from './pages/CreateProduct';
import UpdateProduct from './pages/UpdateProduct';
import DeleteProduct from './pages/DeleteProduct';
import Login from './pages/Login';
import AdminProductForm from './pages/AdminProductForm';
import Callback from './components/Callback';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/produtos" element={<Produtos />} />
          <Route path="/produto" element={<Produtos />} />
          <Route path="/login" element={<Login />} />
          <Route path="/callback" element={<Callback />} />
          
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
      </Router>
    </AuthProvider>
  );
}

export default App;