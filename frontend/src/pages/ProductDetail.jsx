import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Loader2, ArrowLeft, ShoppingCart, Info, AlertTriangle, ShieldCheck } from 'lucide-react';
import { useAuth, API_BASE, getMediaUrl } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const ProductDetail = () => {
  const { id } = useParams();
  const { token } = useAuth();
  const { addToCart } = useCart();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Selections
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`${API_BASE}/products/${id}/`);
        if (response.ok) {
          const data = await response.json();
          setProduct(data);
        } else {
          setError('Product not found.');
        }
      } catch (err) {
        setError('Network error.');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '400px',
        gap: '12px'
      }}>
        <Loader2 size={32} className="spinner" style={{ color: 'var(--text-primary)' }} />
        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Loading item specs...</span>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container" style={{ marginTop: '40px', textAlign: 'center', minHeight: '300px' }}>
        <p style={{ color: 'var(--error)', fontSize: '1.1rem', fontWeight: 600 }}>{error || 'Could not load details.'}</p>
        <Link to="/" className="btn btn-secondary" style={{ marginTop: '20px' }}>
          <ArrowLeft size={16} /> Back to Shop
        </Link>
      </div>
    );
  }

  // Extract unique sizes from product_size_color
  const sizes = [...new Set(product.product_size_color.map(item => item.size))];

  // Extract available colors for the selected size
  const colors = selectedSize 
    ? [...new Set(product.product_size_color
        .filter(item => item.size === selectedSize)
        .map(item => item.color))]
    : [...new Set(product.product_size_color.map(item => item.color))];

  // Find stock for selected size and color combination
  const selectedCombination = product.product_size_color.find(
    item => item.size === selectedSize && item.color === selectedColor
  );

  const stock = selectedCombination ? selectedCombination.stock_quantity : 0;
  const isOutOfStock = selectedSize && selectedColor && stock <= 0;
  const isLowStock = selectedSize && selectedColor && stock > 0 && stock <= 5;

  const handleAddToCart = async () => {
    setMessage(null);
    if (!selectedSize || !selectedColor) {
      setMessage({ type: 'error', text: 'Select valid Size and Color before adding.' });
      return;
    }

    if (stock <= 0) {
      setMessage({ type: 'error', text: 'This specification is out of stock.' });
      return;
    }

    setAdding(true);
    const result = await addToCart(product.id, quantity, selectedSize, selectedColor);
    setAdding(false);

    if (result.success) {
      setMessage({ type: 'success', text: 'Specification added to your bag.' });
    } else {
      setMessage({ type: 'error', text: result.error || 'Failed to add item to cart.' });
    }
  };

  const handleQtyChange = (val) => {
    const nextVal = quantity + val;
    if (nextVal >= 1 && (!selectedCombination || nextVal <= stock)) {
      setQuantity(nextVal);
    }
  };

  if (selectedCombination && quantity > stock && stock > 0) {
    setQuantity(stock);
  }

  return (
    <div className="container animate-fade-in" style={{ marginTop: '40px', paddingBottom: '80px' }}>
      
      <Link to="/" style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        fontSize: '0.8rem',
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        color: 'var(--text-secondary)',
        marginBottom: '32px'
      }} className="back-link">
        <ArrowLeft size={14} /> Back to Catalog
      </Link>

      <div className="product-detail-grid" style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '48px',
        alignItems: 'start'
      }}>
        
        {/* Left Side: Product Image */}
        <div style={{
          backgroundColor: 'var(--bg-secondary)',
          border: '1px solid var(--border-primary)',
          overflow: 'hidden',
          aspectRatio: '3/4'
        }}>
          <img 
            src={getMediaUrl(product.image) || 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&auto=format&fit=crop&q=60'} 
            alt={product.product.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </div>

        {/* Right Side: Product Details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Category & Title */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <span style={{
              fontSize: '0.75rem',
              color: 'var(--accent)',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.15em'
            }}>
              {product.product.category.name}
            </span>
            <h1 style={{ fontSize: 'clamp(1.4rem, 4vw, 2rem)', fontWeight: 800, textTransform: 'uppercase', lineHeight: '1.2' }}>
              {product.product.name}
            </h1>
            <div style={{
              fontSize: '1.6rem',
              fontFamily: 'var(--font-heading)',
              fontWeight: 700,
              color: 'var(--text-primary)',
              marginTop: '8px'
            }}>
              ₹{product.product.price}
            </div>
          </div>

          <hr style={{ border: 'none', borderBottom: '1px solid var(--border-primary)' }} />

          {/* Description */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <h3 style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-primary)', letterSpacing: '0.05em' }}>
              Garment Specs
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.6' }}>
              {product.description || 'Sustainably sourced heavyweight fabric engineered for absolute permanence.'}
            </p>
          </div>

          <hr style={{ border: 'none', borderBottom: '1px solid var(--border-primary)' }} />

          {/* Sizing Select (Square toggle blocks) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <h3 style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-primary)', letterSpacing: '0.05em' }}>
                Select Size
              </h3>
            </div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {sizes.map((size) => {
                const isSelected = selectedSize === size;
                return (
                  <button
                    key={size}
                    onClick={() => {
                      setSelectedSize(size);
                      setSelectedColor('');
                      setMessage(null);
                    }}
                    style={{
                      width: '48px',
                      height: '48px',
                      border: '1px solid var(--border-primary)',
                      background: isSelected ? 'var(--border-primary)' : 'transparent',
                      color: isSelected ? 'var(--bg-primary)' : 'var(--text-primary)',
                      fontWeight: 700,
                      fontSize: '0.8rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {size}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Color Select */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <h3 style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-primary)', letterSpacing: '0.05em' }}>
                Select Color
              </h3>
            </div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {colors.map((color) => {
                const isSelected = selectedColor === color;
                return (
                  <button
                    key={color}
                    onClick={() => {
                      setSelectedColor(color);
                      setMessage(null);
                    }}
                    style={{
                      padding: '10px 16px',
                      border: '1px solid var(--border-primary)',
                      background: isSelected ? 'var(--border-primary)' : 'transparent',
                      color: isSelected ? 'var(--bg-primary)' : 'var(--text-secondary)',
                      fontWeight: 700,
                      fontSize: '0.75rem',
                      textTransform: 'uppercase',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {color}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Stock Notification */}
          {selectedSize && selectedColor && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px',
              border: '1px solid var(--border-primary)',
              background: 'transparent',
              fontSize: '0.85rem'
            }}>
              {isOutOfStock ? (
                <>
                  <span style={{ width: '8px', height: '8px', backgroundColor: 'var(--accent)' }} />
                  <span style={{ color: 'var(--accent)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.02em' }}>OUT OF STOCK.</span>
                </>
              ) : isLowStock ? (
                <>
                  <span style={{ width: '8px', height: '8px', backgroundColor: 'var(--accent)' }} />
                  <span style={{ color: 'var(--text-primary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.02em' }}>LOW STOCK: ONLY {stock} LEFT.</span>
                </>
              ) : (
                <>
                  <span style={{ width: '8px', height: '8px', backgroundColor: 'var(--border-primary)' }} />
                  <span style={{ color: 'var(--text-primary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.02em' }}>SPECIFICATION IN STOCK.</span>
                </>
              )}
            </div>
          )}

          {/* Quantity & Actions */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            marginTop: '8px',
            flexWrap: 'wrap'
          }}>
            {/* Quantity Selector */}
            {!isOutOfStock && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-primary)', textTransform: 'uppercase' }}>QTY</span>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  background: 'transparent',
                  border: '1px solid var(--border-primary)',
                  padding: '2px'
                }}>
                  <button 
                    onClick={() => handleQtyChange(-1)}
                    disabled={quantity <= 1 || isOutOfStock}
                    style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-primary)', padding: '6px 12px', fontWeight: 700 }}
                  >
                    -
                  </button>
                  <span style={{ fontSize: '0.9rem', fontWeight: 700, minWidth: '24px', textAlign: 'center' }}>
                    {quantity}
                  </span>
                  <button 
                    onClick={() => handleQtyChange(1)}
                    disabled={selectedCombination && quantity >= stock}
                    style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-primary)', padding: '6px 12px', fontWeight: 700 }}
                  >
                    +
                  </button>
                </div>
              </div>
            )}

            {/* Add to Cart CTA */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px', width: '100%', minWidth: '180px' }}>
              <span style={{ display: 'none' }}>Actions</span>
              {token ? (
                <button
                  onClick={handleAddToCart}
                  disabled={adding || isOutOfStock || !selectedSize || !selectedColor}
                  className="btn btn-primary"
                  style={{
                    width: '100%',
                    padding: '14px',
                    height: '48px',
                    alignSelf: 'flex-end',
                    fontSize: '0.8rem'
                  }}
                >
                  {adding ? (
                    <Loader2 size={16} className="spinner" />
                  ) : (
                    'ADD TO BAG'
                  )}
                </button>
              ) : (
                <Link 
                  to="/auth" 
                  className="btn btn-primary"
                  style={{
                    width: '100%',
                    padding: '14px',
                    height: '48px',
                    alignSelf: 'flex-end',
                    fontSize: '0.8rem',
                    textAlign: 'center'
                  }}
                >
                  SIGN IN TO PURCHASE
                </Link>
              )}
            </div>
          </div>

          {/* Feedback Messages */}
          {message && (
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '8px',
              padding: '12px',
              border: '1px solid',
              borderColor: message.type === 'error' ? 'var(--accent)' : 'var(--border-primary)',
              fontSize: '0.8rem',
              color: 'var(--text-primary)',
              fontWeight: 600,
              textTransform: 'uppercase'
            }}>
              <span>{message.text}</span>
            </div>
          )}

        </div>

      </div>

      <style>{`
        .back-link:hover {
          text-decoration: underline;
        }
        .spinner {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @media (max-width: 768px) {
          .product-detail-grid {
            grid-template-columns: 1fr !important;
            gap: 24px !important;
          }
        }
      `}</style>
    </div>
  );
};

export default ProductDetail;
