import React, { useEffect, useState } from 'react';
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
    <div className="produtos-container container p-4">
        <div className="row pb-2 align-items-center">
          <div className="col">
            <h1 className="produtos-title">Produtos</h1>
          </div>
          <div className="col text-end pt-1">
            <a href="/product-create" className="btn btn-outline-primary" title="Criar novo produto">
              <i className="fas fa-plus"></i> Create New Product
            </a>
          </div>
        </div>
        {loading && (
          <div className="text-center my-4">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Carregando...</span>
            </div>
          </div>
        )}
        {erro && <p className="text-danger text-center">{erro}</p>}
        <div className="table-responsive mt-4">
          <table className="table table-striped table-hover align-middle border rounded shadow-sm bg-white">
            <thead className="table-light">
              <tr>
                <th>Nome</th>
                <th>Categoria</th>
                <th>Preço</th>
                <th className="text-center">Ações</th>
              </tr>
            </thead>
            <tbody>
              {produtos.length === 0 && !loading && (
                <tr>
                  <td colSpan={4} className="text-center produtos-empty">Nenhum produto cadastrado.</td>
                </tr>
              )}
              {produtos.map(item => (
                <tr key={item.id} style={{ verticalAlign: 'middle', borderBottom: '12px solid #f3f3f3', background: '#fff' }}>
                  <td style={{ padding: '18px 12px' }}>{item.name}</td>
                  <td style={{ padding: '18px 12px' }}>{item.categoryName}</td>
                  <td style={{ padding: '18px 12px' }}>{item.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                  <td className="text-center" style={{ padding: '18px 12px' }}>
                    <a href={`/product-update/${item.id}`} className="btn btn-sm btn-outline-primary me-3" style={{ minWidth: 70 }} title="Editar">
                      Editar
                    </a>
                    <a href={`/product-delete/${item.id}`} className="btn btn-sm btn-outline-danger" style={{ minWidth: 70 }} title="Excluir">
                      Excluir
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
    </div>
  );
}

export default Produtos;