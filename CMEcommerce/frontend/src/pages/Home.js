import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { findAllProduct } from '../services/ProductService';
import '../styles/Home.css';

function Home() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Buscar produtos em destaque
    findAllProduct()
      .then(data => {
        // Pegar apenas os primeiros 3 produtos para exibir na homepage
        setFeaturedProducts(data.slice(0, 3));
      })
      .catch(error => {
        console.error('Erro ao carregar produtos em destaque:', error);
      })
      .finally(() => setLoading(false));
  }, []);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  return (
    <div className="homepage">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="container">
          <h1 className="hero-title">🛍️ CMEcommerce</h1>
          <p className="hero-subtitle">
            Sua loja online completa com os melhores produtos e tecnologia
          </p>
          <div className="hero-buttons">
            <Link to="/loja" className="hero-button primary">
              🛍️ Explorar Loja
            </Link>
            <Link to="/admin" className="hero-button secondary">
              ⚙️ Painel Admin
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="features-container">
          <h2 className="section-title">Por que escolher a CMEcommerce?</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🚚</div>
              <h3 className="feature-title">Entrega Rápida</h3>
              <p className="feature-description">
                Receba seus produtos em casa com segurança e agilidade. 
                Entrega garantida em todo o Brasil.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🔒</div>
              <h3 className="feature-title">Compra Segura</h3>
              <p className="feature-description">
                Suas informações estão protegidas com nossa tecnologia 
                de segurança avançada e criptografia.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">💎</div>
              <h3 className="feature-title">Melhor Qualidade</h3>
              <p className="feature-description">
                Produtos selecionados com qualidade garantida e 
                as melhores marcas do mercado.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Products Preview Section */}
      <section className="products-preview-section">
        <div className="features-container">
          <h2 className="section-title">Produtos em Destaque</h2>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '50px' }}>
              <div style={{ fontSize: '1.2rem', color: '#666' }}>
                Carregando produtos...
              </div>
            </div>
          ) : (
            <div className="products-grid">
              {featuredProducts.length > 0 ? (
                featuredProducts.map((product) => (
                  <div key={product.id} className="product-preview-card">
                    <div className="product-image">
                      📱
                    </div>
                    <div className="product-info">
                      <h3 className="product-name">
                        {product.name.length > 50 
                          ? `${product.name.substring(0, 50)}...` 
                          : product.name}
                      </h3>
                      <div className="product-price">
                        {formatPrice(product.price)}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ 
                  gridColumn: '1 / -1', 
                  textAlign: 'center', 
                  padding: '50px',
                  color: '#666' 
                }}>
                  Nenhum produto encontrado. 
                  <Link to="/loja" style={{ color: '#667eea', textDecoration: 'none' }}>
                    Explorar nossa loja
                  </Link>
                </div>
              )}
            </div>
          )}
          {featuredProducts.length > 0 && (
            <div style={{ textAlign: 'center', marginTop: '40px' }}>
              <Link to="/loja" className="hero-button">
                🛍️ Ver Todos os Produtos
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="cta-section">
        <div className="features-container">
          <h2 className="cta-title">Pronto para começar?</h2>
          <p className="cta-description">
            Descubra nossa coleção completa e encontre exatamente o que você precisa
          </p>
          <Link to="/produto" className="cta-button">
            Começar a Comprar
          </Link>
        </div>
      </section>
    </div>
  );
}

export default Home;