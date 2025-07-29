// AdminProductForm.js - Componente protegido para administradores criarem/editarem produtos
import React, { useState } from 'react';
import { createProduct } from '../services/ProductService';
import { useAuth } from '../context/AuthContext';
import ProtectedRoute from '../components/ProtectedRoute';

function AdminProductForm() {
  const [product, setProduct] = useState({
    name: '',
    categoryName: '',
    description: '',
    imageURL: '',
    price: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { user } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProduct(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!product.name.trim()) {
      newErrors.name = 'Nome é obrigatório';
    }
    
    if (!product.categoryName.trim()) {
      newErrors.categoryName = 'Categoria é obrigatória';
    }
    
    if (!product.description.trim()) {
      newErrors.description = 'Descrição é obrigatória';
    }
    
    if (!product.imageURL.trim()) {
      newErrors.imageURL = 'URL da imagem é obrigatória';
    }
    
    if (!product.price || isNaN(product.price) || parseFloat(product.price) <= 0) {
      newErrors.price = 'Preço deve ser um número maior que zero';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    try {
      const productData = {
        ...product,
        price: parseFloat(product.price)
      };
      
      await createProduct(productData);
      setSuccess(true);
      setProduct({
        name: '',
        categoryName: '',
        description: '',
        imageURL: '',
        price: ''
      });
      
      setTimeout(() => setSuccess(false), 5000);
    } catch (error) {
      console.error('Erro ao criar produto:', error);
      setErrors({ submit: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute requiredRole="Admin">
      <div className="container mt-4">
        <div className="row justify-content-center">
          <div className="col-md-8">
            <div className="card">
              <div className="card-header">
                <h3 className="mb-0">
                  <i className="fas fa-plus-circle me-2"></i>
                  Criar Novo Produto
                </h3>
                <small className="text-muted">
                  Logado como: <strong>{user?.name || user?.email}</strong> (Admin)
                </small>
              </div>
              <div className="card-body">
                {success && (
                  <div className="alert alert-success" role="alert">
                    <i className="fas fa-check-circle me-2"></i>
                    Produto criado com sucesso!
                  </div>
                )}
                
                {errors.submit && (
                  <div className="alert alert-danger" role="alert">
                    <i className="fas fa-exclamation-triangle me-2"></i>
                    {errors.submit}
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label htmlFor="name" className="form-label">Nome do Produto *</label>
                    <input
                      type="text"
                      className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                      id="name"
                      name="name"
                      value={product.name}
                      onChange={handleChange}
                      placeholder="Digite o nome do produto"
                    />
                    {errors.name && <div className="invalid-feedback">{errors.name}</div>}
                  </div>

                  <div className="mb-3">
                    <label htmlFor="categoryName" className="form-label">Categoria *</label>
                    <input
                      type="text"
                      className={`form-control ${errors.categoryName ? 'is-invalid' : ''}`}
                      id="categoryName"
                      name="categoryName"
                      value={product.categoryName}
                      onChange={handleChange}
                      placeholder="Digite a categoria do produto"
                    />
                    {errors.categoryName && <div className="invalid-feedback">{errors.categoryName}</div>}
                  </div>

                  <div className="mb-3">
                    <label htmlFor="description" className="form-label">Descrição *</label>
                    <textarea
                      className={`form-control ${errors.description ? 'is-invalid' : ''}`}
                      id="description"
                      name="description"
                      rows="3"
                      value={product.description}
                      onChange={handleChange}
                      placeholder="Digite a descrição do produto"
                    ></textarea>
                    {errors.description && <div className="invalid-feedback">{errors.description}</div>}
                  </div>

                  <div className="mb-3">
                    <label htmlFor="imageURL" className="form-label">URL da Imagem *</label>
                    <input
                      type="url"
                      className={`form-control ${errors.imageURL ? 'is-invalid' : ''}`}
                      id="imageURL"
                      name="imageURL"
                      value={product.imageURL}
                      onChange={handleChange}
                      placeholder="https://exemplo.com/imagem.jpg"
                    />
                    {errors.imageURL && <div className="invalid-feedback">{errors.imageURL}</div>}
                  </div>

                  <div className="mb-3">
                    <label htmlFor="price" className="form-label">Preço *</label>
                    <div className="input-group">
                      <span className="input-group-text">R$</span>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        className={`form-control ${errors.price ? 'is-invalid' : ''}`}
                        id="price"
                        name="price"
                        value={product.price}
                        onChange={handleChange}
                        placeholder="0,00"
                      />
                      {errors.price && <div className="invalid-feedback">{errors.price}</div>}
                    </div>
                  </div>

                  <div className="d-grid gap-2 d-md-flex justify-content-md-end">
                    <button 
                      type="button" 
                      className="btn btn-secondary me-md-2"
                      onClick={() => window.history.back()}
                    >
                      <i className="fas fa-arrow-left me-2"></i>
                      Voltar
                    </button>
                    <button 
                      type="submit" 
                      className="btn btn-success"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                          Criando...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-save me-2"></i>
                          Criar Produto
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}

export default AdminProductForm;
