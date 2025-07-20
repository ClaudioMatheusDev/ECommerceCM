import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { findProductById, deleteProductById } from '../services/ProductService';
import '../styles/DeleteProduct.css';

function DeleteProduct() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState({
    id: '',
    name: '',
    categoryName: '',
    description: '',
    imageURL: '',
    price: ''
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
          price: productData.price.toString()
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
    // Campos desabilitados, sem necessidade de edição
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    setLoading(true);
    
    try {
      await deleteProductById(id);
      setSuccess(true);
      
      // Redirecionar após 2 segundos
      setTimeout(() => {
        navigate('/produto');
      }, 2000);
      
    } catch (error) {
      setErrors({ general: error.message || 'Erro ao deletar produto' });
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/produto');
  };

  if (loadingProduct) {
    return (
      <div className="delete-product-container container">
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
      <div className="delete-product-container container">
        <div className="success-message">
          <i className="fas fa-check-circle"></i>
          <h2>Produto Deletado com sucesso!</h2>
          <p>Redirecionando para a lista de produtos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="delete-product-container container">
      <div className="delete-product-card">
        <div className="delete-product-header">
          <h1>Deletar Produto</h1>
          <hr />
        </div>

        <form onSubmit={handleSubmit} className="delete-product-form">
          {errors.general && (
            <div className="alert alert-danger" role="alert">
              <i className="fas fa-exclamation-triangle me-2"></i>
              {errors.general}
            </div>
          )}

          <input type="hidden" value={product.id} />

          <div className="row">
            <div className="col-2">
              <label className="control-label">Nome</label>
            </div>
            <div className="col-10">
              <input
                type="text"
                className="form-control"
                value={product.name}
                disabled
              />
            </div>
          </div>

          <div className="row">
            <div className="col-2">
              <label className="control-label">Categoria</label>
            </div>
            <div className="col-10">
              <input
                type="text"
                className="form-control"
                value={product.categoryName}
                disabled
              />
            </div>
          </div>

          <div className="row">
            <div className="col-2">
              <label className="control-label">Descrição</label>
            </div>
            <div className="col-10">
              <textarea
                className="form-control"
                rows="5"
                value={product.description}
                disabled
              ></textarea>
            </div>
          </div>

          <div className="row">
            <div className="col-2">
              <label className="control-label">URL da Imagem</label>
            </div>
            <div className="col-10">
              <input
                type="text"
                className="form-control"
                value={product.imageURL}
                disabled
              />
            </div>
          </div>

          <div className="row">
            <div className="col-2">
              <label className="control-label">Preço (R$)</label>
            </div>
            <div className="col-10">
              <input
                type="text"
                className="form-control"
                value={`R$ ${parseFloat(product.price || 0).toFixed(2)}`}
                disabled
              />
            </div>
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleBack}
              disabled={loading}
            >
              <i className="fas fa-arrow-left me-2"></i>
              Voltar à Lista
            </button>
            
            <button
              type="submit"
              className="btn btn-danger"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                  Deletando...
                </>
              ) : (
                <>
                  <i className="fas fa-trash me-2"></i>
                  Deletar
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default DeleteProduct;
