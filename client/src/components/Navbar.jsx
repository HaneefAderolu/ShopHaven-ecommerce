import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';

const WHATSAPP = 'https://wa.me/201117935124';

export default function Navbar() {
  const navigate              = useNavigate();
  const [cartCount, setCartCount] = useState(0);
  const [user, setUser]           = useState(null);
  const [scrolled, setScrolled]   = useState(false);
  const [menuOpen, setMenuOpen]   = useState(false);
  const [query, setQuery]         = useState('');
  const menuRef                   = useRef(null);

  const refreshCart = () => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    setCartCount(cart.reduce((s, i) => s + i.quantity, 0));
  };

  useEffect(() => {
    refreshCart();
    const u = localStorage.getItem('user');
    if (u) setUser(JSON.parse(u));
    window.addEventListener('cartUpdated', refreshCart);
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);

    // Close menu when clicking outside
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      window.removeEventListener('cartUpdated', refreshCart);
      window.removeEventListener('scroll', onScroll);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    navigate(`/?search=${encodeURIComponent(query.trim())}`);
    setMenuOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('cart');
    setUser(null);
    setCartCount(0);
    navigate('/');
    setMenuOpen(false);
  };

  const closeMenu = () => setMenuOpen(false);

  return (
    <>
      <style>{`
        * { box-sizing: border-box; }

        .navbar {
          position: sticky; top: 0; z-index: 1000;
          background: #fff;
          box-shadow: ${scrolled ? '0 2px 20px rgba(0,0,0,0.1)' : '0 1px 0 #f0f0f0'};
          transition: box-shadow 0.3s;
          font-family: 'Poppins', sans-serif;
        }
        .navbar-inner {
          max-width: 1280px; margin: 0 auto;
          padding: 0 1.25rem; height: 64px;
          display: flex; align-items: center; gap: 1rem;
        }

        /* Logo */
        .navbar-logo {
          font-size: 1.4rem; font-weight: 800; text-decoration: none;
          background: linear-gradient(135deg, #ff6b35, #f7c59f);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          white-space: nowrap; flex-shrink: 0;
        }

        /* Desktop search */
        .navbar-search {
          flex: 1; max-width: 420px; position: relative;
          display: flex;
        }
        .navbar-search input {
          width: 100%; padding: 0.55rem 1rem 0.55rem 2.6rem;
          border: 2px solid #f0f0f0; border-radius: 50px 0 0 50px;
          font-size: 0.88rem; font-family: 'Poppins', sans-serif;
          outline: none; background: #f8f8f8; transition: border-color 0.2s;
        }
        .navbar-search input:focus { border-color: #ff6b35; background: #fff; }
        .navbar-search .s-icon {
          position: absolute; left: 0.85rem; top: 50%;
          transform: translateY(-50%); color: #aaa; pointer-events: none;
        }
        .search-go {
          padding: 0 0.9rem; background: #ff6b35; border: none;
          border-radius: 0 50px 50px 0; cursor: pointer; color: white;
          font-size: 0.82rem; font-weight: 600; font-family: 'Poppins', sans-serif;
          transition: background 0.2s; white-space: nowrap;
        }
        .search-go:hover { background: #e85d2a; }

        /* Desktop nav links */
        .nav-links {
          display: flex; align-items: center; gap: 0.3rem;
        }
        .nav-link {
          text-decoration: none; color: #444; font-size: 0.88rem;
          font-weight: 500; padding: 0.4rem 0.7rem; border-radius: 8px;
          transition: all 0.2s; white-space: nowrap;
        }
        .nav-link:hover { background: #fff5f2; color: #ff6b35; }
        .cart-btn {
          text-decoration: none; background: #ff6b35; color: white;
          padding: 0.5rem 1rem; border-radius: 50px; font-weight: 600;
          font-size: 0.88rem; display: flex; align-items: center; gap: 0.4rem;
          transition: all 0.2s; white-space: nowrap;
        }
        .cart-btn:hover { background: #e85d2a; transform: translateY(-1px); box-shadow: 0 4px 12px rgba(255,107,53,0.3); }
        .cart-badge {
          background: white; color: #ff6b35; border-radius: 50%;
          width: 19px; height: 19px; font-size: 0.72rem; font-weight: 800;
          display: flex; align-items: center; justify-content: center;
        }
        .user-greet { font-size: 0.82rem; color: #666; font-weight: 500; white-space: nowrap; }
        .logout-btn {
          background: none; border: 1px solid #ddd; color: #666;
          padding: 0.38rem 0.7rem; border-radius: 8px; cursor: pointer;
          font-size: 0.82rem; font-family: 'Poppins', sans-serif; transition: all 0.2s;
        }
        .logout-btn:hover { border-color: #ff6b35; color: #ff6b35; }

        /* Hamburger */
        .hamburger {
          display: none; flex-direction: column; justify-content: center;
          gap: 5px; background: none; border: none; cursor: pointer;
          padding: 6px; margin-left: auto; flex-shrink: 0;
        }
        .hamburger span {
          display: block; width: 24px; height: 2.5px; background: #333;
          border-radius: 2px; transition: all 0.3s ease;
        }
        .hamburger.open span:nth-child(1) { transform: rotate(45deg) translate(5px, 5px); }
        .hamburger.open span:nth-child(2) { opacity: 0; transform: scaleX(0); }
        .hamburger.open span:nth-child(3) { transform: rotate(-45deg) translate(5px, -5px); }

        /* Mobile cart icon in header */
        .mobile-cart {
          display: none; text-decoration: none; position: relative;
          background: #ff6b35; color: white; width: 40px; height: 40px;
          border-radius: 50%; align-items: center; justify-content: center;
          font-size: 1.1rem; flex-shrink: 0;
        }
        .mobile-cart .cart-badge {
          position: absolute; top: -4px; right: -4px;
          width: 17px; height: 17px; font-size: 0.65rem;
        }

        /* Mobile dropdown menu */
        .mobile-menu {
          display: none;
          position: absolute; top: 64px; left: 0; right: 0;
          background: white; box-shadow: 0 8px 30px rgba(0,0,0,0.12);
          z-index: 999; padding: 1rem 1.25rem 1.5rem;
          animation: menuSlide 0.22s ease;
          border-top: 1px solid #f0f0f0;
        }
        .mobile-menu.open { display: block; }
        @keyframes menuSlide {
          from { opacity: 0; transform: translateY(-10px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* Mobile search */
        .mobile-search {
          display: flex; margin-bottom: 1rem; position: relative;
        }
        .mobile-search input {
          width: 100%; padding: 0.65rem 1rem 0.65rem 2.6rem;
          border: 2px solid #f0f0f0; border-radius: 50px 0 0 50px;
          font-size: 0.9rem; font-family: 'Poppins', sans-serif; outline: none;
          background: #f8f8f8;
        }
        .mobile-search input:focus { border-color: #ff6b35; }
        .mobile-search .s-icon {
          position: absolute; left: 0.85rem; top: 50%;
          transform: translateY(-50%); color: #aaa; pointer-events: none;
        }
        .mobile-search button {
          padding: 0 1rem; background: #ff6b35; border: none;
          border-radius: 0 50px 50px 0; color: white; font-weight: 600;
          font-family: 'Poppins', sans-serif; cursor: pointer;
        }

        /* Mobile nav links */
        .mobile-nav-links { display: flex; flex-direction: column; gap: 0.2rem; }
        .mobile-nav-link {
          text-decoration: none; color: #333; font-size: 1rem; font-weight: 500;
          padding: 0.8rem 0.75rem; border-radius: 10px; transition: all 0.2s;
          display: flex; align-items: center; gap: 0.75rem;
        }
        .mobile-nav-link:hover { background: #fff5f2; color: #ff6b35; }
        .mobile-nav-link .icon { font-size: 1.1rem; width: 24px; text-align: center; }
        .mobile-divider { height: 1px; background: #f0f0f0; margin: 0.5rem 0; }
        .mobile-user-row {
          display: flex; align-items: center; justify-content: space-between;
          padding: 0.6rem 0.75rem; background: #f8f8f8; border-radius: 10px; margin-bottom: 0.5rem;
        }
        .mobile-user-name { font-weight: 600; color: #1a1a2e; font-size: 0.92rem; }
        .mobile-logout {
          background: none; border: 1px solid #ddd; color: #666;
          padding: 0.3rem 0.75rem; border-radius: 8px; cursor: pointer;
          font-size: 0.82rem; font-family: 'Poppins', sans-serif;
        }
        .mobile-cart-link {
          display: flex; align-items: center; justify-content: space-between;
          text-decoration: none; background: #ff6b35; color: white;
          padding: 0.85rem 1rem; border-radius: 12px; font-weight: 700;
          font-size: 0.95rem; margin-top: 0.5rem;
        }
        .mobile-cart-badge {
          background: white; color: #ff6b35; border-radius: 50%;
          width: 24px; height: 24px; font-size: 0.8rem; font-weight: 800;
          display: flex; align-items: center; justify-content: center;
        }

        /* ── Responsive breakpoints ── */
        @media (max-width: 768px) {
          .navbar-search { display: none; }
          .nav-links     { display: none; }
          .hamburger     { display: flex; }
          .mobile-cart   { display: flex; }
        }
      `}</style>

      <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap" rel="stylesheet" />

      <nav className="navbar" ref={menuRef}>
        <div className="navbar-inner">
          <Link to="/" className="navbar-logo" onClick={closeMenu}>🛍 ShopHaven</Link>

          {/* Desktop search */}
          <form className="navbar-search" onSubmit={handleSearch}>
            <svg className="s-icon" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input placeholder="Search products..." value={query} onChange={e => setQuery(e.target.value)} />
            <button type="submit" className="search-go">Search</button>
          </form>

          {/* Desktop links */}
          <div className="nav-links">
            <Link to="/"       className="nav-link">Home</Link>
            <Link to="/orders" className="nav-link">Orders</Link>
            {user ? (
              <>
                <span className="user-greet">Hi, {user.name.split(' ')[0]}!</span>
                <button className="logout-btn" onClick={handleLogout}>Logout</button>
              </>
            ) : (
              <>
                <Link to="/login"    className="nav-link">Login</Link>
                <Link to="/register" className="nav-link">Register</Link>
              </>
            )}
            <Link to="/cart" className="cart-btn">
              🛒 Cart {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
            </Link>
          </div>

          {/* Mobile: cart icon + hamburger */}
          <Link to="/cart" className="mobile-cart" onClick={closeMenu}>
            🛒
            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          </Link>
          <button className={`hamburger ${menuOpen ? 'open' : ''}`} onClick={() => setMenuOpen(o => !o)} aria-label="Menu">
            <span /><span /><span />
          </button>
        </div>

        {/* Mobile dropdown */}
        <div className={`mobile-menu ${menuOpen ? 'open' : ''}`}>
          {/* Mobile search */}
          <form className="mobile-search" onSubmit={handleSearch}>
            <svg className="s-icon" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input placeholder="Search products..." value={query} onChange={e => setQuery(e.target.value)} />
            <button type="submit">Go</button>
          </form>

          {/* User info */}
          {user && (
            <div className="mobile-user-row">
              <span className="mobile-user-name">👋 Hi, {user.name.split(' ')[0]}!</span>
              <button className="mobile-logout" onClick={handleLogout}>Logout</button>
            </div>
          )}

          <div className="mobile-nav-links">
            <Link to="/"       className="mobile-nav-link" onClick={closeMenu}><span className="icon">🏠</span> Home</Link>
            <Link to="/orders" className="mobile-nav-link" onClick={closeMenu}><span className="icon">📦</span> My Orders</Link>
            {!user && <>
              <div className="mobile-divider" />
              <Link to="/login"    className="mobile-nav-link" onClick={closeMenu}><span className="icon">🔑</span> Login</Link>
              <Link to="/register" className="mobile-nav-link" onClick={closeMenu}><span className="icon">✏️</span> Register</Link>
            </>}
            <div className="mobile-divider" />
            <a href={WHATSAPP} target="_blank" rel="noopener noreferrer" className="mobile-nav-link" onClick={closeMenu}>
              <span className="icon">💬</span> Contact on WhatsApp
            </a>
          </div>

          <Link to="/cart" className="mobile-cart-link" onClick={closeMenu}>
            🛒 View Cart
            {cartCount > 0 && <span className="mobile-cart-badge">{cartCount}</span>}
          </Link>
        </div>
      </nav>
    </>
  );
}