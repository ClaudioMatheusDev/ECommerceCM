import React, { useEffect, useState } from 'react';
import axios from 'axios';

function App() {
  const [produtos, setProdutos] = useState([]);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    axios.get(`${process.env.REACT_APP_API_URL}/product`)
      .then(response => setProdutos(response.data))
      .catch(error => setErro(error.message));
  }, []);

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Produtos da API</h1>
      {erro && <p style={{ color: 'red' }}>Erro: {erro}</p>}
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

export default App;
