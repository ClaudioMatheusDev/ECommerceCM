import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { findAllProduct } from '../services/ProductService';
import '../styles/Produtos.css';

function Produtos() {
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');

  useEffect(() => {
    findAllProduct()
      .then(data => setProdutos(data))
      .catch(e => setErro(e.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="produtos-container container-fluid">
      <div className="container">
        <div className="produtos-header">
          <div className="row align-items-center">
            <div className="col-md-6">
              <h1 className="produtos-title">Lista de Produtos</h1>
              <p className="text-white-50 mb-0">Gerencie seu catálogo de produtos</p>
            </div>
            <div className="col-md-6 text-end">
              <a href="/product-create" className="produtos-create-btn me-2" title="Criar novo produto">
                <i className="fas fa-plus me-2"></i>
                Novo Produto
              </a>
              <Link to="/ProdutoForm" className="btn btn-outline-light" title="Formulário alternativo">
                <i className="fas fa-plus"></i> Produto Form
              </Link>
            </div>
          </div>
        </div>

        {loading && (
          <div className="produtos-loading text-center">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Carregando produtos...</span>
            </div>
            <p className="mt-3 text-muted">Carregando produtos...</p>
          </div>
        )}

        {erro && (
          <div className="alert alert-danger" role="alert">
            <i className="fas fa-exclamation-triangle me-2"></i>
            {erro}
          </div>
        )}

        {!loading && !erro && (
          <div className="produtos-table-container">
            <table className="produtos-table table table-hover">
              <thead>
                <tr>
                  <th>Nome do Produto</th>
                  <th>Categoria</th>
                  <th>Preço</th>
                  <th className="text-center">Ações</th>
                </tr>
              </thead>
              <tbody>
                {produtos.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="produtos-empty">
                      <i className="fas fa-box-open fs-1 text-muted mb-3 d-block"></i>
                      Nenhum produto cadastrado ainda.
                      <br />
                      <small className="text-muted">Comece adicionando seu primeiro produto!</small>
                    </td>
                  </tr>
                ) : (
                  produtos.map(item => (
                    <tr key={item.id} className="produtos-table-row">
                      <td>
                        <div className="produtos-name">{item.name}</div>
                      </td>
                      <td>
                        <span className="produtos-category">{item.categoryName}</span>
                      </td>
                      <td>
                        <div className="produtos-price">
                          {item.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </div>
                      </td>
                      <td>
                        <div className="produtos-actions">
                          <a href={`/product-update/${item.id}`} className="produtos-btn produtos-btn-edit" title="Editar produto">
                            <i className="fas fa-edit me-1"></i>
                            Editar
                          </a>
                          <a href={`/product-delete/${item.id}`} className="produtos-btn produtos-btn-delete" title="Excluir produto">
                            <i className="fas fa-trash me-1"></i>
                            Excluir
                          </a>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default Produtos;