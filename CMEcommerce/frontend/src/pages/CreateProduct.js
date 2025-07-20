import React, { useState } from 'react';
import { createProduct } from '../services/ProductService';
import '../styles/CreateProduct.css';

function CreateProduct() {
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
      newErrors.name = 'Nome do produto é obrigatório';
    }

    if (!product.categoryName.trim()) {
      newErrors.categoryName = 'Categoria é obrigatória';
    }

    if (!product.description.trim()) {
      newErrors.description = 'Descrição é obrigatória';
    }

    if (!product.imageURL.trim()) {
      newErrors.imageURL = 'URL da imagem é obrigatória';
    } else if (!isValidURL(product.imageURL)) {
      newErrors.imageURL = 'URL da imagem inválida';
    }

    if (!product.price) {
      newErrors.price = 'Preço é obrigatório';
    } else if (isNaN(product.price) || parseFloat(product.price) <= 0) {
      newErrors.price = 'Preço deve ser um número válido maior que zero';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidURL = (string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
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
      
      // Redirecionar após 2 segundos
      setTimeout(() => {
        window.location.href = '/produto';
      }, 2000);
      
    } catch (error) {
      setErrors({ general: error.message || 'Erro ao criar produto' });
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    window.location.href = '/produto';
  };

  if (success) {
    return (
      <div className="create-product-container container">
        <div className="success-message">
          <i className="fas fa-check-circle"></i>
          <h2>Produto criado com sucesso!</h2>
          <p>Redirecionando para a lista de produtos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="create-product-container container">
      <div className="create-product-card">
        <div className="create-product-header">
          <h1 className="create-product-title">
            <i className="fas fa-plus-circle me-3"></i>
            Criar Novo Produto
          </h1>
          <p className="create-product-subtitle">Adicione um novo produto ao seu catálogo</p>
        </div>

        <form onSubmit={handleSubmit} className="create-product-form">
          {errors.general && (
            <div className="alert alert-danger" role="alert">
              <i className="fas fa-exclamation-triangle me-2"></i>
              {errors.general}
            </div>
          )}

          <div className="row">
            <div className="col-md-6">
              <div className="form-group">
                <label htmlFor="name" className="form-label">
                  <i className="fas fa-tag me-2"></i>
                  Nome do Produto *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                  value={product.name}
                  onChange={handleChange}
                  placeholder="Digite o nome do produto"
                />
                {errors.name && <div className="invalid-feedback">{errors.name}</div>}
              </div>
            </div>

            <div className="col-md-6">
              <div className="form-group">
                <label htmlFor="categoryName" className="form-label">
                  <i className="fas fa-list me-2"></i>
                  Categoria *
                </label>
                <input
                  type="text"
                  id="categoryName"
                  name="categoryName"
                  className={`form-control ${errors.categoryName ? 'is-invalid' : ''}`}
                  value={product.categoryName}
                  onChange={handleChange}
                  placeholder="Digite a categoria"
                />
                {errors.categoryName && <div className="invalid-feedback">{errors.categoryName}</div>}
              </div>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="description" className="form-label">
              <i className="fas fa-align-left me-2"></i>
              Descrição *
            </label>
            <textarea
              id="description"
              name="description"
              className={`form-control ${errors.description ? 'is-invalid' : ''}`}
              rows="4"
              value={product.description}
              onChange={handleChange}
              placeholder="Descreva o produto em detalhes"
            ></textarea>
            {errors.description && <div className="invalid-feedback">{errors.description}</div>}
          </div>

          <div className="form-group">
            <label htmlFor="imageURL" className="form-label">
              <i className="fas fa-image me-2"></i>
              URL da Imagem *
            </label>
            <input
              type="url"
              id="imageURL"
              name="imageURL"
              className={`form-control ${errors.imageURL ? 'is-invalid' : ''}`}
              value={product.imageURL}
              onChange={handleChange}
              placeholder="https://exemplo.com/imagem.jpg"
            />
            {errors.imageURL && <div className="invalid-feedback">{errors.imageURL}</div>}
            {product.imageURL && isValidURL(product.imageURL) && (
              <div className="image-preview mt-2">
                <img src={product.imageURL} alt="Preview" className="preview-img" />
              </div>
            )}
          </div>

          <div className="row">
            <div className="col-md-6">
              <div className="form-group">
                <label htmlFor="price" className="form-label">
                  <i className="fas fa-dollar-sign me-2"></i>
                  Preço (R$) *
                </label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  className={`form-control ${errors.price ? 'is-invalid' : ''}`}
                  value={product.price}
                  onChange={handleChange}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                />
                {errors.price && <div className="invalid-feedback">{errors.price}</div>}
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="btn-back"
              onClick={handleBack}
              disabled={loading}
            >
              <i className="fas fa-arrow-left me-2"></i>
              Voltar à Lista
            </button>
            
            <button
              type="submit"
              className="btn-create"
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
  );
}

export default CreateProduct;
