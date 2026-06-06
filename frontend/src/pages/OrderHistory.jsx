import React, { useState, useEffect } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { Loader2, Calendar, FileText, ArrowLeft, XCircle, RefreshCcw } from 'lucide-react';
import { useAuth, API_BASE, getMediaUrl } from '../context/AuthContext';

const OrderHistory = () => {
  const { token, loading: authLoading } = useAuth();
  
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState('');

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/orders/`, {
        headers: {
          'Authorization': `Token ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setOrders(data);
      } else {
        setError('Failed to retrieve order logs.');
      }
    } catch (err) {
      setError('Network error. Check connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchOrders();
    }
  }, [token]);

  if (!authLoading && !token) {
    return <Navigate to="/auth" replace />;
  }

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Cancel this order?')) return;
    
    setActionLoading(orderId);
    try {
      const response = await fetch(`${API_BASE}/orders/${orderId}/cancel/`, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (response.ok) {
        await fetchOrders();
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to cancel order.');
      }
    } catch (err) {
      alert('Network error.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReturnOrder = async (orderId) => {
    if (!window.confirm('Return this order?')) return;
    
    setActionLoading(orderId);
    try {
      const response = await fetch(`${API_BASE}/orders/${orderId}/return/`, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (response.ok) {
        await fetchOrders();
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to return order.');
      }
    } catch (err) {
      alert('Network error.');
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadge = (status) => {
    const s = status?.toUpperCase() || 'PENDING';
    const badgeColor = ['CANCELLED', 'RETURNED'].includes(s) ? 'var(--accent)' : 'var(--text-primary)';
    return (
      <span style={{
        fontSize: '0.7rem',
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
        border: `1px solid ${badgeColor}`,
        color: badgeColor,
        padding: '3px 8px'
      }}>
        {s}
      </span>
    );
  };

  const isCancelable = (order) => {
    const daysSinceOrdered = (new Date() - new Date(order.order_date)) / (1000 * 60 * 60 * 24);
    return daysSinceOrdered < 50 && ['pending', 'confirmed'].includes(order.order_status?.toLowerCase());
  };

  const isReturnable = (order) => {
    const daysSinceOrdered = (new Date() - new Date(order.order_date)) / (1000 * 60 * 60 * 24);
    return daysSinceOrdered < 50 && order.order_status?.toLowerCase() === 'delivered';
  };

  return (
    <div className="container animate-fade-in" style={{ marginTop: '40px', paddingBottom: '80px', maxWidth: '800px' }}>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '36px' }}>
        <Link to="/" style={{ color: 'var(--text-primary)' }}>
          <ArrowLeft size={20} />
        </Link>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, textTransform: 'uppercase' }}>Archival Orders</h1>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '80px' }}>
          <Loader2 size={32} className="spinner" style={{ color: 'var(--text-primary)' }} />
        </div>
      ) : error ? (
        <div style={{
          padding: '16px',
          border: '1px solid var(--accent)',
          color: 'var(--accent)',
          textAlign: 'center',
          fontWeight: 700,
          fontSize: '0.85rem'
        }}>
          {error}
        </div>
      ) : orders.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '80px 24px',
          backgroundColor: 'var(--bg-secondary)',
          border: '1px solid var(--border-primary)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '16px'
        }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>NO PAST ARCHIVES</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Your order logs are empty. Visit the catalog to begin.</p>
          <Link to="/" className="btn btn-primary">Browse Shop</Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          {orders.map((orderObj) => (
            <div key={orderObj.id} style={{
              border: '1px solid var(--border-primary)',
              backgroundColor: 'var(--bg-primary)'
            }} className="order-panel">
              
              {/* Header */}
              <div style={{
                padding: '16px 20px',
                backgroundColor: 'var(--bg-secondary)',
                borderBottom: '1px solid var(--border-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '16px'
              }}>
                <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
                  <div>
                    <span style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Placed On</span>
                    <p style={{ fontSize: '0.8rem', fontWeight: 700, marginTop: '2px' }}>
                      {new Date(orderObj.order_date).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Total Price</span>
                    <p style={{ fontSize: '0.8rem', fontWeight: 800, marginTop: '2px' }}>₹{orderObj.total_amount}</p>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Invoice ID</span>
                    <p style={{ fontSize: '0.8rem', fontWeight: 700, marginTop: '2px', color: 'var(--text-secondary)' }}>#{orderObj.order_id}</p>
                  </div>
                </div>

                <div>
                  {getStatusBadge(orderObj.order_status)}
                </div>
              </div>

              {/* Items */}
              <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {orderObj.items.map((item) => (
                  <div key={item.id} style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                    <div style={{
                      width: '48px',
                      height: '60px',
                      border: '1px solid var(--border-primary)',
                      overflow: 'hidden',
                      flexShrink: 0
                    }}>
                      <img 
                        src={getMediaUrl(item.subproduct?.image) || 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=500&auto=format&fit=crop&q=60'} 
                        alt={item.subproduct?.product.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h4 style={{ 
                        fontSize: '0.85rem', 
                        fontFamily: 'var(--font-heading)',
                        fontWeight: 700, 
                        overflow: 'hidden', 
                        textOverflow: 'ellipsis', 
                        whiteSpace: 'nowrap',
                        textTransform: 'uppercase'
                      }}>
                        {item.subproduct?.product.name}
                      </h4>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                        Qty: {item.quantity} | Size: {item.size} | Color: {item.color}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, fontFamily: 'var(--font-heading)' }}>
                      ₹{item.price}
                    </div>
                  </div>
                ))}
              </div>

              {/* Actions */}
              {(isCancelable(orderObj) || isReturnable(orderObj)) && (
                <div style={{
                  padding: '12px 20px',
                  borderTop: '1px solid var(--border-primary)',
                  backgroundColor: 'var(--bg-secondary)',
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: '12px'
                }}>
                  {isCancelable(orderObj) && (
                    <button
                      onClick={() => handleCancelOrder(orderObj.order_id)}
                      disabled={actionLoading === orderObj.order_id}
                      className="btn btn-secondary"
                      style={{
                        padding: '6px 12px',
                        fontSize: '0.75rem',
                        color: 'var(--accent)',
                        borderColor: 'var(--accent)'
                      }}
                    >
                      {actionLoading === orderObj.order_id ? (
                        <Loader2 size={12} className="spinner" />
                      ) : (
                        'Cancel Order'
                      )}
                    </button>
                  )}

                  {isReturnable(orderObj) && (
                    <button
                      onClick={() => handleReturnOrder(orderObj.order_id)}
                      disabled={actionLoading === orderObj.order_id}
                      className="btn btn-secondary"
                      style={{
                        padding: '6px 12px',
                        fontSize: '0.75rem',
                        color: 'var(--text-primary)'
                      }}
                    >
                      {actionLoading === orderObj.order_id ? (
                        <Loader2 size={12} className="spinner" />
                      ) : (
                        'Return Order'
                      )}
                    </button>
                  )}
                </div>
              )}

            </div>
          ))}
        </div>
      )}

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

export default OrderHistory;
