import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { checkout } from '../services/CartService';
import '../styles/Checkout.css';

const Checkout = () => {
  const navigate = useNavigate();
  const { items, getCartTotal, getCartSubtotal, discountAmount, couponCode, clearCart } = useCart();
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: user?.email || '',
    phone: '',
    cardNumber: '',
    cvv: '',
    expiryMonth: '',
    expiryYear: '',
    // Endereço
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'Brasil'
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!items || items.length === 0) {
      navigate('/loja');
    }

    if (user) {
      setFormData(prev => ({
        ...prev,
        firstName: user.given_name || '',
        lastName: user.family_name || '',
        email: user.email || ''
      }));
    }
  }, [items, navigate, user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
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

    if (!formData.firstName.trim()) newErrors.firstName = 'Nome é obrigatório';
    if (!formData.lastName.trim()) newErrors.lastName = 'Sobrenome é obrigatório';
    if (!formData.email.trim()) newErrors.email = 'Email é obrigatório';
    if (!formData.phone.trim()) newErrors.phone = 'Telefone é obrigatório';
    if (!formData.cardNumber.trim()) newErrors.cardNumber = 'Número do cartão é obrigatório';
    if (!formData.cvv.trim()) newErrors.cvv = 'CVV é obrigatório';
    if (!formData.expiryMonth.trim()) newErrors.expiryMonth = 'Mês de expiração é obrigatório';
    if (!formData.expiryYear.trim()) newErrors.expiryYear = 'Ano de expiração é obrigatório';
    if (!formData.street.trim()) newErrors.street = 'Endereço é obrigatório';
    if (!formData.city.trim()) newErrors.city = 'Cidade é obrigatória';
    if (!formData.state.trim()) newErrors.state = 'Estado é obrigatório';
    if (!formData.zipCode.trim()) newErrors.zipCode = 'CEP é obrigatório';


    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    if (formData.cardNumber && formData.cardNumber.replace(/\s/g, '').length < 16) {
      newErrors.cardNumber = 'Número do cartão deve ter 16 dígitos';
    }

    if (formData.cvv && (formData.cvv.length < 3 || formData.cvv.length > 4)) {
      newErrors.cvv = 'CVV deve ter 3 ou 4 dígitos';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const formatCardNumber = (value) => {
    // Remove espaços e mantém apenas números
    const numbers = value.replace(/\s/g, '');
    // Adiciona espaços a cada 4 dígitos
    return numbers.replace(/(.{4})/g, '$1 ').trim();
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    
    try {
      // Verificar se o usuário tem itens no carrinho
      if (!items || items.length === 0) {
        throw new Error("Carrinho vazio. Adicione produtos antes de finalizar a compra.");
      }

      console.log('=== INICIANDO CHECKOUT ===');
      console.log('Dados do usuário:', user);
      console.log('Itens no carrinho:', items);
      console.log('Total do carrinho:', getCartTotal());

      // Preparar dados para o checkout seguindo o formato esperado pelo backend (CheckoutHeaderVO)
      const checkoutData = {
        Id: 0, // BaseMessage property
        MessageCreated: new Date().toISOString(), // BaseMessage property
        UserID: user?.sub,
        CouponCode: couponCode || "",
        DiscountAmount: discountAmount || 0,
        PurchaseAmount: getCartTotal(),
        FirstName: formData.firstName,
        LastName: formData.lastName,
        Phone: formData.phone,
        Email: formData.email,
        CardNumber: formData.cardNumber.replace(/\s/g, ''),
        CVV: formData.cvv,
        ExpiryMonthYear: `${formData.expiryMonth}/${formData.expiryYear}`,
        CartTotalItems: items.length
        // DateTime e CartDetails são preenchidos pelo backend
      };

      console.log('=== DADOS ENVIADOS PARA CHECKOUT ===');
      console.log('CheckoutData completo:', JSON.stringify(checkoutData, null, 2));
      
      // Chamar o serviço de checkout real
      const result = await checkout(checkoutData);
      
      console.log('Checkout realizado com sucesso:', result);
      alert('Pedido realizado com sucesso!');
      
      clearCart();
      navigate('/pedidos'); // Redirecionar para página de pedidos
      
    } catch (error) {
      console.error('Erro ao processar pedido:', error);
      alert(`Erro ao processar pedido: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (!items || items.length === 0) {
    return (
      <div className="checkout-container">
        <div className="empty-checkout">
          <h2>Carrinho Vazio</h2>
          <p>Adicione produtos ao seu carrinho antes de finalizar a compra.</p>
          <button onClick={() => navigate('/loja')} className="btn-primary">
            Ir às Compras
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-container">
      <div className="checkout-header">
        <h1>Finalizar Compra</h1>
        <p>Preencha os dados abaixo para concluir seu pedido</p>
      </div>

      <div className="checkout-content">
        <form onSubmit={handleSubmit} className="checkout-form">
          {/* Dados Pessoais */}
          <div className="form-section">
            <h3>Dados Pessoais</h3>
            <div className="form-row">
              <div className="form-group">
                <label>Nome *</label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className={errors.firstName ? 'error' : ''}
                />
                {errors.firstName && <span className="error-message">{errors.firstName}</span>}
              </div>
              <div className="form-group">
                <label>Sobrenome *</label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className={errors.lastName ? 'error' : ''}
                />
                {errors.lastName && <span className="error-message">{errors.lastName}</span>}
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={errors.email ? 'error' : ''}
                />
                {errors.email && <span className="error-message">{errors.email}</span>}
              </div>
              <div className="form-group">
                <label>Telefone *</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="(11) 99999-9999"
                  className={errors.phone ? 'error' : ''}
                />
                {errors.phone && <span className="error-message">{errors.phone}</span>}
              </div>
            </div>
          </div>

          {/* Endereço */}
          <div className="form-section">
            <h3>Endereço de Entrega</h3>
            <div className="form-group">
              <label>Endereço *</label>
              <input
                type="text"
                name="street"
                value={formData.street}
                onChange={handleInputChange}
                placeholder="Rua, número, complemento"
                className={errors.street ? 'error' : ''}
              />
              {errors.street && <span className="error-message">{errors.street}</span>}
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label>Cidade *</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  className={errors.city ? 'error' : ''}
                />
                {errors.city && <span className="error-message">{errors.city}</span>}
              </div>
              <div className="form-group">
                <label>Estado *</label>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                  className={errors.state ? 'error' : ''}
                />
                {errors.state && <span className="error-message">{errors.state}</span>}
              </div>
              <div className="form-group">
                <label>CEP *</label>
                <input
                  type="text"
                  name="zipCode"
                  value={formData.zipCode}
                  onChange={handleInputChange}
                  placeholder="00000-000"
                  className={errors.zipCode ? 'error' : ''}
                />
                {errors.zipCode && <span className="error-message">{errors.zipCode}</span>}
              </div>
            </div>
          </div>

          {/* Pagamento */}
          <div className="form-section">
            <h3>Dados do Cartão</h3>
            <div className="form-group">
              <label>Número do Cartão *</label>
              <input
                type="text"
                name="cardNumber"
                value={formatCardNumber(formData.cardNumber)}
                onChange={(e) => handleInputChange({
                  target: {
                    name: 'cardNumber',
                    value: e.target.value.replace(/\s/g, '').substring(0, 16)
                  }
                })}
                placeholder="1234 5678 9012 3456"
                className={errors.cardNumber ? 'error' : ''}
              />
              {errors.cardNumber && <span className="error-message">{errors.cardNumber}</span>}
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label>CVV *</label>
                <input
                  type="text"
                  name="cvv"
                  value={formData.cvv}
                  onChange={(e) => handleInputChange({
                    target: {
                      name: 'cvv',
                      value: e.target.value.replace(/\D/g, '').substring(0, 4)
                    }
                  })}
                  placeholder="123"
                  className={errors.cvv ? 'error' : ''}
                />
                {errors.cvv && <span className="error-message">{errors.cvv}</span>}
              </div>
              <div className="form-group">
                <label>Mês *</label>
                <select
                  name="expiryMonth"
                  value={formData.expiryMonth}
                  onChange={handleInputChange}
                  className={errors.expiryMonth ? 'error' : ''}
                >
                  <option value="">Mês</option>
                  {Array.from({ length: 12 }, (_, i) => (
                    <option key={i + 1} value={String(i + 1).padStart(2, '0')}>
                      {String(i + 1).padStart(2, '0')}
                    </option>
                  ))}
                </select>
                {errors.expiryMonth && <span className="error-message">{errors.expiryMonth}</span>}
              </div>
              <div className="form-group">
                <label>Ano *</label>
                <select
                  name="expiryYear"
                  value={formData.expiryYear}
                  onChange={handleInputChange}
                  className={errors.expiryYear ? 'error' : ''}
                >
                  <option value="">Ano</option>
                  {Array.from({ length: 10 }, (_, i) => {
                    const year = new Date().getFullYear() + i;
                    return (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    );
                  })}
                </select>
                {errors.expiryYear && <span className="error-message">{errors.expiryYear}</span>}
              </div>
            </div>
          </div>

          <button type="submit" className="btn-checkout" disabled={loading}>
            {loading ? 'Processando...' : 'Finalizar Pedido'}
          </button>
        </form>

        {/* Resumo do Pedido */}
        <div className="order-summary">
          <h3>Resumo do Pedido</h3>
          
          <div className="order-items">
            {items.map((item) => (
              <div key={item.id} className="order-item">
                <img src={item.imageURL} alt={item.name} />
                <div className="item-details">
                  <h4>{item.name}</h4>
                  <p>Qtd: {item.quantity}</p>
                </div>
                <div className="item-price">
                  {formatPrice(item.productPrice * item.quantity)}
                </div>
              </div>
            ))}
          </div>

          <div className="order-totals">
            <div className="total-row">
              <span>Subtotal:</span>
              <span>{formatPrice(getCartSubtotal())}</span>
            </div>
            
            {couponCode && (
              <div className="total-row discount">
                <span>Desconto ({couponCode}):</span>
                <span>-{formatPrice(discountAmount)}</span>
              </div>
            )}
            
            <div className="total-row final">
              <span>Total:</span>
              <span>{formatPrice(getCartTotal())}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;