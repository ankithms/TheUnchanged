import React from 'react';
import { Link } from 'react-router-dom';
import { Eye, AlertCircle } from 'lucide-react';
import { getMediaUrl } from '../context/AuthContext';

const ProductCard = ({ product }) => {
  const isOutOfStock = product.stock_quantity <= 0;
  const isLowStock = product.stock_quantity > 0 && product.stock_quantity <= 5;

  // Dynamic tags/badges based on product attributes
  const isLimited = product.product.price > 85; 
  const isNewArrival = product.id % 2 === 0;

  return (
    <div className="product-card" style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      position: 'relative',
      backgroundColor: 'transparent'
    }}>
      {/* Image container */}
      <Link to={`/products/${product.id}`} className="image-wrapper" style={{
        aspectRatio: '3/4',
        overflow: 'hidden',
        position: 'relative',
        backgroundColor: 'var(--bg-secondary)',
        border: '1px solid var(--border-primary)',
        cursor: 'pointer'
      }}>
        <img 
          src={getMediaUrl(product.image) || 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=500&auto=format&fit=crop&q=60'} 
          alt={product.product.name} 
          className="product-image"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
          }}
        />

        {/* Stock / Promotion Badges */}
        <div style={{ position: 'absolute', top: '12px', left: '12px', zIndex: 10, display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {isOutOfStock ? (
            <span className="badge badge-error">Sold Out</span>
          ) : isLowStock ? (
            <span className="badge badge-warning" style={{ background: 'var(--bg-primary)', color: 'var(--accent)' }}>
              Only {product.stock_quantity} left
            </span>
          ) : isLimited ? (
            <span className="badge" style={{ backgroundColor: 'var(--accent)', color: '#ffffff', borderColor: 'var(--accent)', fontSize: '0.65rem' }}>Limited</span>
          ) : isNewArrival ? (
            <span className="badge" style={{ backgroundColor: 'var(--border-primary)', color: '#ffffff', borderColor: 'var(--border-primary)', fontSize: '0.65rem' }}>New Arrival</span>
          ) : null}
        </div>
      </Link>

      {/* Info Block (Editorial typography layout) */}
      <div style={{
        padding: '16px 0',
        display: 'flex',
        flexDirection: 'column',
        gap: '4px'
      }}>
        {/* Title and Price in single row */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          gap: '12px'
        }}>
          <Link to={`/products/${product.id}`} style={{
            fontSize: '1rem',
            fontFamily: 'var(--font-heading)',
            fontWeight: 700,
            lineHeight: '1.3',
            color: 'var(--text-primary)',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            flex: 1
          }} className="title-link">
            {product.product.name}
          </Link>
          
          <span style={{
            fontSize: '1rem',
            fontFamily: 'var(--font-heading)',
            fontWeight: 700,
            color: 'var(--text-primary)'
          }}>
            ₹{product.product.price}
          </span>
        </div>

        {/* Color / Subtitle */}
        <span style={{
          fontSize: '0.8rem',
          color: 'var(--text-secondary)',
          textTransform: 'capitalize'
        }}>
          {product.product_size_color?.[0]?.color || 'Pure Cotton'}
        </span>
      </div>

      <style>{`
        .image-wrapper:hover .product-image {
          transform: scale(1.04);
        }
        .title-link:hover {
          text-decoration: underline;
        }
        @media (max-width: 480px) {
          .product-card .title-link {
            font-size: 0.78rem !important;
          }
          .product-card {
            gap: 0 !important;
          }
        }
      `}</style>
    </div>
  );
};

export default ProductCard;
