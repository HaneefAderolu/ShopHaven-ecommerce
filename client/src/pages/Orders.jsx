import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';

const STATUS_STYLES = {
  pending:   { bg: '#fff7ed', color: '#c2410c', dot: '#fb923c', label: 'Pending' },
  shipped:   { bg: '#eff6ff', color: '#1d4ed8', dot: '#60a5fa', label: 'Shipped' },
  delivered: { bg: '#f0fdf4', color: '#15803d', dot: '#4ade80', label: 'Delivered' },
  cancelled: { bg: '#fef2f2', color: '#b91c1c', dot: '#f87171', label: 'Cancelled' },
};

const getStatus = (s) => STATUS_STYLES[s?.toLowerCase()] || STATUS_STYLES.pending;

export default function Orders() {
  const [orders, setOrders]       = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');
  const [expanded, setExpanded]   = useState(null); // order id that's expanded
  const navigate                  = useNavigate();

  useEffect(() => {
    if (!localStorage.getItem('token')) { navigate('/login'); return; }
    api.get('/orders/mine')
      .then(res  => { setOrders(res.data); setLoading(false); })
      .catch(() => { setError('Could not load orders.'); setLoading(false); });
  }, []);

  const toggle = (id) => setExpanded(prev => prev === id ? null : id);

  const formatDate = (d) => new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const formatTime = (d) => new Date(d).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  return (
    <>
      <style>{`
        * { box-sizing: border-box; }
        body { font-family: 'Poppins', sans-serif; background: #f7f8fc; margin: 0; }
        .orders-page { max-width: 900px; margin: 0 auto; padding: 2rem; }

        .orders-header { margin-bottom: 2rem; }
        .orders-header h1 { font-size: 1.9rem; font-weight: 800; color: #1a1a2e; margin: 0 0 0.25rem; }
        .orders-header p { color: #888; font-size: 0.9rem; margin: 0; }

        /* Stats row */
        .orders-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin-bottom: 2rem; }
        .stat-card { background: white; border-radius: 14px; padding: 1.2rem; text-align: center; box-shadow: 0 2px 10px rgba(0,0,0,0.05); }
        .stat-num { font-size: 2rem; font-weight: 800; color: #ff6b35; }
        .stat-label { font-size: 0.82rem; color: #888; margin-top: 0.2rem; }

        /* Order card */
        .order-card { background: white; border-radius: 16px; margin-bottom: 1rem; box-shadow: 0 2px 12px rgba(0,0,0,0.06); overflow: hidden; transition: box-shadow 0.2s; }
        .order-card:hover { box-shadow: 0 6px 24px rgba(0,0,0,0.1); }

        .order-summary { display: flex; align-items: center; gap: 1rem; padding: 1.2rem 1.5rem; cursor: pointer; }
        .order-icon { width: 48px; height: 48px; background: #fff5f2; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 1.4rem; flex-shrink: 0; }
        .order-info { flex-grow: 1; }
        .order-top { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.3rem; flex-wrap: wrap; }
        .order-id { font-weight: 700; color: #1a1a2e; font-size: 0.97rem; }
        .status-badge { display: inline-flex; align-items: center; gap: 0.35rem; padding: 0.2rem 0.65rem; border-radius: 50px; font-size: 0.75rem; font-weight: 600; }
        .status-dot { width: 7px; height: 7px; border-radius: 50%; }
        .order-meta { font-size: 0.82rem; color: #888; display: flex; gap: 1rem; flex-wrap: wrap; }
        .order-right { text-align: right; flex-shrink: 0; }
        .order-total { font-size: 1.2rem; font-weight: 800; color: #1a1a2e; }
        .order-items-count { font-size: 0.8rem; color: #aaa; margin-top: 0.1rem; }
        .expand-btn { width: 32px; height: 32px; border: none; background: #f5f5f5; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; color: #666; font-size: 1rem; transition: all 0.2s; flex-shrink: 0; }
        .expand-btn.open { background: #ff6b35; color: white; transform: rotate(180deg); }

        /* Expanded detail */
        .order-detail { border-top: 1px solid #f0f0f0; padding: 1.5rem; background: #fafafa; animation: slideDown 0.2s ease; }
        @keyframes slideDown { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }

        .detail-section-title { font-size: 0.8rem; font-weight: 700; color: #aaa; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 0.75rem; }

        .order-items-list { display: flex; flex-direction: column; gap: 0.6rem; margin-bottom: 1.5rem; }
        .order-item-row { display: flex; align-items: center; gap: 0.75rem; background: white; border-radius: 10px; padding: 0.75rem; box-shadow: 0 1px 4px rgba(0,0,0,0.04); }
        .item-img { width: 50px; height: 50px; border-radius: 8px; object-fit: cover; background: #f0f0f0; flex-shrink: 0; }
        .item-name { font-weight: 600; font-size: 0.9rem; color: #1a1a2e; }
        .item-sub { font-size: 0.8rem; color: #888; }
        .item-price { font-weight: 700; color: #ff6b35; margin-left: auto; white-space: nowrap; }

        .order-breakdown { background: white; border-radius: 12px; padding: 1rem 1.2rem; box-shadow: 0 1px 4px rgba(0,0,0,0.04); }
        .breakdown-row { display: flex; justify-content: space-between; font-size: 0.88rem; color: #666; padding: 0.35rem 0; }
        .breakdown-total { display: flex; justify-content: space-between; font-weight: 800; font-size: 1rem; color: #1a1a2e; border-top: 2px solid #f0f0f0; padding-top: 0.75rem; margin-top: 0.4rem; }
        .breakdown-total span:last-child { color: #ff6b35; }

        /* Empty state */
        .empty-orders { text-align: center; padding: 5rem 2rem; }
        .empty-orders .icon { font-size: 4rem; margin-bottom: 1.5rem; }
        .empty-orders h2 { font-size: 1.5rem; color: #1a1a2e; margin-bottom: 0.5rem; }
        .empty-orders p { color: #888; margin-bottom: 2rem; }
        .shop-btn { background: linear-gradient(135deg, #ff6b35, #e85d2a); color: white; padding: 0.85rem 2rem; border-radius: 50px; text-decoration: none; font-weight: 700; box-shadow: 0 4px 15px rgba(255,107,53,0.35); }

        .loading-card { background: white; border-radius: 16px; height: 80px; margin-bottom: 1rem; animation: shimmer 1.5s infinite; background: linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%); background-size: 200% 100%; }
        @keyframes shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
      `}</style>
      <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap" rel="stylesheet" />

      <div className="orders-page">
        <div className="orders-header">
          <h1>📦 My Orders</h1>
          <p>Track and manage all your purchases</p>
        </div>

        {loading && [...Array(3)].map((_, i) => <div key={i} className="loading-card" />)}
        {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}

        {!loading && !error && orders.length === 0 && (
          <div className="empty-orders">
            <div className="icon">📭</div>
            <h2>No orders yet</h2>
            <p>You haven't placed any orders. Start shopping to see them here.</p>
            <Link to="/" className="shop-btn">Start Shopping</Link>
          </div>
        )}

        {!loading && orders.length > 0 && (
          <>
            {/* Stats */}
            <div className="orders-stats">
              <div className="stat-card">
                <div className="stat-num">{orders.length}</div>
                <div className="stat-label">Total Orders</div>
              </div>
              <div className="stat-card">
                <div className="stat-num">${orders.reduce((s, o) => s + parseFloat(o.total || 0), 0).toFixed(2)}</div>
                <div className="stat-label">Total Spent</div>
              </div>
              <div className="stat-card">
                <div className="stat-num">{orders.filter(o => o.status === 'pending').length}</div>
                <div className="stat-label">Pending</div>
              </div>
            </div>

            {/* Orders list */}
            {orders.map(order => {
              const st        = getStatus(order.status);
              const isOpen    = expanded === order.id;
              const itemCount = order.items?.length || 0;

              return (
                <div key={order.id} className="order-card">
                  <div className="order-summary" onClick={() => toggle(order.id)}>
                    <div className="order-icon">🛍</div>
                    <div className="order-info">
                      <div className="order-top">
                        <span className="order-id">Order #{order.id}</span>
                        <span className="status-badge" style={{ background: st.bg, color: st.color }}>
                          <span className="status-dot" style={{ background: st.dot }} />
                          {st.label}
                        </span>
                      </div>
                      <div className="order-meta">
                        <span>📅 {formatDate(order.created_at)}</span>
                        <span>🕐 {formatTime(order.created_at)}</span>
                        {itemCount > 0 && <span>📦 {itemCount} item{itemCount !== 1 ? 's' : ''}</span>}
                      </div>
                    </div>
                    <div className="order-right">
                      <div className="order-total">${parseFloat(order.total || 0).toFixed(2)}</div>
                      <div className="order-items-count">View details</div>
                    </div>
                    <button className={`expand-btn ${isOpen ? 'open' : ''}`}>▼</button>
                  </div>

                  {isOpen && (
                    <div className="order-detail">
                      {/* Items */}
                      {order.items && order.items.length > 0 ? (
                        <>
                          <div className="detail-section-title">Items Ordered</div>
                          <div className="order-items-list">
                            {order.items.map((item, idx) => (
                              <div key={idx} className="order-item-row">
                                <img
                                  className="item-img"
                                  src={item.image_url || `https://placehold.co/50x50/f0f0f0/999?text=${encodeURIComponent(item.name || 'Item')}`}
                                  alt={item.name}
                                  onError={e => { e.target.onerror = null; e.target.src = 'https://placehold.co/50x50/f0f0f0/999?text=Item'; }}
                                />
                                <div>
                                  <div className="item-name">{item.name || `Item #${item.product_id}`}</div>
                                  <div className="item-sub">Qty: {item.quantity} × ${parseFloat(item.price || 0).toFixed(2)}</div>
                                </div>
                                <div className="item-price">${(item.quantity * parseFloat(item.price || 0)).toFixed(2)}</div>
                              </div>
                            ))}
                          </div>
                        </>
                      ) : (
                        <p style={{ color: '#aaa', fontSize: '0.88rem', marginBottom: '1rem' }}>Item details not available.</p>
                      )}

                      {/* Price breakdown */}
                      <div className="detail-section-title">Price Breakdown</div>
                      <div className="order-breakdown">
                        <div className="breakdown-row"><span>Subtotal</span><span>${parseFloat(order.total || 0).toFixed(2)}</span></div>
                        <div className="breakdown-row"><span>Shipping</span><span style={{ color: '#27ae60' }}>Free</span></div>
                        <div className="breakdown-total"><span>Total</span><span>${parseFloat(order.total || 0).toFixed(2)}</span></div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </>
        )}
      </div>
    </>
  );
}