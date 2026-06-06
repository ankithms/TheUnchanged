import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import UnchangedLogo from './UnchangedLogo';

const Footer = () => {
  const handleSubscribe = (e) => {
    e.preventDefault();
    alert('Thank you for subscribing to The Unchanged Archives.');
  };

  return (
    <footer className="site-footer" style={{
      backgroundColor: 'var(--bg-secondary)',
      borderTop: '1px solid var(--border-primary)',
      padding: '64px 24px 32px',
      marginTop: '80px'
    }}>
      <div className="container" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '40px',
        paddingBottom: '48px',
        borderBottom: '1px solid var(--border-light)'
      }}>
        
        {/* Left Column: Brand statement */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <UnchangedLogo size={32} />
            <h3 style={{
              fontSize: '1.25rem',
              fontFamily: 'var(--font-heading)',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.08em'
            }}>The Unchanged</h3>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.6', maxWidth: '280px' }}>
            Building garments that ignore trends in favor of structural integrity. Stay the same, always.
          </p>
        </div>

        {/* Center-Left: Service info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <h4 style={{ 
            fontSize: '0.75rem', 
            fontWeight: 700, 
            textTransform: 'uppercase', 
            letterSpacing: '0.1em',
            color: 'var(--text-primary)',
            marginBottom: '8px'
          }}>Service</h4>
          <Link to="/about" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }} className="footer-link">Shipping Information</Link>
          <Link to="/about" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }} className="footer-link">Returns & Exchanges</Link>
          <Link to="/about" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }} className="footer-link">Size Guide</Link>
        </div>

        {/* Center-Right: Connect info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <h4 style={{ 
            fontSize: '0.75rem', 
            fontWeight: 700, 
            textTransform: 'uppercase', 
            letterSpacing: '0.1em',
            color: 'var(--text-primary)',
            marginBottom: '8px'
          }}>Connect</h4>
          <a href="https://instagram.com" target="_blank" rel="noreferrer" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }} className="footer-link">Instagram</a>
          <a href="mailto:archive@theunchanged.com" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }} className="footer-link">Email Support</a>
          <Link to="/about" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }} className="footer-link">Brand Philosophy</Link>
        </div>

        {/* Right Column: Newsletter signup */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <h4 style={{ 
            fontSize: '0.75rem', 
            fontWeight: 700, 
            textTransform: 'uppercase', 
            letterSpacing: '0.1em',
            color: 'var(--text-primary)',
            marginBottom: '8px'
          }}>Newsletter</h4>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: '1.4', marginBottom: '8px' }}>
            Stay the same, always. Updates on rare archival releases.
          </p>
          <form onSubmit={handleSubscribe} style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <input 
              type="email" 
              placeholder="YOUR@EMAIL.COM" 
              required
              className="form-input"
              style={{
                fontSize: '0.75rem',
                padding: '12px 40px 12px 12px',
                border: '1px solid var(--border-primary)',
                background: 'transparent'
              }}
            />
            <button type="submit" style={{
              position: 'absolute',
              right: '12px',
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              color: 'var(--text-primary)'
            }} aria-label="Subscribe">
              <ArrowUpRight size={18} />
            </button>
          </form>
        </div>

      </div>

      {/* Footer copyright */}
      <div className="container" style={{
        paddingTop: '24px',
        textAlign: 'left',
        fontSize: '0.75rem',
        color: 'var(--text-muted)',
        display: 'flex',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
        paddingLeft: 0,
        paddingRight: 0
      }}>
        <span>&copy; {new Date().getFullYear()} The Unchanged Studios. Stay the same, always.</span>
        <span>Built for Longevity & Structural Integrity.</span>
      </div>

      <style>{`
        .footer-link:hover {
          color: var(--text-primary) !important;
          text-decoration: underline;
        }
        @media (max-width: 768px) {
          .site-footer {
            padding: 40px 16px 24px !important;
            margin-top: 40px !important;
          }
        }
      `}</style>
    </footer>
  );
};

export default Footer;
