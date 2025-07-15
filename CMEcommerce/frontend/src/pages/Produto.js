import React, { useEffect, useState } from 'react';
import { findAllProduct } from '../services/ProductService';

function Produtos() {
  const [produtos, setProdutos] = useState([]);
  const [erro, setErro] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    findAllProduct()
      .then(data => setProdutos(data))
      .catch(error => setErro(error.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Carregando...</p>;
  if (erro) return <p style={{ color: 'red' }}>Erro: {erro}</p>;

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Produtos da API</h1>
      <ul>
        {produtos.map(prod => (
          <li key={prod.id}>
            <strong>{prod.name}</strong> - R$ {prod.price.toFixed(2)}
            <br />
            <img src={prod.imageURL} alt={prod.name} width={150} />
            <p>{prod.description}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Produtos;