import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { API_BASE } from '../context/AuthContext';
import { Loader2, SlidersHorizontal, ArrowDown, Sparkles } from 'lucide-react';

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryParam = searchParams.get('category');
  const queryParam = searchParams.get('q');

  // Local Sizing Toggle state
  const [selectedSizes, setSelectedSizes] = useState([]);
  
  const sizesList = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

  const handleSizeToggle = (size) => {
    if (selectedSizes.includes(size)) {
      setSelectedSizes(selectedSizes.filter(s => s !== size));
    } else {
      setSelectedSizes([...selectedSizes, size]);
    }
  };

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        let url = `${API_BASE}/products/`;
        const params = [];
        
        if (categoryParam) {
          params.push(`category=${encodeURIComponent(categoryParam)}`);
        }
        if (queryParam) {
          params.push(`q=${encodeURIComponent(queryParam)}`);
        }
        
        if (params.length > 0) {
          url += `?${params.join('&')}`;
        }

        const response = await fetch(url);
        if (response.ok) {
          const data = await response.json();
          setProducts(data);
        } else {
          setError('Failed to load products.');
        }
      } catch (err) {
        setError('Network error. Check backend connection.');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [categoryParam, queryParam]);

  // Client-side filtering based on selected sizes
  const filteredProducts = products.filter(product => {
    if (selectedSizes.length === 0) return true;
    // Check if product contains any of the selected sizes in stock
    const availableSizes = product.product_size_color
      .filter(item => item.stock_quantity > 0)
      .map(item => item.size);
    return selectedSizes.some(size => availableSizes.includes(size));
  });

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-primary)' }}>
      
      {/* Editorial Hero Banner */}
      {!queryParam && !categoryParam && (
        <>
          <section style={{
            position: 'relative',
            height: '70vh',
            minHeight: '400px',
            background: 'linear-gradient(rgba(26, 26, 26, 0.35), rgba(26, 26, 26, 0.5)), url("/hero_bg.png")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            borderBottom: '1px solid var(--border-primary)'
          }}>
            <div className="container" style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '20px'
            }}>
              <span style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                color: 'var(--bg-primary)',
                letterSpacing: '0.3em',
                textTransform: 'uppercase'
              }}>ESTABLISHED FOREVER</span>
              
              <h1 style={{
                fontFamily: 'var(--font-heading)',
                fontSize: 'clamp(2.5rem, 7vw, 4.5rem)',
                fontWeight: 700,
                color: 'var(--bg-primary)',
                letterSpacing: '0.04em',
                lineHeight: '1.1',
                textTransform: 'uppercase'
              }}>
                STAY THE SAME.<br/>ALWAYS.
              </h1>
              
              <div style={{ display: 'flex', gap: '16px', marginTop: '24px', flexWrap: 'wrap', justifyContent: 'center' }}>
                <a href="#shop-catalog" className="btn btn-secondary" style={{
                  color: 'var(--bg-primary)',
                  borderColor: 'var(--bg-primary)',
                  padding: '12px 28px'
                }}>
                  Shop Archive
                </a>
                <Link to="/about" className="btn btn-secondary" style={{
                  color: 'var(--bg-primary)',
                  borderColor: 'var(--bg-primary)',
                  padding: '12px 28px'
                }}>
                  Our Story
                </Link>
              </div>
            </div>

            <div style={{
              position: 'absolute',
              bottom: '24px',
              left: '50%',
              transform: 'translateX(-50%)',
              color: 'var(--bg-primary)',
              animation: 'bounce 2s infinite',
              cursor: 'pointer'
            }} onClick={() => document.getElementById('manifesto').scrollIntoView({ behavior: 'smooth' })}>
              <ArrowDown size={20} />
            </div>
          </section>

          {/* Slanted Marquee ticker */}
          <div className="marquee-container" style={{ margin: 0 }}>
            <div className="marquee-content">
              LONGEVITY • AUTHENTICITY • STRUCTURAL INTEGRITY • HISTORICAL CRAFTSMANSHIP • NO TRENDS • JUST PERMANENCE • STAY THE SAME, ALWAYS •&nbsp;
              LONGEVITY • AUTHENTICITY • STRUCTURAL INTEGRITY • HISTORICAL CRAFTSMANSHIP • NO TRENDS • JUST PERMANENCE • STAY THE SAME, ALWAYS •
            </div>
          </div>

          {/* Manifesto No. 01 */}
          <section id="manifesto" style={{ padding: '80px 0', borderBottom: '1px solid var(--border-light)' }}>
            <div className="container">
              <span style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                color: 'var(--accent)',
                letterSpacing: '0.15em',
                textTransform: 'uppercase'
              }}>Manifesto No. 01</span>
              
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '40px',
                marginTop: '16px',
                alignItems: 'baseline'
              }}>
                <h2 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 700, textTransform: 'uppercase', lineHeight: '1.1' }}>
                  Made for the<br/>Unchanged.
                </h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', lineHeight: '1.7', alignSelf: 'center' }}>
                  We exist for those who value the permanence of form over the volatility of trends. A celebration of items that earn their character through time.
                </p>
              </div>

              {/* Side by side blocks */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                gap: '48px',
                marginTop: '60px',
                alignItems: 'center'
              }}>
                <div style={{
                  border: '1px solid var(--border-primary)',
                  height: 'auto',
                  minHeight: '280px',
                  maxHeight: '420px',
                  overflow: 'hidden'
                }}>
                  <img 
                    src="/manifesto_fabric.png" 
                    alt="Raw fabric zoom" 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  <h3 style={{ fontSize: '1.5rem', fontWeight: 700 }}>The Soul of Permanence</h3>
                  <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                    In an era of planned obsolescence, "The Unchanged" is a rebellion. We believe that an object's value is not found in its novelty, but in its ability to remain relevant across decades.
                  </p>
                  <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                    Our design language is rooted in the industrial era—a time when things were built once and built right. We don't innovate for the sake of change; we refine for the sake of perfection.
                  </p>
                  
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '20px',
                    marginTop: '12px'
                  }}>
                    <div>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-primary)' }}>01. Materials</span>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>Raw selvedge, heavy-gauge steel, and vegetable-tanned leathers.</p>
                    </div>
                    <div>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-primary)' }}>02. Method</span>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>Traditional bench-craft combined with rigorous structural testing.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Featured Collections Asymmetric Grid */}
          <section style={{ padding: '80px 0', borderBottom: '1px solid var(--border-light)' }}>
            <div className="container">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '32px' }}>
                <h2 style={{ fontSize: '1.75rem', fontWeight: 700, textTransform: 'uppercase' }}>Featured Collections</h2>
                <a href="#shop-catalog" style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', textDecoration: 'underline' }}>View All Series 01</a>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '24px'
              }} className="featured-grid">
                
                {/* Vintage Rides */}
                <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ height: '240px', overflow: 'hidden', border: '1px solid var(--border-primary)' }}>
                    <img src="/featured_vintage.png" alt="Vintage Auto graphic t-shirt" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <div>
                    <span style={{ fontSize: '0.7rem', color: 'var(--accent)', fontWeight: 700, textTransform: 'uppercase' }}>Limited Release</span>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginTop: '4px' }}>Vintage Auto Tee</h3>
                  </div>
                </div>

                {/* Monte Carlo */}
                <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ height: '240px', overflow: 'hidden', border: '1px solid var(--border-primary)' }}>
                    <img src="/featured_montecarlo.png" alt="Monte Carlo heavy crewnecks" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <div>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase' }}>Shop Summer</span>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginTop: '4px' }}>Monte Carlo Crew</h3>
                  </div>
                </div>

                {/* Manifesto Text Box */}
                <div style={{
                  padding: '40px 30px',
                  backgroundColor: 'var(--bg-secondary)',
                  border: '1px solid var(--border-primary)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  gap: '16px'
                }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase' }}>The Archive No. 04</span>
                  <h3 style={{ fontSize: '1.3rem', fontWeight: 700, lineHeight: '1.3' }}>Every piece is a rebellion against the temporary.</h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                    We don't design for the season; we design for the century. Our garments are constructed using heavy-weight textiles and traditional techniques.
                  </p>
                </div>

              </div>
            </div>
          </section>

          {/* The Craft Section */}
          <section style={{ padding: '80px 0', borderBottom: '1px solid var(--border-primary)' }}>
            <div className="container">
              <div style={{ textAlign: 'center', marginBottom: '48px' }}>
                <h2 style={{ fontSize: '2rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>The Craft</h2>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Technical Schematics & Artistry</span>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: '24px'
              }}>
                <div className="glass-panel" style={{ padding: '30px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <span style={{ fontSize: '1.2rem' }}>📐</span>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Precision Grid</h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                    Every seam is calculated. We follow a strict geometric rhythm that ensures balance and durability in every piece we produce.
                  </p>
                </div>

                <div className="glass-panel" style={{ padding: '30px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <span style={{ fontSize: '1.2rem' }}>📁</span>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>The Archive</h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                    Our inspiration comes from the 1920s–40s industrial functionalism. We study the past to build a future that doesn't expire.
                  </p>
                </div>

                <div className="glass-panel" style={{ padding: '30px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <span style={{ fontSize: '1.2rem' }}>🔨</span>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Textile Logic</h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                    Interaction is physical. The weight of a zipper, the texture of the canvas, the sound of a button—it all matters.
                  </p>
                </div>
              </div>
            </div>
          </section>
        </>
      )}

      {/* Main Content Catalog Grid */}
      <main className="container" id="shop-catalog" style={{ marginTop: '60px', paddingBottom: '60px' }}>
        
        {/* Split screen Catalog */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '240px 1fr',
          gap: '40px',
          alignItems: 'start'
        }} className="catalog-layout">
          
          {/* Left Sidebar Filter Section */}
          <aside className="sidebar-filters" style={{
            position: 'sticky',
            top: '94px',
            display: 'flex',
            flexDirection: 'column',
            gap: '32px'
          }}>
            {/* Category Lists */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <h3 style={{ 
                fontSize: '0.8rem', 
                fontWeight: 700, 
                textTransform: 'uppercase', 
                letterSpacing: '0.1em',
                color: 'var(--text-primary)',
                borderBottom: '1px solid var(--border-primary)',
                paddingBottom: '8px'
              }}>Collections</h3>
              <Link to="/" className="sidebar-link">Show All</Link>
              <Link to="/?category=man" className="sidebar-link">Men's Collection</Link>
              <Link to="/?category=woman" className="sidebar-link">Women's Collection</Link>
              <Link to="/?category=kids" className="sidebar-link">Kids' Collection</Link>
            </div>

            {/* Sizing box filters */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <h3 style={{ 
                fontSize: '0.8rem', 
                fontWeight: 700, 
                textTransform: 'uppercase', 
                letterSpacing: '0.1em',
                color: 'var(--text-primary)',
                borderBottom: '1px solid var(--border-primary)',
                paddingBottom: '8px'
              }}>Size</h3>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '8px'
              }}>
                {sizesList.map((size) => {
                  const isSelected = selectedSizes.includes(size);
                  return (
                    <button
                      key={size}
                      onClick={() => handleSizeToggle(size)}
                      style={{
                        padding: '8px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        border: '1px solid var(--border-primary)',
                        backgroundColor: isSelected ? 'var(--border-primary)' : 'transparent',
                        color: isSelected ? 'var(--bg-primary)' : 'var(--text-primary)',
                        cursor: 'pointer',
                        textAlign: 'center',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Sort options */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <h3 style={{ 
                fontSize: '0.8rem', 
                fontWeight: 700, 
                textTransform: 'uppercase', 
                letterSpacing: '0.1em',
                color: 'var(--text-primary)',
                borderBottom: '1px solid var(--border-primary)',
                paddingBottom: '8px'
              }}>Sort By</h3>
              <select className="form-input" style={{
                fontSize: '0.75rem',
                padding: '8px',
                border: '1px solid var(--border-primary)',
                cursor: 'pointer',
                background: 'transparent'
              }}>
                <option>RECOMMENDED</option>
                <option>PRICE: LOW TO HIGH</option>
                <option>PRICE: HIGH TO LOW</option>
              </select>
            </div>
          </aside>

          {/* Right Product Grid */}
          <section className="catalog-grid-area" style={{ width: '100%' }}>
            
            {/* Catalog Info Header */}
            <div style={{
              marginBottom: '32px',
              borderBottom: '1px solid var(--border-primary)',
              paddingBottom: '16px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'baseline'
            }}>
              <div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, textTransform: 'uppercase' }}>
                  {queryParam ? `SEARCH: "${queryParam}"` : categoryParam ? `${categoryParam} garments` : 'Shop All'}
                </h2>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Sustainably sourced, heavyweight cotton garments designed for the passage of time. Our signature oversized fit, engineered to retain its silhouette through every wear.
                </p>
              </div>
            </div>

            {loading ? (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '260px',
                gap: '12px'
              }}>
                <Loader2 size={32} className="spinner" style={{ color: 'var(--text-primary)' }} />
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Loading Archive...</span>
              </div>
            ) : error ? (
              <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', borderColor: 'var(--accent)' }}>
                <p style={{ color: 'var(--accent)', fontWeight: 700 }}>{error}</p>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '60px 20px',
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid var(--border-primary)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '12px'
              }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>NO GARMENTS MATCH FILTERS</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Try clearing size filters or collections.</p>
                <button onClick={() => { setSelectedSizes([]); setSearchParams({}); }} className="btn btn-secondary" style={{ padding: '8px 16px', fontSize: '0.75rem' }}>
                  CLEAR ALL FILTERS
                </button>
              </div>
            ) : (
              <div className="grid-catalog animate-fade-in" style={{
                gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
                gap: '30px'
              }}>
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </section>

        </div>
      </main>

      <style>{`
        .sidebar-link {
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          transition: color 0.15s ease;
          padding: 2px 0;
        }
        .sidebar-link:hover {
          color: var(--text-primary);
          text-decoration: underline;
        }
        .spinner {
          animation: spin 1.2s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% { transform: translateY(0) translateX(-50%); }
          40% { transform: translateY(-8px) translateX(-50%); }
          60% { transform: translateY(-4px) translateX(-50%); }
        }
        @media (max-width: 900px) {
          .catalog-layout {
            grid-template-columns: 1fr !important;
          }
          .sidebar-filters {
            position: relative !important;
            top: 0 !important;
            flex-direction: row !important;
            flex-wrap: wrap !important;
            gap: 16px !important;
            margin-bottom: 24px;
            padding-bottom: 24px;
            border-bottom: 1px solid var(--border-light);
          }
        }
        @media (max-width: 768px) {
          .catalog-layout {
            gap: 20px !important;
          }
        }
        @media (max-width: 480px) {
          .catalog-layout {
            gap: 16px !important;
          }
        }
      `}</style>
    </div>
  );
};

export default Home;
