import React, { useState, useEffect } from 'react';
import { useNavigate, Navigate, Link } from 'react-router-dom';
import { Loader2, ShieldCheck, Mail, MapPin, CreditCard } from 'lucide-react';
import { useAuth, API_BASE, getMediaUrl } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const Checkout = () => {
  const { token, user, loading: authLoading } = useAuth();
  const { cartItems, cartSummary, clearCartLocally } = useCart();
  const navigate = useNavigate();

  // Form fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [streetAddress, setStreetAddress] = useState('');
  const [apartment, setApartment] = useState('');
  const [city, setCity] = useState('');
  const [selectedStateId, setSelectedStateId] = useState('');
  const [pincode, setPincode] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  // credit card mock fields
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');

  // state variables
  const [states, setStates] = useState([]);
  const [loadingAddress, setLoadingAddress] = useState(true);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [error, setError] = useState('');
  const [promoCode, setPromoCode] = useState('');

  // Redirect if not logged in
  if (!authLoading && !token) {
    return <Navigate to="/auth" replace />;
  }

  useEffect(() => {
    if (!token) return;

    const loadStates = async () => {
      try {
        const res = await fetch(`${API_BASE}/states/`);
        if (res.ok) {
          const data = await res.json();
          setStates(data);
        }
      } catch (err) {
        console.error('Error loading states:', err);
      }
    };

    const loadSavedAddress = async () => {
      setLoadingAddress(true);
      try {
        const res = await fetch(`${API_BASE}/address/`, {
          headers: {
            'Authorization': `Token ${token}`
          }
        });
        if (res.ok) {
          const data = await res.json();
          if (data && data.id) {
            setFirstName(data.first_name || '');
            setLastName(data.last_name || '');
            setStreetAddress(data.street_address || '');
            setCity(data.city || '');
            setSelectedStateId(data.state?.id || '');
            setPincode(data.pincode ? String(data.pincode) : '');
            setPhone(data.phone_number ? String(data.phone_number) : '');
            setEmail(data.email || user?.user_email || '');
          } else if (user) {
            setEmail(user.user_email || '');
          }
        }
      } catch (err) {
        console.error('Error loading address:', err);
      } finally {
        setLoadingAddress(false);
      }
    };

    loadStates();
    loadSavedAddress();
  }, [token, user]);

  if (cartItems.length === 0 && !placingOrder) {
    return (
      <div className="container" style={{ textAlign: 'center', padding: '80px 24px', minHeight: '400px' }}>
        <h3 style={{ fontSize: '1.5rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '8px' }}>Your Bag is Empty</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '24px' }}>Add garments to proceed to checkout.</p>
        <Link to="/" className="btn btn-primary">SHOP ALL</Link>
      </div>
    );
  }

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setError('');

    if (!email) {
      setError('Please fill in your Email Address.');
      return;
    }
    
    if (!firstName || !lastName || !streetAddress || !city || !selectedStateId || !pincode || !phone) {
      setError('Please fill in all Shipping Address details.');
      return;
    }

    setPlacingOrder(true);
    try {
      // 1. Save Address first
      const addressRes = await fetch(`${API_BASE}/address/`, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          first_name: firstName,
          last_name: lastName,
          street_address: apartment ? `${streetAddress}, ${apartment}` : streetAddress,
          country: 'India',
          city: city,
          state_id: parseInt(selectedStateId),
          pincode: parseInt(pincode),
          phone_number: parseInt(phone),
          email: email
        })
      });

      if (!addressRes.ok) {
        const addressData = await addressRes.json();
        setError(Object.values(addressData).flat().join(', ') || 'Failed to save shipping address.');
        setPlacingOrder(false);
        return;
      }

      // 2. Place Order
      const orderRes = await fetch(`${API_BASE}/orders/place/`, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          payment_mode: 'COD' // Default COD for basic system
        })
      });

      const orderData = await orderRes.json();

      if (orderRes.ok) {
        clearCartLocally();
        navigate(`/order-confirm/${orderData.order_id}`);
      } else {
        setError(orderData.error || 'Failed to place order.');
      }
    } catch (err) {
      setError('Network error.');
    } finally {
      setPlacingOrder(false);
    }
  };

  const handleApplyPromo = (e) => {
    e.preventDefault();
    alert(`Promo code "${promoCode}" is invalid or expired.`);
  };

  return (
    <div className="container animate-fade-in" style={{ marginTop: '40px', paddingBottom: '80px', maxWidth: '1000px' }}>
      
      {error && (
        <div style={{
          padding: '12px',
          border: '1px solid var(--accent)',
          color: 'var(--accent)',
          fontWeight: 700,
          fontSize: '0.85rem',
          textTransform: 'uppercase',
          marginBottom: '24px'
        }}>
          {error}
        </div>
      )}

      {loadingAddress ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
          <Loader2 size={32} className="spinner" style={{ color: 'var(--text-primary)' }} />
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1.3fr 1fr',
          gap: '48px',
          alignItems: 'start'
        }} className="checkout-layout-grid">
          
          {/* Left Column: Form Sections */}
          <form onSubmit={handlePlaceOrder} style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
            
            {/* 1. Contact Information */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, fontFamily: 'var(--font-heading)' }}>Contact Information</h2>
                {!user && (
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    Already have an account? <Link to="/auth" style={{ textDecoration: 'underline', color: 'var(--text-primary)', fontWeight: 700 }}>Log In</Link>
                  </span>
                )}
              </div>
              
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  className="form-input"
                  placeholder="email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                <input type="checkbox" defaultChecked style={{ accentColor: 'var(--border-primary)' }} />
                <span>Keep me updated on new arrivals and philosophy.</span>
              </label>
            </div>

            <hr style={{ border: 'none', borderBottom: '1px solid var(--border-light)' }} />

            {/* 2. Shipping Address */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, fontFamily: 'var(--font-heading)' }}>Shipping Address</h2>
              
              <div className="checkout-name-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">First Name</label>
                  <input
                    type="text"
                    className="form-input"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Last Name</label>
                  <input
                    type="text"
                    className="form-input"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Address</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Street name, number..."
                  value={streetAddress}
                  onChange={(e) => setStreetAddress(e.target.value)}
                  required
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Apartment, Suite, etc. (Optional)</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Apt 4B..."
                  value={apartment}
                  onChange={(e) => setApartment(e.target.value)}
                />
              </div>

              <div className="checkout-city-grid" style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '16px' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">City</label>
                  <input
                    type="text"
                    className="form-input"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Country</label>
                  <select className="form-input" disabled style={{ background: 'var(--bg-secondary)' }}>
                    <option>India</option>
                  </select>
                </div>
              </div>

              <div className="checkout-name-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">State / Province</label>
                  <select
                    className="form-input"
                    value={selectedStateId}
                    onChange={(e) => setSelectedStateId(e.target.value)}
                    required
                    style={{ background: 'transparent', cursor: 'pointer' }}
                  >
                    <option value="">-- Choose State --</option>
                    {states.map((st) => (
                      <option key={st.id} value={st.id}>{st.state_name}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Zip / Postal Code</label>
                  <input
                    type="text"
                    className="form-input"
                    pattern="[0-9]{5,6}"
                    placeholder="360001"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Phone Number (For Delivery alerts)</label>
                <input
                  type="tel"
                  className="form-input"
                  pattern="[0-9]{10}"
                  placeholder="9876543210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>
            </div>

            <hr style={{ border: 'none', borderBottom: '1px solid var(--border-light)' }} />

            {/* 3. Payment Method */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, fontFamily: 'var(--font-heading)' }}>Payment Method</h2>
              
              <div style={{
                border: '1px solid var(--border-primary)',
                backgroundColor: 'var(--bg-secondary)',
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Credit Card Mockup</span>
                  <CreditCard size={18} />
                </div>
                
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.7rem' }}>Card Number</label>
                  <input
                    type="text"
                    placeholder="0000 0000 0000 0000"
                    disabled
                    className="form-input"
                    style={{ background: 'var(--bg-primary)' }}
                  />
                </div>

                <div className="checkout-name-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" style={{ fontSize: '0.7rem' }}>Expiration Date</label>
                    <input
                      type="text"
                      placeholder="MM / YY"
                      disabled
                      className="form-input"
                      style={{ background: 'var(--bg-primary)' }}
                    />
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" style={{ fontSize: '0.7rem' }}>Security Code</label>
                    <input
                      type="text"
                      placeholder="CVV"
                      disabled
                      className="form-input"
                      style={{ background: 'var(--bg-primary)' }}
                    />
                  </div>
                </div>
                
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Note: Transaction defaults to Cash On Delivery (COD) for testing.
                </span>
              </div>
            </div>

            {/* Complete Order button */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button
                type="submit"
                disabled={placingOrder}
                className="btn btn-primary"
                style={{
                  width: '100%',
                  padding: '16px',
                  fontSize: '0.9rem',
                  height: '52px',
                  textTransform: 'uppercase'
                }}
              >
                {placingOrder ? (
                  <Loader2 size={18} className="spinner" />
                ) : (
                  'COMPLETE ORDER'
                )}
              </button>
              
              <span style={{
                fontSize: '0.75rem',
                color: 'var(--text-muted)',
                textAlign: 'center'
              }}>
                By clicking "Complete Order", you agree to our Terms of Service.
              </span>
            </div>

          </form>

          {/* Right Column: Order Summary Panel */}
          <aside className="summary-panel" style={{
            position: 'sticky',
            top: '94px',
            border: '1px solid var(--border-primary)',
            backgroundColor: 'var(--bg-secondary)',
            padding: '30px'
          }}>
            <h2 style={{ 
              fontSize: '1.1rem', 
              fontWeight: 800, 
              textTransform: 'uppercase', 
              letterSpacing: '0.05em',
              marginBottom: '24px'
            }}>Order Summary</h2>

            {/* Items scroll */}
            <div style={{
              maxHeight: '260px',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              marginBottom: '24px',
              paddingRight: '6px'
            }}>
              {cartItems.map((item) => (
                <div key={item.id} style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <div style={{
                    width: '56px',
                    height: '70px',
                    border: '1px solid var(--border-primary)',
                    overflow: 'hidden',
                    backgroundColor: 'var(--bg-primary)',
                    flexShrink: 0
                  }}>
                    <img 
                      src={getMediaUrl(item.subproduct.image) || 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=500&auto=format&fit=crop&q=60'} 
                      alt={item.subproduct.product.name}
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
                      {item.subproduct.product.name}
                    </h4>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                      {item.color} / {item.size} <span style={{ marginLeft: '12px', color: 'var(--text-muted)' }}>x{item.quantity}</span>
                    </span>
                  </div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, fontFamily: 'var(--font-heading)' }}>
                    ₹{item.total_price}
                  </div>
                </div>
              ))}
            </div>

            <hr style={{ border: 'none', borderBottom: '1px solid var(--border-primary)', marginBottom: '20px' }} />

            {/* Promo code */}
            <form onSubmit={handleApplyPromo} style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
              <input 
                type="text" 
                placeholder="Discount Code" 
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
                className="form-input" 
                style={{ 
                  flex: 1, 
                  fontSize: '0.8rem',
                  padding: '8px 12px',
                  border: '1px solid var(--border-primary)',
                  backgroundColor: 'var(--bg-primary)'
                }}
              />
              <button type="submit" className="btn btn-secondary" style={{ 
                padding: '8px 16px', 
                fontSize: '0.8rem', 
                border: '1px solid var(--border-primary)'
              }}>
                APPLY
              </button>
            </form>

            <hr style={{ border: 'none', borderBottom: '1px solid var(--border-light)', marginBottom: '20px' }} />

            {/* Price Calculations */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              <div style={{ display: 'flex', justifySelf: 'stretch', justifyContent: 'space-between' }}>
                <span>Subtotal</span>
                <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>₹{cartSummary.total_amount}</span>
              </div>
              <div style={{ display: 'flex', justifySelf: 'stretch', justifyContent: 'space-between' }}>
                <span>Shipping</span>
                <span style={{ color: 'var(--text-muted)' }}>Calculated next step</span>
              </div>
              <div style={{ display: 'flex', justifySelf: 'stretch', justifyContent: 'space-between' }}>
                <span>Taxes</span>
                <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>₹{cartSummary.shipping_charge}</span>
              </div>
              
              <hr style={{ border: 'none', borderBottom: '1px solid var(--border-primary)', margin: '8px 0' }} />

              <div style={{
                display: 'flex',
                justifySelf: 'stretch',
                justifyContent: 'space-between',
                fontSize: '1.1rem',
                fontWeight: 800,
                color: 'var(--text-primary)',
                fontFamily: 'var(--font-heading)'
              }}>
                <span>Total</span>
                <span>₹{cartSummary.grand_total}</span>
              </div>
            </div>

          </aside>

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
        @media (max-width: 860px) {
          .checkout-layout-grid {
            grid-template-columns: 1fr !important;
          }
          .summary-panel {
            position: relative !important;
            top: 0 !important;
            width: 100% !important;
          }
        }
        @media (max-width: 480px) {
          .checkout-name-grid,
          .checkout-city-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};

export default Checkout;
