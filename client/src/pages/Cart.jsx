import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';

export default function Cart() {
  const [cart, setCart]       = useState([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate              = useNavigate();

  useEffect(() => {
    setCart(JSON.parse(localStorage.getItem('cart') || '[]'));
  }, []);

  const updateQty = (id, delta) => {
    const updated = cart.map(item =>
      item.id === id ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item
    );
    localStorage.setItem('cart', JSON.stringify(updated));
    window.dispatchEvent(new Event('cartUpdated'));
    setCart(updated);
  };

  const remove = (id) => {
    const updated = cart.filter(i => i.id !== id);
    localStorage.setItem('cart', JSON.stringify(updated));
    window.dispatchEvent(new Event('cartUpdated'));
    setCart(updated);
  };

  const total = cart.reduce((s, i) => s + i.price * i.quantity, 0);

  const handleCheckout = async () => {
    if (!localStorage.getItem('token')) { navigate('/login'); return; }
    setLoading(true);
    try {
      await api.post('/orders', {
        items: cart.map(i => ({ product_id: i.id, quantity: i.quantity, price: i.price }))
      });
      localStorage.removeItem('cart');
      window.dispatchEvent(new Event('cartUpdated'));
      setCart([]);
      setMessage('success');
    } catch { setMessage('error'); }
    finally { setLoading(false); }
  };

  return (
    <>
      <style>{`
        .cart-page { max-width: 1100px; margin: 2rem auto; padding: 0 2rem; font-family: 'Poppins', sans-serif; }
        .cart-title { font-size: 1.8rem; font-weight: 800; color: #1a1a2e; margin-bottom: 1.5rem; }
        .cart-layout { display: grid; grid-template-columns: 1fr 340px; gap: 2rem; }
        @media(max-width:768px){ .cart-layout { grid-template-columns: 1fr; } }
        .cart-items { display: flex; flex-direction: column; gap: 1rem; }
        .cart-item {
          background: white; border-radius: 16px; padding: 1.2rem;
          display: flex; gap: 1rem; align-items: center;
          box-shadow: 0 2px 10px rgba(0,0,0,0.06);
        }
        .cart-item img { width: 90px; height: 90px; object-fit: cover; border-radius: 12px; background: #f5f5f5; }
        .cart-item-info { flex-grow: 1; }
        .cart-item-name { font-weight: 700; color: #1a1a2e; margin-bottom: 0.25rem; }
        .cart-item-price { color: #ff6b35; font-weight: 600; font-size: 1rem; }
        .cart-item-controls { display: flex; align-items: center; gap: 0.5rem; margin-top: 0.5rem; }
        .qty-btn { width: 28px; height: 28px; border: 2px solid #eee; background: white; border-radius: 50%; font-size: 1rem; font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.15s; color: #333; }
        .qty-btn:hover { border-color: #ff6b35; color: #ff6b35; }
        .qty-num { font-weight: 700; font-size: 0.95rem; min-width: 24px; text-align: center; }
        .remove-btn { background: none; border: none; cursor: pointer; color: #ccc; font-size: 1.2rem; transition: color 0.2s; margin-left: auto; }
        .remove-btn:hover { color: #e74c3c; }
        .cart-summary { background: white; border-radius: 16px; padding: 1.5rem; box-shadow: 0 2px 10px rgba(0,0,0,0.06); height: fit-content; position: sticky; top: 90px; }
        .summary-title { font-weight: 700; font-size: 1.1rem; color: #1a1a2e; margin-bottom: 1.2rem; }
        .summary-row { display: flex; justify-content: space-between; font-size: 0.9rem; color: #666; margin-bottom: 0.75rem; }
        .summary-total { display: flex; justify-content: space-between; font-weight: 800; font-size: 1.15rem; color: #1a1a2e; border-top: 2px solid #f0f0f0; padding-top: 1rem; margin-top: 0.5rem; }
        .checkout-btn { width: 100%; padding: 1rem; background: linear-gradient(135deg, #ff6b35, #e85d2a); color: white; border: none; border-radius: 12px; font-size: 1rem; font-weight: 700; font-family: 'Poppins', sans-serif; cursor: pointer; margin-top: 1.2rem; transition: all 0.2s; box-shadow: 0 4px 15px rgba(255,107,53,0.35); }
        .checkout-btn:hover:not(:disabled) { transform: translateY(-2px); }
        .checkout-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .empty-cart { text-align: center; padding: 5rem 2rem; }
        .empty-cart .icon { font-size: 4rem; margin-bottom: 1rem; }
        .empty-cart h2 { font-size: 1.5rem; color: #1a1a2e; margin-bottom: 0.5rem; }
        .empty-cart p { color: #888; margin-bottom: 2rem; }
        .shop-btn { background: #ff6b35; color: white; padding: 0.8rem 2rem; border-radius: 50px; text-decoration: none; font-weight: 700; }
        .success-box { background: #f0fff4; border: 1px solid #9ae6b4; color: #276749; padding: 1rem; border-radius: 12px; text-align: center; margin-bottom: 1rem; font-weight: 600; }
        .error-box { background: #fff5f5; border: 1px solid #fed7d7; color: #c53030; padding: 1rem; border-radius: 12px; text-align: center; margin-bottom: 1rem; }
      `}</style>
      <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap" rel="stylesheet" />

      <div className="cart-page">
        <h1 className="cart-title">🛒 Your Cart ({cart.length} items)</h1>

        {message === 'success' && (
          <div className="success-box">
            🎉 Order placed successfully! <Link to="/orders">View your orders →</Link>
          </div>
        )}
        {message === 'error' && (
          <div className="error-box">Something went wrong. Are you logged in?</div>
        )}

        {cart.length === 0 && message !== 'success' ? (
          <div className="empty-cart">
            <div className="icon">🛒</div>
            <h2>Your cart is empty</h2>
            <p>Looks like you haven't added anything yet.</p>
            <Link to="/" className="shop-btn">Start Shopping</Link>
          </div>
        ) : cart.length > 0 && (
          <div className="cart-layout">
            <div className="cart-items">
              {cart.map(item => (
                <div key={item.id} className="cart-item">
                  <img src={item.image_url || `https://placehold.co/90x90/f0f0f0/999?text=${encodeURIComponent(item.name)}`} alt={item.name} />
                  <div className="cart-item-info">
                    <div className="cart-item-name">{item.name}</div>
                    <div className="cart-item-price">${parseFloat(item.price).toFixed(2)} each</div>
                    <div className="cart-item-controls">
                      <button className="qty-btn" onClick={() => updateQty(item.id, -1)}>−</button>
                      <span className="qty-num">{item.quantity}</span>
                      <button className="qty-btn" onClick={() => updateQty(item.id, 1)}>+</button>
                      <span style={{ color: '#aaa', fontSize: '0.85rem', marginLeft: '0.5rem' }}>
                        = ${(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  </div>
                  <button className="remove-btn" onClick={() => remove(item.id)}>✕</button>
                </div>
              ))}
            </div>
            <div className="cart-summary">
              <div className="summary-title">Order Summary</div>
              {cart.map(i => (
                <div key={i.id} className="summary-row">
                  <span>{i.name} × {i.quantity}</span>
                  <span>${(i.price * i.quantity).toFixed(2)}</span>
                </div>
              ))}
              <div className="summary-row"><span>Shipping</span><span style={{ color: '#27ae60' }}>Free</span></div>
              <div className="summary-total"><span>Total</span><span style={{ color: '#ff6b35' }}>${total.toFixed(2)}</span></div>
              <button className="checkout-btn" onClick={handleCheckout} disabled={loading}>
                {loading ? 'Placing Order...' : 'Place Order →'}
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}