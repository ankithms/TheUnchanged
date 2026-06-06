import React from 'react';
import { useNavigate } from 'react-router-dom';
import { X, ShoppingBag, Plus, Minus, Trash2 } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { getMediaUrl } from '../context/AuthContext';

const CartDrawer = () => {
  const { 
    cartItems, cartSummary, isCartOpen, closeCart, 
    updateCartItem, removeCartItem 
  } = useCart();
  const navigate = useNavigate();

  const handleCheckoutClick = () => {
    closeCart();
    navigate('/checkout');
  };

  const handleQtyChange = (item, diff) => {
    const newQty = item.quantity + diff;
    if (newQty <= 0) {
      removeCartItem(item.id);
    } else {
      updateCartItem(item.id, newQty, item.size, item.color);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`drawer-backdrop ${isCartOpen ? 'active' : ''}`} 
        onClick={closeCart}
      />

      {/* Drawer Body */}
      <div className={`drawer ${isCartOpen ? 'active' : ''}`}>
        
        {/* Header */}
        <div style={{
          padding: '24px',
          borderBottom: '1px solid var(--border-primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: 'var(--bg-secondary)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <ShoppingBag size={18} style={{ color: 'var(--text-primary)' }} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Your Bag</h3>
            <span style={{
              fontSize: '0.8rem',
              color: 'var(--text-secondary)',
              fontWeight: 600
            }}>({cartSummary.item_count})</span>
          </div>
          <button onClick={closeCart} className="btn-icon" style={{ width: '32px', height: '32px', border: '1px solid var(--border-primary)' }}>
            <X size={14} />
          </button>
        </div>

        {/* Content */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          backgroundColor: 'var(--bg-primary)'
        }}>
          {cartItems.length === 0 ? (
            <div style={{
              margin: 'auto',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '16px'
            }}>
              <ShoppingBag size={40} style={{ color: 'var(--text-secondary)' }} />
              <p style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-heading)', fontWeight: 700 }}>YOUR BAG IS EMPTY.</p>
              <button onClick={closeCart} className="btn btn-primary" style={{ padding: '10px 20px', fontSize: '0.8rem' }}>
                SHOP ALL
              </button>
            </div>
          ) : (
            cartItems.map((item) => (
              <div key={item.id} style={{
                display: 'flex',
                gap: '16px',
                paddingBottom: '20px',
                borderBottom: '1px solid var(--border-light)'
              }}>
                {/* Product Image */}
                <div style={{
                  width: '74px',
                  height: '92px',
                  border: '1px solid var(--border-primary)',
                  overflow: 'hidden',
                  flexShrink: 0,
                  backgroundColor: 'var(--bg-secondary)'
                }}>
                  <img 
                    src={getMediaUrl(item.subproduct.image) || 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=500&auto=format&fit=crop&q=60'} 
                    alt={item.subproduct.product.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>

                {/* Details */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <h4 style={{ fontSize: '0.85rem', fontWeight: 700, fontFamily: 'var(--font-heading)', textTransform: 'uppercase', letterSpacing: '0.02em' }}>
                    {item.subproduct.product.name}
                  </h4>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    SIZE: <span style={{ color: 'var(--text-primary)', fontWeight: 700, marginRight: '12px' }}>{item.size}</span>
                    COLOR: <span style={{ color: 'var(--text-primary)', fontWeight: 700 }}>{item.color}</span>
                  </p>
                  
                  {/* Controls */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginTop: '12px'
                  }}>
                    {/* Qty Switcher */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      background: 'transparent',
                      border: '1px solid var(--border-primary)',
                      padding: '2px'
                    }}>
                      <button 
                        onClick={() => handleQtyChange(item, -1)}
                        style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-primary)', padding: '2px 8px' }}
                      >
                        <Minus size={12} />
                      </button>
                      <span style={{ fontSize: '0.8rem', fontWeight: 700, padding: '0 4px', minWidth: '24px', textAlign: 'center' }}>
                        {item.quantity}
                      </span>
                      <button 
                        onClick={() => handleQtyChange(item, 1)}
                        style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-primary)', padding: '2px 8px' }}
                      >
                        <Plus size={12} />
                      </button>
                    </div>

                    {/* Trash */}
                    <button 
                      onClick={() => removeCartItem(item.id)} 
                      style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                      title="Remove item"
                    >
                      <Trash2 size={14} className="trash-hover" />
                    </button>
                  </div>
                </div>

                {/* Price */}
                <div style={{ textAlign: 'right', fontWeight: 700, fontSize: '0.85rem', fontFamily: 'var(--font-heading)' }}>
                  ₹{item.total_price}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Summary */}
        {cartItems.length > 0 && (
          <div style={{
            padding: '24px',
            borderTop: '1px solid var(--border-primary)',
            backgroundColor: 'var(--bg-secondary)',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                <span>Subtotal</span>
                <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>₹{cartSummary.total_amount}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                <span>Shipping</span>
                <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>₹{cartSummary.shipping_charge}</span>
              </div>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '1rem',
                fontWeight: 800,
                fontFamily: 'var(--font-heading)',
                borderTop: '1px solid var(--border-primary)',
                paddingTop: '12px',
                marginTop: '4px',
                color: 'var(--text-primary)'
              }}>
                <span>Total</span>
                <span>₹{cartSummary.grand_total}</span>
              </div>
            </div>

            <button onClick={handleCheckoutClick} className="btn btn-primary" style={{ width: '100%', padding: '14px', fontSize: '0.85rem' }}>
              PROCEED TO CHECKOUT
            </button>
          </div>
        )}
      </div>

      <style>{`
        .trash-hover:hover {
          color: var(--accent) !important;
        }
      `}</style>
    </>
  );
};

export default CartDrawer;
