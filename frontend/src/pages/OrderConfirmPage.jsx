import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Loader2, Calendar, FileText, ArrowRight, Check } from 'lucide-react';
import { useAuth, API_BASE, getMediaUrl } from '../context/AuthContext';

const OrderConfirmPage = () => {
  const { orderId } = useParams();
  const { token } = useAuth();
  
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;

    const fetchOrderDetails = async () => {
      try {
        const response = await fetch(`${API_BASE}/orders/${orderId}/`, {
          headers: {
            'Authorization': `Token ${token}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          setOrder(data);
        }
      } catch (err) {
        console.error('Error loading details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId, token]);

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
        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Loading receipt...</span>
      </div>
    );
  }

  return (
    <div className="container animate-fade-in" style={{
      maxWidth: '640px',
      marginTop: '60px',
      paddingBottom: '80px',
      textAlign: 'center'
    }}>
      
      {/* Editorial Receipt */}
      <div style={{
        padding: '40px 32px',
        backgroundColor: 'var(--bg-secondary)',
        border: '1px solid var(--border-primary)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '20px'
      }}>
        
        {/* Flat check mark */}
        <div style={{
          width: '48px',
          height: '48px',
          border: '2px solid var(--border-primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--text-primary)'
        }}>
          <Check size={24} />
        </div>
        
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Order Confirmed</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '440px', lineHeight: '1.6' }}>
          Your order has been placed in the archives. A confirmation email has been dispatched.
        </p>

        {/* Info Box */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: '20px',
          borderTop: '1px solid var(--border-primary)',
          borderBottom: '1px solid var(--border-primary)',
          padding: '20px 0',
          width: '100%',
          marginTop: '12px'
        }}>
          <div>
            <span style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>ORDER ID</span>
            <p style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '4px' }}>#{orderId}</p>
          </div>
          <div>
            <span style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>DELIVERY DATE</span>
            <p style={{ fontSize: '0.9rem', fontWeight: 700, marginTop: '4px', color: 'var(--text-primary)' }}>
              {order?.delivery_date ? new Date(order.delivery_date).toDateString() : '7 Days'}
            </p>
          </div>
          <div>
            <span style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>PAYMENT MODE</span>
            <p style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '4px' }}>{order?.payment_mode || 'COD'}</p>
          </div>
        </div>

        {/* Receipt items list */}
        {order && order.items && (
          <div style={{ width: '100%', marginTop: '16px', textAlign: 'left' }}>
            <h3 style={{ fontSize: '0.85rem', fontWeight: 800, marginBottom: '16px', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Garments Summary</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {order.items.map((item) => (
                <div key={item.id} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingBottom: '12px',
                  borderBottom: '1px solid var(--border-light)'
                }}>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <img 
                      src={getMediaUrl(item.subproduct?.image) || 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=500&auto=format&fit=crop&q=60'} 
                      alt={item.subproduct?.product.name}
                      style={{ width: '36px', height: '45px', objectFit: 'cover', border: '1px solid var(--border-primary)' }}
                    />
                    <div>
                      <h4 style={{ fontSize: '0.8rem', fontFamily: 'var(--font-heading)', fontWeight: 700, textTransform: 'uppercase', maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {item.subproduct?.product.name}
                      </h4>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                        QTY: {item.quantity} | SIZE: {item.size}
                      </span>
                    </div>
                  </div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, fontFamily: 'var(--font-heading)' }}>
                    ₹{item.price}
                  </div>
                </div>
              ))}
            </div>

            {/* Total Block */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: '16px',
              fontSize: '0.95rem',
              fontWeight: 800,
              fontFamily: 'var(--font-heading)'
            }}>
              <span>TOTAL</span>
              <span style={{ fontSize: '1.1rem' }}>₹{order.total_amount}</span>
            </div>
          </div>
        )}

        {/* Action Controls */}
        <div style={{
          display: 'flex',
          gap: '12px',
          width: '100%',
          marginTop: '24px',
          flexWrap: 'wrap'
        }}>
          <Link to="/orders" className="btn btn-secondary" style={{ flex: 1, minWidth: '160px', padding: '12px' }}>
            VIEW ORDER LOGS
          </Link>
          <Link to="/" className="btn btn-primary" style={{ flex: 1, minWidth: '160px', padding: '12px' }}>
            CONTINUE SHOPPING
          </Link>
        </div>
      </div>
      
      <style>{`
        .spinner {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default OrderConfirmPage;
