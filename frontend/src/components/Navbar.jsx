import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingBag, User, LogOut, Search, Menu, X, ShieldAlert } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import UnchangedLogo from './UnchangedLogo';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { cartSummary, toggleCart } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/?q=${encodeURIComponent(searchQuery)}`);
    } else {
      navigate('/');
    }
  };

  // Check if we are on checkout page
  const isCheckoutPage = location.pathname === '/checkout';

  if (isCheckoutPage) {
    return (
      <nav style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        height: '64px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0 24px',
        backgroundColor: 'var(--bg-primary)',
        borderBottom: '1px solid var(--border-primary)'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          fontFamily: 'var(--font-heading)',
          fontWeight: 700,
          fontSize: '1rem',
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
          color: 'var(--text-primary)'
        }}>
          <UnchangedLogo size={28} />
          <span>THE UNCHANGED</span>
          <span style={{ fontSize: '0.75rem', fontWeight: 400, color: 'var(--text-secondary)' }}>SECURE CHECKOUT</span>
          <span style={{ fontSize: '0.85rem' }}>🔒</span>
        </div>
      </nav>
    );
  }

  return (
    <>
      <nav style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        height: '74px',
        display: 'flex',
        alignItems: 'center',
        padding: '0 24px',
        backgroundColor: 'var(--bg-primary)',
        borderBottom: '1px solid var(--border-primary)'
      }}>
        <div className="container" style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
          padding: 0
        }}>
          
          {/* Logo */}
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <UnchangedLogo size={36} />
            <span className="brand-name-full" style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '1.4rem',
              fontWeight: 800,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: 'var(--text-primary)'
            }}>THE UNCHANGED</span>
            <span className="brand-name-short" style={{
              display: 'none',
              fontFamily: 'var(--font-heading)',
              fontSize: '1.2rem',
              fontWeight: 800,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: 'var(--text-primary)'
            }}>TU</span>
          </Link>

          {/* Center Links */}
          <div className="desktop-links" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '24px'
          }}>
            <Link to="/" className="nav-link">Shop All</Link>
            <Link to="/?category=man" className="nav-link">Men's Collection</Link>
            <Link to="/?category=woman" className="nav-link">Women's Collection</Link>
            <Link to="/?category=kids" className="nav-link">Kids' Collection</Link>
            <Link to="/about" className="nav-link">Philosophy</Link>
            <Link to="/contact" className="nav-link">Contact</Link>
            {user && (user.is_staff || user.is_superuser) && (
              <Link to="/admin" className="nav-link" style={{ color: 'var(--accent)' }}>Admin Panel</Link>
            )}
          </div>

          {/* Actions & Search */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            
            {/* Minimal Search form */}
            <form onSubmit={handleSearchSubmit} style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center'
            }} className="desktop-search">
              <input
                type="text"
                placeholder="SEARCH..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="form-input"
                style={{
                  padding: '6px 10px 6px 30px',
                  fontSize: '0.75rem',
                  width: '160px',
                  border: '1px solid var(--border-primary)'
                }}
              />
              <Search size={14} style={{
                position: 'absolute',
                left: '10px',
                color: 'var(--text-primary)'
              }} />
            </form>

            {/* Profile */}
            {user ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Link to="/orders" className="btn-icon" title="Order Logs" style={{ width: '36px', height: '36px', borderColor: 'var(--border-primary)' }}>
                  <User size={16} />
                </Link>
                <button onClick={logout} className="btn-icon" title="Sign Out" style={{ width: '36px', height: '36px', color: 'var(--accent)', borderColor: 'var(--border-primary)' }}>
                  <LogOut size={16} />
                </button>
              </div>
            ) : (
              <Link to="/auth" className="nav-link" style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>
                Sign In
              </Link>
            )}

            {/* Cart Button */}
            <button onClick={toggleCart} className="btn-icon" style={{ 
              position: 'relative',
              width: '36px',
              height: '36px',
              borderColor: 'var(--border-primary)'
            }}>
              <ShoppingBag size={16} />
              {cartSummary.item_count > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '-4px',
                  right: '-4px',
                  background: 'var(--text-primary)',
                  color: 'var(--bg-primary)',
                  fontSize: '0.65rem',
                  fontWeight: 800,
                  width: '16px',
                  height: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid var(--bg-primary)'
                }}>
                  {cartSummary.item_count}
                </span>
              )}
            </button>

            {/* Mobile Menu */}
            <button className="mobile-menu-toggle btn-icon" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} style={{ display: 'none', width: '36px', height: '36px', borderColor: 'var(--border-primary)' }}>
              {mobileMenuOpen ? <X size={16} /> : <Menu size={16} />}
            </button>

          </div>
        </div>
      </nav>

      {/* Mobile Drawer menu */}
      {mobileMenuOpen && (
        <div style={{
          position: 'fixed',
          top: '74px',
          left: 0,
          right: 0,
          bottom: 0,
          background: 'var(--bg-primary)',
          borderBottom: '1px solid var(--border-primary)',
          zIndex: 49,
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          boxShadow: 'var(--shadow-md)',
          overflowY: 'auto'
        }} className="animate-fade-in">
          <form onSubmit={(e) => { e.preventDefault(); if(searchQuery.trim()) { navigate(`/?q=${encodeURIComponent(searchQuery)}`); } setMobileMenuOpen(false); }} style={{ display: 'flex', gap: '8px' }}>
            <input
              type="text"
              placeholder="SEARCH..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-input"
              style={{ flex: 1, padding: '10px 14px', fontSize: '0.8rem', border: '1px solid var(--border-primary)' }}
            />
            <button type="submit" className="btn btn-primary" style={{ padding: '10px 16px', fontSize: '0.75rem' }}>GO</button>
          </form>
          <hr style={{ border: 'none', borderBottom: '1px solid var(--border-light)' }} />
          <Link to="/" onClick={() => setMobileMenuOpen(false)} className="nav-link">Shop All</Link>
          <Link to="/?category=man" onClick={() => setMobileMenuOpen(false)} className="nav-link">Men's Collection</Link>
          <Link to="/?category=woman" onClick={() => setMobileMenuOpen(false)} className="nav-link">Women's Collection</Link>
          <Link to="/?category=kids" onClick={() => setMobileMenuOpen(false)} className="nav-link">Kids' Collection</Link>
          <Link to="/about" onClick={() => setMobileMenuOpen(false)} className="nav-link">Philosophy</Link>
          <Link to="/contact" onClick={() => setMobileMenuOpen(false)} className="nav-link">Contact</Link>
          {user && (
            <Link to="/orders" onClick={() => setMobileMenuOpen(false)} className="nav-link">Your Orders</Link>
          )}
          {user && (user.is_staff || user.is_superuser) && (
            <Link to="/admin" onClick={() => setMobileMenuOpen(false)} className="nav-link" style={{ color: 'var(--accent)' }}>Admin Panel</Link>
          )}
        </div>
      )}

      <style>{`
        .nav-link {
          font-family: var(--font-heading);
          font-size: 0.85rem;
          font-weight: 700;
          color: var(--text-primary);
          text-transform: uppercase;
          letter-spacing: 0.08em;
          padding: 4px 0;
          position: relative;
        }
        .nav-link::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 1px;
          background: var(--text-primary);
          transform: scaleX(0);
          transition: transform 0.2s ease;
        }
        .nav-link:hover::after {
          transform: scaleX(1);
        }
        @media (max-width: 900px) {
          .desktop-links, .desktop-search {
            display: none !important;
          }
          .mobile-menu-toggle {
            display: flex !important;
          }
          .brand-name-full {
            display: none !important;
          }
          .brand-name-short {
            display: inline !important;
          }
        }
      `}</style>
    </>
  );
};

export default Navbar;
