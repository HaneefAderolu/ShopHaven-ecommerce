import { useEffect, useState, useCallback } from 'react';
import api from '../api';

const CATEGORIES = ['All', 'Electronics', 'Books', 'Office', 'Accessories', 'Clothing'];

const HERO_SLIDES = [
  { bg: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', title: 'New Arrivals', sub: 'Up to 40% off on Electronics', emoji: '⚡' },
  { bg: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', title: 'Flash Sale', sub: 'Today only — grab the best deals', emoji: '🔥' },
  { bg: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', title: 'Free Shipping', sub: 'On all orders over $50', emoji: '🚚' },
];

// Fallback images per category in case a URL fails
const FALLBACKS = {
  Electronics: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&q=80',
  Books:       'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&q=80',
  Office:      'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=400&q=80',
  Accessories: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&q=80',
  Clothing:    'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&q=80',
  default:     'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80',
};

export default function Home() {
  const [products, setProducts]       = useState([]);
  const [displayed, setDisplayed]     = useState([]);  // what's actually shown (after search)
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState('');
  const [activeCategory, setCategory] = useState('All');
  const [search, setSearch]           = useState('');
  const [quantities, setQuantities]   = useState({});
  const [addedMap, setAddedMap]       = useState({});
  const [slide, setSlide]             = useState(0);

  // Fetch when category changes
  useEffect(() => {
    setLoading(true);
    setError('');
    api.get('/products', { params: { category: activeCategory } })
      .then(res => {
        setProducts(res.data);
        setDisplayed(res.data);
        setSearch('');   // clear search when switching category
        setLoading(false);
      })
      .catch(() => { setError('Could not load products. Is the backend running?'); setLoading(false); });
  }, [activeCategory]);

  // Filter by search term
  useEffect(() => {
    if (!search.trim()) { setDisplayed(products); return; }
    const q = search.toLowerCase();
    setDisplayed(products.filter(p =>
      p.name.toLowerCase().includes(q) ||
      (p.description || '').toLowerCase().includes(q) ||
      (p.category || '').toLowerCase().includes(q)
    ));
  }, [search, products]);

  // Auto-advance hero slider
  useEffect(() => {
    const t = setInterval(() => setSlide(s => (s + 1) % HERO_SLIDES.length), 4000);
    return () => clearInterval(t);
  }, []);

  const changeQty = (id, delta) =>
    setQuantities(prev => ({ ...prev, [id]: Math.max(1, (prev[id] || 1) + delta) }));

  const addToCart = (product) => {
    const qty  = quantities[product.id] || 1;
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const ex   = cart.find(i => i.id === product.id);
    if (ex) ex.quantity += qty; else cart.push({ ...product, quantity: qty });
    localStorage.setItem('cart', JSON.stringify(cart));
    window.dispatchEvent(new Event('cartUpdated'));
    setAddedMap(prev => ({ ...prev, [product.id]: true }));
    setTimeout(() => setAddedMap(prev => ({ ...prev, [product.id]: false })), 1500);
  };

  const getFallback = (category) => FALLBACKS[category] || FALLBACKS.default;

  return (
    <>
      <style>{`
        * { box-sizing: border-box; }
        body { margin: 0; font-family: 'Poppins', sans-serif; background: #f7f8fc; }

        .hero {
          margin: 1.5rem 2rem; border-radius: 20px; overflow: hidden;
          height: 260px; position: relative; cursor: pointer;
        }
        .hero-slide {
          position: absolute; inset: 0; display: flex; align-items: center;
          padding: 3rem; opacity: 0; transition: opacity 0.7s ease;
        }
        .hero-slide.active { opacity: 1; }
        .hero-text h1 { color: white; font-size: 2.4rem; font-weight: 800; margin: 0 0 0.5rem; text-shadow: 0 2px 12px rgba(0,0,0,0.15); }
        .hero-text p { color: rgba(255,255,255,0.88); font-size: 1.1rem; margin: 0 0 1.2rem; }
        .hero-btn { background: white; color: #333; border: none; padding: 0.7rem 1.8rem; border-radius: 50px; font-weight: 700; font-size: 0.95rem; cursor: pointer; font-family: 'Poppins', sans-serif; transition: all 0.2s; box-shadow: 0 4px 15px rgba(0,0,0,0.15); }
        .hero-btn:hover { transform: translateY(-2px); }
        .hero-emoji { position: absolute; right: 3rem; font-size: 8rem; opacity: 0.25; user-select: none; }
        .hero-dots { position: absolute; bottom: 1rem; left: 50%; transform: translateX(-50%); display: flex; gap: 0.4rem; }
        .hero-dot { width: 8px; height: 8px; border-radius: 50%; background: rgba(255,255,255,0.5); cursor: pointer; transition: all 0.2s; }
        .hero-dot.active { background: white; width: 24px; border-radius: 4px; }

        .features-bar { background: #1a1a2e; padding: 1.5rem 2rem; display: flex; justify-content: center; gap: 3rem; flex-wrap: wrap; margin-bottom: 2rem; }
        .feature-item { color: white; display: flex; align-items: center; gap: 0.75rem; }
        .feature-item span:first-child { font-size: 1.5rem; }
        .feature-text strong { display: block; font-size: 0.9rem; }
        .feature-text small { color: #aaa; font-size: 0.78rem; }

        .section { max-width: 1280px; margin: 0 auto; padding: 0 2rem; }
        .section-header { display: flex; align-items: center; justify-content: space-between; margin: 2rem 0 1rem; }
        .section-title { font-size: 1.3rem; font-weight: 700; color: #1a1a2e; margin: 0; }
        .result-count { font-size: 0.85rem; color: #888; }

        .categories { display: flex; gap: 0.75rem; flex-wrap: wrap; margin-bottom: 1.5rem; }
        .cat-btn { padding: 0.5rem 1.2rem; border-radius: 50px; border: 2px solid #e8e8e8; background: white; color: #555; font-weight: 600; font-size: 0.88rem; cursor: pointer; font-family: 'Poppins', sans-serif; transition: all 0.2s; }
        .cat-btn:hover { border-color: #ff6b35; color: #ff6b35; }
        .cat-btn.active { background: #ff6b35; border-color: #ff6b35; color: white; box-shadow: 0 4px 12px rgba(255,107,53,0.3); }

        .search-bar-section { margin-bottom: 1.5rem; position: relative; }
        .search-bar-section input { width: 100%; padding: 0.85rem 1rem 0.85rem 3rem; border: 2px solid #eee; border-radius: 14px; font-size: 0.95rem; font-family: 'Poppins', sans-serif; outline: none; background: white; transition: border-color 0.2s; }
        .search-bar-section input:focus { border-color: #ff6b35; }
        .search-bar-section svg { position: absolute; left: 1rem; top: 50%; transform: translateY(-50%); color: #bbb; }
        .search-clear { position: absolute; right: 1rem; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; color: #bbb; font-size: 1.1rem; padding: 0; }
        .search-clear:hover { color: #ff6b35; }

        .product-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(230px, 1fr)); gap: 1.5rem; margin-bottom: 3rem; }
        .product-card { background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 2px 12px rgba(0,0,0,0.06); transition: all 0.25s ease; display: flex; flex-direction: column; position: relative; }
        .product-card:hover { transform: translateY(-6px); box-shadow: 0 12px 32px rgba(0,0,0,0.12); }
        .product-img-wrap { position: relative; overflow: hidden; height: 200px; background: #f5f5f5; }
        .product-img-wrap img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.4s ease; }
        .product-card:hover .product-img-wrap img { transform: scale(1.06); }
        .product-badge { position: absolute; top: 0.75rem; left: 0.75rem; background: #ff6b35; color: white; font-size: 0.72rem; font-weight: 700; padding: 0.25rem 0.6rem; border-radius: 50px; }
        .cat-tag { position: absolute; top: 0.75rem; right: 0.75rem; background: rgba(26,26,46,0.75); color: white; font-size: 0.7rem; font-weight: 600; padding: 0.2rem 0.55rem; border-radius: 50px; backdrop-filter: blur(4px); }
        .product-body { padding: 1rem; flex-grow: 1; display: flex; flex-direction: column; }
        .product-name { font-weight: 700; font-size: 0.97rem; color: #1a1a2e; margin: 0 0 0.35rem; line-height: 1.3; }
        .product-desc { font-size: 0.82rem; color: #888; flex-grow: 1; margin: 0 0 0.75rem; line-height: 1.5; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
        .product-stock { font-size: 0.78rem; color: #27ae60; font-weight: 600; margin-bottom: 0.75rem; }
        .product-stock.low { color: #e67e22; }
        .product-stock.out { color: #e74c3c; }
        .product-footer { display: flex; align-items: center; justify-content: space-between; gap: 0.5rem; flex-wrap: wrap; }
        .product-price { font-size: 1.35rem; font-weight: 800; color: #ff6b35; }
        .qty-control { display: flex; align-items: center; gap: 0.4rem; background: #f5f5f5; border-radius: 50px; padding: 0.2rem 0.4rem; }
        .qty-btn { width: 26px; height: 26px; border: none; background: white; border-radius: 50%; font-size: 1rem; font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; box-shadow: 0 1px 4px rgba(0,0,0,0.1); transition: all 0.15s; color: #333; }
        .qty-btn:hover { background: #ff6b35; color: white; }
        .qty-num { font-weight: 700; font-size: 0.95rem; min-width: 20px; text-align: center; color: #333; }
        .add-btn { padding: 0.55rem 1rem; background: #1a1a2e; color: white; border: none; border-radius: 50px; font-weight: 600; font-size: 0.82rem; cursor: pointer; font-family: 'Poppins', sans-serif; transition: all 0.2s; white-space: nowrap; }
        .add-btn:hover { background: #ff6b35; transform: scale(1.03); }
        .add-btn.added { background: #27ae60; }
        .add-btn:disabled { background: #ccc; cursor: not-allowed; transform: none; }

        .empty-search { text-align: center; padding: 4rem 2rem; grid-column: 1/-1; }
        .empty-search .icon { font-size: 3rem; margin-bottom: 1rem; }
        .empty-search h3 { color: #1a1a2e; margin-bottom: 0.5rem; }
        .empty-search p { color: #888; }

        .loading-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(230px, 1fr)); gap: 1.5rem; }
        .skeleton { background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; border-radius: 16px; height: 320px; }
        @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
      `}</style>

      <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap" rel="stylesheet" />

      {/* Hero */}
      <div className="hero" style={{ background: HERO_SLIDES[slide].bg }}>
        {HERO_SLIDES.map((s, i) => (
          <div key={i} className={`hero-slide ${i === slide ? 'active' : ''}`} style={{ background: s.bg }}>
            <div className="hero-text">
              <h1>{s.title}</h1>
              <p>{s.sub}</p>
              <button className="hero-btn">Shop Now →</button>
            </div>
            <div className="hero-emoji">{s.emoji}</div>
          </div>
        ))}
        <div className="hero-dots">
          {HERO_SLIDES.map((_, i) => (
            <div key={i} className={`hero-dot ${i === slide ? 'active' : ''}`} onClick={() => setSlide(i)} />
          ))}
        </div>
      </div>

      {/* Features */}
      <div className="features-bar">
        {[['🚚','Free Shipping','On orders over $50'],['🔄','Easy Returns','30-day return policy'],['🔒','Secure Payment','100% protected'],['🎧','24/7 Support','Always here to help']].map(([icon,title,sub]) => (
          <div key={title} className="feature-item">
            <span>{icon}</span>
            <div className="feature-text"><strong>{title}</strong><small>{sub}</small></div>
          </div>
        ))}
      </div>

      <div className="section">
        {/* Categories */}
        <div className="section-title" style={{ marginBottom: '1rem', marginTop: '0.5rem' }}>Browse Categories</div>
        <div className="categories">
          {CATEGORIES.map(c => (
            <button key={c} className={`cat-btn ${activeCategory === c ? 'active' : ''}`} onClick={() => setCategory(c)}>
              {{ All:'🏠 All', Electronics:'⚡ Electronics', Books:'📚 Books', Office:'🖊 Office', Accessories:'🎒 Accessories', Clothing:'👕 Clothing' }[c]}
            </button>
          ))}
        </div>

        {/* Search within category */}
        <div className="search-bar-section">
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            placeholder={`Search in ${activeCategory === 'All' ? 'all products' : activeCategory}...`}
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && <button className="search-clear" onClick={() => setSearch('')}>✕</button>}
        </div>

        {/* Section header */}
        <div className="section-header">
          <div className="section-title">
            {{ All:'🔥 All Products', Electronics:'⚡ Electronics', Books:'📚 Books', Office:'🖊 Office Supplies', Accessories:'🎒 Accessories', Clothing:'👕 Clothing' }[activeCategory]}
          </div>
          {!loading && <span className="result-count">{displayed.length} product{displayed.length !== 1 ? 's' : ''}</span>}
        </div>

        {loading && (
          <div className="loading-grid">
            {[...Array(8)].map((_, i) => <div key={i} className="skeleton" />)}
          </div>
        )}

        {error && <p style={{ color: 'red', textAlign: 'center', padding: '2rem' }}>{error}</p>}

        {!loading && !error && (
          <div className="product-grid">
            {displayed.length === 0 && (
              <div className="empty-search">
                <div className="icon">🔍</div>
                <h3>No results for "{search}"</h3>
                <p>Try a different search term or browse another category.</p>
              </div>
            )}
            {displayed.map(p => {
              const qty      = quantities[p.id] || 1;
              const isAdded  = addedMap[p.id];
              const stockNum = parseInt(p.stock);
              return (
                <div key={p.id} className="product-card">
                  <div className="product-img-wrap">
                    <img
                      src={p.image_url || getFallback(p.category)}
                      alt={p.name}
                      onError={e => { e.target.onerror = null; e.target.src = getFallback(p.category); }}
                    />
                    {stockNum > 0 && stockNum <= 5 && <span className="product-badge">Only {stockNum} left!</span>}
                    {stockNum === 0 && <span className="product-badge" style={{ background: '#e74c3c' }}>Sold Out</span>}
                    {activeCategory === 'All' && p.category && <span className="cat-tag">{p.category}</span>}
                  </div>
                  <div className="product-body">
                    <div className="product-name">{p.name}</div>
                    <div className="product-desc">{p.description}</div>
                    <div className={`product-stock ${stockNum === 0 ? 'out' : stockNum <= 5 ? 'low' : ''}`}>
                      {stockNum === 0 ? '✕ Out of stock' : stockNum <= 5 ? `⚠ Only ${stockNum} left` : '✓ In stock'}
                    </div>
                    <div className="product-footer">
                      <div className="product-price">${parseFloat(p.price).toFixed(2)}</div>
                      {stockNum > 0 && (
                        <>
                          <div className="qty-control">
                            <button className="qty-btn" onClick={() => changeQty(p.id, -1)}>−</button>
                            <span className="qty-num">{qty}</span>
                            <button className="qty-btn" onClick={() => changeQty(p.id, 1)}>+</button>
                          </div>
                          <button className={`add-btn ${isAdded ? 'added' : ''}`} onClick={() => addToCart(p)}>
                            {isAdded ? '✓ Added!' : '🛒 Add'}
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}