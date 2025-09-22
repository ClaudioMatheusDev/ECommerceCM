import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { findProductById, updateProduct } from '../services/ProductService';
import '../styles/UpdateProduct.css';

function UpdateProduct() {
  const { id } = useParams();
  const [product, setProduct] = useState({
    id: '',
    name: '',
    categoryName: '',
    description: '',
    imageURL: '',
    price: '',
    stock: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [loadingProduct, setLoadingProduct] = useState(true);
  const [success, setSuccess] = useState(false);

  // Carregar dados do produto ao montar o componente
  useEffect(() => {
    const loadProduct = async () => {
      try {
        setLoadingProduct(true);
        const productData = await findProductById(id);
        setProduct({
          id: productData.id,
          name: productData.name,
          categoryName: productData.categoryName,
          description: productData.description,
          imageURL: productData.imageURL,
          price: productData.price.toString(),
          stock: productData.stock.toString()
        });
      } catch (error) {
        setErrors({ general: error.message || 'Erro ao carregar produto' });
      } finally {
        setLoadingProduct(false);
      }
    };

    if (id) {
      loadProduct();
    }
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProduct(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Limpar erro do campo quando usuário começar a digitar
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

    if (!product.stock || isNaN(product.stock) || parseInt(product.stock) < 0) {
      newErrors.stock = 'Estoque deve ser um número inteiro igual ou maior que zero';
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
        id: parseInt(product.id),
        name: product.name,
        categoryName: product.categoryName,
        description: product.description,
        imageURL: product.imageURL,
        price: parseFloat(product.price),
        stock: parseInt(product.stock)
      };
      
      await updateProduct(productData);
      setSuccess(true);
      
      // Redirecionar após 2 segundos
      setTimeout(() => {
        window.location.href = '/produto';
      }, 2000);
      
    } catch (error) {
      setErrors({ general: error.message || 'Erro ao atualizar produto' });
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    window.location.href = '/produto';
  };

  if (loadingProduct) {
    return (
      <div className="update-product-container container">
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
            <span className="visually-hidden">Carregando produto...</span>
          </div>
          <p className="mt-3 text-muted">Carregando dados do produto...</p>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="update-product-container container">
        <div className="success-message">
          <i className="fas fa-check-circle"></i>
          <h2>Produto atualizado com sucesso!</h2>
          <p>Redirecionando para a lista de produtos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="update-product-container container">
      <div className="update-product-card">
        <div className="update-product-header">
          <h1 className="update-product-title">
            <i className="fas fa-edit me-3"></i>
            Atualizar Produto
          </h1>
          <p className="update-product-subtitle">Edite as informações do produto</p>
        </div>

        <form onSubmit={handleSubmit} className="update-product-form">
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

          <div className="row">
            <div className="col-md-6">
              <div className="form-group">
                <label htmlFor="stock" className="form-label">
                  <i className="fas fa-dollar-sign me-2"></i>
                  Estoque (Quantidade) *
                </label>
                <input
                  type="integer"
                  id="stock"
                  name="stock"
                  className={`form-control ${errors.stock ? 'is-invalid' : ''}`}
                  value={product.stock}
                  onChange={handleChange}
                  placeholder="0"
                  step="0.01"
                  min="0"
                />
                {errors.stock && <div className="invalid-feedback">{errors.stock}</div>}
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
              className="btn-update"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                  Atualizando...
                </>
              ) : (
                <>
                  <i className="fas fa-save me-2"></i>
                  Atualizar Produto
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default UpdateProduct;
