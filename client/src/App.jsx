import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Cart from './pages/Cart';
import Orders from './pages/Orders';

const WHATSAPP_NUMBER = '09117935124';

const WA_LINK = `https://wa.me/2349117935124`;

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/"         element={<Home />} />
        <Route path="/login"    element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/cart"     element={<Cart />} />
        <Route path="/orders"   element={<Orders />} />
      </Routes>

      {/* ── Footer ── */}
      <footer style={{
        background: '#1a1a2e',
        color: '#aaa',
        textAlign: 'center',
        padding: '2rem',
        fontFamily: "'Poppins', sans-serif",
        fontSize: '0.9rem',
        marginTop: '2rem',
      }}>
        <div style={{ marginBottom: '0.5rem', color: '#fff', fontWeight: 600, fontSize: '1.1rem' }}>
          🛍 ShopHaven
        </div>
        <div style={{ marginBottom: '0.4rem' }}>
          For more info, contact:{' '}
          <a
            href={WA_LINK}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: '#25d366', fontWeight: 700, textDecoration: 'none' }}
          >
            {WHATSAPP_NUMBER}
          </a>
        </div>
        <div style={{ fontSize: '0.78rem', color: '#666', marginTop: '0.75rem' }}>
          © {new Date().getFullYear()} ShopHaven. All rights reserved.
        </div>
      </footer>

      {/* ── Floating WhatsApp Button ── */}
      <a
        href={WA_LINK}
        target="_blank"
        rel="noopener noreferrer"
        title="Chat with us on WhatsApp"
        style={{
          position: 'fixed',
          bottom: '28px',
          right: '28px',
          width: '58px',
          height: '58px',
          background: '#25d366',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 20px rgba(37,211,102,0.45)',
          zIndex: 9999,
          transition: 'transform 0.2s, box-shadow 0.2s',
          textDecoration: 'none',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.transform = 'scale(1.12)';
          e.currentTarget.style.boxShadow = '0 6px 28px rgba(37,211,102,0.6)';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.boxShadow = '0 4px 20px rgba(37,211,102,0.45)';
        }}
      >
        {/* WhatsApp SVG icon */}
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32" fill="white">
          <path d="M16 .5C7.439.5.5 7.439.5 16c0 2.777.726 5.45 2.104 7.808L.5 31.5l7.931-2.079A15.45 15.45 0 0016 31.5C24.561 31.5 31.5 24.561 31.5 16S24.561.5 16 .5zm0 28.3a13.22 13.22 0 01-6.747-1.845l-.484-.287-5.007 1.312 1.336-4.876-.316-.5A13.26 13.26 0 012.7 16C2.7 8.65 8.65 2.7 16 2.7S29.3 8.65 29.3 16 23.35 28.8 16 28.8zm7.27-9.948c-.398-.199-2.352-1.16-2.717-1.293-.364-.132-.63-.198-.895.199-.265.398-1.027 1.293-1.259 1.558-.232.265-.464.298-.862.1-.398-.199-1.681-.62-3.203-1.977-1.184-1.057-1.984-2.363-2.216-2.76-.232-.398-.025-.613.174-.81.179-.177.398-.464.597-.696.199-.232.265-.398.398-.663.132-.265.066-.497-.033-.696-.1-.199-.895-2.158-1.226-2.955-.322-.775-.65-.67-.895-.683l-.762-.013c-.265 0-.696.1-1.061.497-.364.398-1.392 1.36-1.392 3.318s1.426 3.85 1.624 4.115c.199.265 2.806 4.283 6.797 6.007.95.41 1.692.655 2.27.838.953.303 1.822.26 2.508.158.765-.114 2.352-.962 2.684-1.89.332-.928.332-1.723.232-1.89-.099-.166-.364-.265-.762-.464z"/>
        </svg>

        {/* Pulse ring */}
        <span style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          borderRadius: '50%',
          background: 'rgba(37,211,102,0.4)',
          animation: 'waPulse 2s ease-out infinite',
          zIndex: -1,
        }} />
      </a>

      {/* Pulse animation */}
      <style>{`
        @keyframes waPulse {
          0%   { transform: scale(1);   opacity: 0.7; }
          100% { transform: scale(1.7); opacity: 0; }
        }
      `}</style>
    </BrowserRouter>
  );
}