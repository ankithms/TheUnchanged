import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, API_BASE } from '../context/AuthContext';
import UnchangedLogo from '../components/UnchangedLogo';
import { 
  LayoutDashboard, ShoppingBag, Users, FileText, Plus, Trash2, 
  Edit3, Save, X, Eye, DollarSign, Calendar, Tag, Layers, RefreshCw
} from 'lucide-react';

const AdminDashboard = () => {
  const { user, token, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  // Active Tab
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'orders', 'products', 'attributes'

  // Dashboard Stats State
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);

  // Orders State
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Products State
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState(null); // Product object being edited

  // Attribute lists (Categories, Colors, Sizes)
  const [attributes, setAttributes] = useState({ categories: [], colors: [], sizes: [] });
  const [attributesLoading, setAttributesLoading] = useState(true);

  // Form states
  const [newProduct, setNewProduct] = useState({
    name: '',
    price: '',
    category_id: '',
    description: '',
    image: null,
    attributes: [{ size: 'S', color: 'Charcoal', stock: 10 }]
  });

  const [newAttr, setNewAttr] = useState({ type: 'category', name: '' });
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Redirect if not staff
  useEffect(() => {
    if (!authLoading) {
      if (!user || (!user.is_staff && !user.is_superuser)) {
        navigate('/');
      }
    }
  }, [user, authLoading, navigate]);

  // Load Data
  const fetchStats = async () => {
    try {
      setStatsLoading(true);
      const res = await fetch(`${API_BASE}/admin/stats/`, {
        headers: { 'Authorization': `Token ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setStatsLoading(false);
    }
  };

  const fetchOrders = async () => {
    try {
      setOrdersLoading(true);
      const res = await fetch(`${API_BASE}/admin/orders/`, {
        headers: { 'Authorization': `Token ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setOrdersLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      setProductsLoading(true);
      const res = await fetch(`${API_BASE}/admin/products/`, {
        headers: { 'Authorization': `Token ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setProductsLoading(false);
    }
  };

  const fetchAttributes = async () => {
    try {
      setAttributesLoading(true);
      const res = await fetch(`${API_BASE}/admin/attributes/`, {
        headers: { 'Authorization': `Token ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setAttributes(data);
        if (data.categories.length > 0) {
          setNewProduct(prev => ({ ...prev, category_id: data.categories[0].id }));
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAttributesLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchStats();
      fetchOrders();
      fetchProducts();
      fetchAttributes();
    }
  }, [token]);

  // Handle order status update
  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      const res = await fetch(`${API_BASE}/admin/orders/${orderId}/`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ order_status: newStatus })
      });
      if (res.ok) {
        const updated = await res.json();
        setOrders(orders.map(o => o.order_id === orderId ? updated : o));
        if (selectedOrder && selectedOrder.order_id === orderId) {
          setSelectedOrder(updated);
        }
        // Refresh dashboard metrics
        fetchStats();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Add stock option row in form
  const addStockRow = (isEdit = false) => {
    if (isEdit) {
      setEditingProduct(prev => ({
        ...prev,
        attributes_list: [...prev.attributes_list, { size: 'S', color: 'Charcoal', stock: 10 }]
      }));
    } else {
      setNewProduct(prev => ({
        ...prev,
        attributes: [...prev.attributes, { size: 'S', color: 'Charcoal', stock: 10 }]
      }));
    }
  };

  // Remove stock option row
  const removeStockRow = (index, isEdit = false) => {
    if (isEdit) {
      const list = [...editingProduct.attributes_list];
      list.splice(index, 1);
      setEditingProduct(prev => ({ ...prev, attributes_list: list }));
    } else {
      const list = [...newProduct.attributes];
      list.splice(index, 1);
      setNewProduct(prev => ({ ...prev, attributes: list }));
    }
  };

  // Update stock option row value
  const updateStockRowValue = (index, field, value, isEdit = false) => {
    if (isEdit) {
      const list = [...editingProduct.attributes_list];
      list[index][field] = value;
      setEditingProduct(prev => ({ ...prev, attributes_list: list }));
    } else {
      const list = [...newProduct.attributes];
      list[index][field] = value;
      setNewProduct(prev => ({ ...prev, attributes: list }));
    }
  };

  // Create Product Submit
  const handleCreateProductSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');
    setActionLoading(true);

    try {
      const formData = new FormData();
      formData.append('name', newProduct.name);
      formData.append('price', newProduct.price);
      formData.append('category_id', newProduct.category_id);
      formData.append('description', newProduct.description);
      if (newProduct.image) {
        formData.append('image', newProduct.image);
      }
      formData.append('attributes', JSON.stringify(newProduct.attributes));

      const res = await fetch(`${API_BASE}/admin/products/`, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${token}`
          // Let browser set content-type with boundary for multipart
        },
        body: formData
      });

      const data = await res.json();
      if (res.ok) {
        setFormSuccess('Product created successfully!');
        setNewProduct({
          name: '',
          price: '',
          category_id: attributes.categories[0]?.id || '',
          description: '',
          image: null,
          attributes: [{ size: 'S', color: 'Charcoal', stock: 10 }]
        });
        // Clear file input
        const fileInput = document.getElementById('product-image-file');
        if (fileInput) fileInput.value = '';

        fetchProducts();
        fetchStats();
      } else {
        setFormError(data.error || 'Failed to create product.');
      }
    } catch (err) {
      setFormError('Network error occurred.');
    } finally {
      setActionLoading(false);
    }
  };

  // Edit Product Setup
  const startEditingProduct = (sp) => {
    // Convert many-to-many list into simplified form attributes
    const attributes_list = sp.product_size_color.map(psc => ({
      size: psc.size,
      color: psc.color,
      stock: psc.stock_quantity
    }));
    setEditingProduct({
      id: sp.id,
      name: sp.product.name,
      price: sp.product.price,
      category_id: sp.product.category.id,
      description: sp.description,
      image: null,
      attributes_list: attributes_list.length > 0 ? attributes_list : [{ size: 'S', color: 'Charcoal', stock: 10 }]
    });
  };

  // Edit Product Submit
  const handleUpdateProductSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');
    setActionLoading(true);

    try {
      const formData = new FormData();
      formData.append('name', editingProduct.name);
      formData.append('price', editingProduct.price);
      formData.append('category_id', editingProduct.category_id);
      formData.append('description', editingProduct.description);
      if (editingProduct.image) {
        formData.append('image', editingProduct.image);
      }
      formData.append('attributes', JSON.stringify(editingProduct.attributes_list));

      const res = await fetch(`${API_BASE}/admin/products/${editingProduct.id}/`, {
        method: 'PUT',
        headers: {
          'Authorization': `Token ${token}`
        },
        body: formData
      });

      const data = await res.json();
      if (res.ok) {
        setFormSuccess('Product updated successfully!');
        setEditingProduct(null);
        fetchProducts();
        fetchStats();
      } else {
        setFormError(data.error || 'Failed to update product.');
      }
    } catch (err) {
      setFormError('Network error occurred.');
    } finally {
      setActionLoading(false);
    }
  };

  // Delete Product
  const handleDeleteProduct = async (pk) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      const res = await fetch(`${API_BASE}/admin/products/${pk}/`, {
        method: 'DELETE',
        headers: { 'Authorization': `Token ${token}` }
      });
      if (res.ok) {
        fetchProducts();
        fetchStats();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Create Attribute (Category/Color/Size)
  const handleCreateAttributeSubmit = async (e) => {
    e.preventDefault();
    if (!newAttr.name.trim()) return;
    setFormError('');
    setFormSuccess('');
    setActionLoading(true);

    try {
      const res = await fetch(`${API_BASE}/admin/attributes/`, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newAttr)
      });
      const data = await res.json();
      if (res.ok) {
        setFormSuccess(`${newAttr.type.toUpperCase()} "${newAttr.name}" added successfully.`);
        setNewAttr({ ...newAttr, name: '' });
        fetchAttributes();
      } else {
        setFormError(data.error || 'Failed to add attribute.');
      }
    } catch (err) {
      setFormError('Network error occurred.');
    } finally {
      setActionLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh', backgroundColor: 'var(--bg-primary)' }}>
        <div style={{ fontFamily: 'var(--font-heading)', letterSpacing: '0.1em', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <RefreshCw className="animate-spin" size={18} />
          AUTHENTICATING CREDENTIALS...
        </div>
      </div>
    );
  }

  // Render SVG Sparkline / Bar chart simply for visual wow factor
  const renderSalesChart = () => {
    if (!stats || !stats.sales_chart || stats.sales_chart.length === 0) {
      return (
        <div style={{ height: '240px', border: '1px dashed var(--border-primary)', display: 'flex', alignItems: 'center', justifyContents: 'center', color: 'var(--text-muted)' }}>
          NO SALES HISTORY AVAILABLE TO CHART
        </div>
      );
    }

    const maxVal = Math.max(...stats.sales_chart.map(s => s.sales), 1000);
    const height = 200;
    const width = 600;
    const padding = 30;

    // Calc coordinates
    const points = stats.sales_chart.map((s, i) => {
      const x = padding + (i / (stats.sales_chart.length - 1 || 1)) * (width - padding * 2);
      const y = height - padding - (s.sales / maxVal) * (height - padding * 2);
      return { x, y, label: s.month, value: s.sales };
    });

    const pathD = points.reduce((acc, p, i) => {
      return acc + (i === 0 ? `M ${p.x} ${p.y}` : ` L ${p.x} ${p.y}`);
    }, '');

    return (
      <div style={{ width: '100%', overflowX: 'auto', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-primary)', padding: '24px' }}>
        <h4 style={{ textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '0.85rem', marginBottom: '20px', display: 'flex', justifyContent: 'space-between' }}>
          <span>SALES TRENDS BY MONTH</span>
          <span style={{ color: 'var(--accent)' }}>TOTAL REVENUE: ₹{stats.metrics.total_revenue}</span>
        </h4>
        <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: 'auto', overflow: 'visible' }}>
          {/* Grid lines */}
          <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="var(--border-primary)" strokeWidth="1" />
          <line x1={padding} y1={padding} x2={width - padding} y2={padding} stroke="var(--border-light)" strokeWidth="1" strokeDasharray="3" />
          
          {/* Axis Labels */}
          <text x={padding - 5} y={padding + 5} textAnchor="end" fontSize="9" fill="var(--text-secondary)">₹{maxVal}</text>
          <text x={padding - 5} y={height - padding} textAnchor="end" fontSize="9" fill="var(--text-secondary)">₹0</text>

          {/* Area under curve */}
          {points.length > 1 && (
            <path 
              d={`${pathD} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`}
              fill="rgba(26, 26, 26, 0.03)"
            />
          )}

          {/* Line Path */}
          <path 
            d={pathD} 
            fill="none" 
            stroke="var(--border-primary)" 
            strokeWidth="2.5" 
          />

          {/* Data Points */}
          {points.map((p, idx) => (
            <g key={idx}>
              <circle 
                cx={p.x} 
                cy={p.y} 
                r="4" 
                fill="var(--bg-primary)" 
                stroke="var(--border-primary)" 
                strokeWidth="2.5" 
              />
              <text 
                x={p.x} 
                y={height - 10} 
                textAnchor="middle" 
                fontSize="9" 
                fontWeight="700" 
                fill="var(--text-primary)"
              >
                {p.label}
              </text>
              <text 
                x={p.x} 
                y={p.y - 10} 
                textAnchor="middle" 
                fontSize="8" 
                fontWeight="600" 
                fill="var(--accent)"
              >
                ₹{p.value}
              </text>
            </g>
          ))}
        </svg>
      </div>
    );
  };

  return (
    <div style={{ backgroundColor: 'var(--bg-primary)', minHeight: '100vh', padding: '40px 0' }}>
      <div className="container">
        
        {/* Editorial Heading */}
        <header style={{
          borderBottom: '2px solid var(--border-primary)',
          paddingBottom: '24px',
          marginBottom: '32px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <UnchangedLogo size={48} />
            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
                ADMINISTRATIVE LOGISTICS
              </span>
              <h1 style={{ fontSize: '2rem', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '4px 0 0 0' }}>
                HERITAGE FOUNDRY DASHBOARD
              </h1>
            </div>
          </div>
          <div style={{
            display: 'flex',
            gap: '8px'
          }}>
            <button 
              onClick={() => { fetchStats(); fetchOrders(); fetchProducts(); fetchAttributes(); }} 
              className="btn btn-secondary" 
              style={{ padding: '8px 16px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <RefreshCw size={12} /> REFRESH DATA
            </button>
          </div>
        </header>

        {/* Tab Controls */}
        <div style={{
          display: 'flex',
          borderBottom: '1px solid var(--border-primary)',
          marginBottom: '32px',
          gap: '0px',
          flexWrap: 'wrap'
        }}>
          {[
            { id: 'overview', label: 'Overview Metrics', icon: <LayoutDashboard size={14} /> },
            { id: 'orders', label: 'Customer Orders', icon: <ShoppingBag size={14} /> },
            { id: 'products', label: 'Products Catalog', icon: <Tag size={14} /> },
            { id: 'attributes', label: 'Attributes Registry', icon: <Layers size={14} /> }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setFormError(''); setFormSuccess(''); }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '14px 24px',
                fontFamily: 'var(--font-heading)',
                fontSize: '0.8rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                background: activeTab === tab.id ? 'var(--border-primary)' : 'transparent',
                color: activeTab === tab.id ? 'var(--bg-primary)' : 'var(--text-primary)',
                border: '1px solid var(--border-primary)',
                borderBottom: 'none',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Action Message Toasts */}
        {formError && (
          <div style={{
            border: '1px solid var(--accent)',
            backgroundColor: 'rgba(153, 27, 27, 0.05)',
            color: 'var(--accent)',
            padding: '16px',
            fontSize: '0.85rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            marginBottom: '24px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <span>ERROR: {formError}</span>
            <button onClick={() => setFormError('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent)' }}>
              <X size={16} />
            </button>
          </div>
        )}

        {formSuccess && (
          <div style={{
            border: '1px solid var(--text-primary)',
            backgroundColor: 'var(--bg-secondary)',
            color: 'var(--text-primary)',
            padding: '16px',
            fontSize: '0.85rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            marginBottom: '24px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <span>SUCCESS: {formSuccess}</span>
            <button onClick={() => setFormSuccess('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-primary)' }}>
              <X size={16} />
            </button>
          </div>
        )}

        {/* ---------------- OVERVIEW TAB ---------------- */}
        {activeTab === 'overview' && (
          <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            
            {/* Summary Counters */}
            {statsLoading ? (
              <div style={{ padding: '24px', textAlign: 'center' }}>LOADING LOGISTICAL METRICS...</div>
            ) : stats ? (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '20px'
              }}>
                {[
                  { label: 'Total Revenue', value: `₹${stats.metrics.total_revenue}`, icon: <DollarSign size={20} /> },
                  { label: 'Orders Placed', value: stats.metrics.total_orders, icon: <ShoppingBag size={20} /> },
                  { label: 'SubProducts Registered', value: stats.metrics.total_products, icon: <Tag size={20} /> },
                  { label: 'Customer Accounts', value: stats.metrics.total_users, icon: <Users size={20} /> }
                ].map((stat, idx) => (
                  <div key={idx} style={{
                    border: '1px solid var(--border-primary)',
                    padding: '24px',
                    backgroundColor: 'var(--bg-secondary)',
                    boxShadow: 'var(--shadow-md)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    height: '130px'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                      <span style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{stat.label}</span>
                      {stat.icon}
                    </div>
                    <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.8rem', fontWeight: 700 }}>
                      {stat.value}
                    </div>
                  </div>
                ))}
              </div>
            ) : null}

            {/* Sales Chart */}
            {!statsLoading && renderSalesChart()}

            {/* Split Log columns */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '32px'
            }}>
              
              {/* Recent Orders log */}
              <div style={{ border: '1px solid var(--border-primary)', padding: '24px', backgroundColor: 'var(--bg-primary)' }}>
                <h3 style={{ textTransform: 'uppercase', letterSpacing: '0.08em', fontSize: '1rem', borderBottom: '1px solid var(--border-primary)', paddingBottom: '12px', marginBottom: '16px' }}>
                  RECENT TRANSACTIONS
                </h3>
                {statsLoading ? (
                  <div style={{ padding: '12px', fontSize: '0.85rem' }}>FETCHING RECENT TRANSACTIONS...</div>
                ) : stats && stats.recent_orders.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {stats.recent_orders.map(order => (
                      <div key={order.order_id} style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '12px',
                        borderBottom: '1px solid var(--border-light)',
                        fontSize: '0.85rem'
                      }}>
                        <div>
                          <div style={{ fontWeight: 700 }}>ORDER #{order.order_id}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                            {order.order_date} • {order.total_quantity} items
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontWeight: 700 }}>₹{order.total_amount}</div>
                          <span className={`badge ${
                            order.order_status === 'Delivered' ? 'badge-success' : 
                            order.order_status === 'Pending' ? 'badge-warning' : 'badge-error'
                          }`} style={{ fontSize: '0.6rem', padding: '2px 6px' }}>
                            {order.order_status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>NO RECENT TRANSACTIONS REGISTERED.</div>
                )}
              </div>

              {/* Recent Contacts log */}
              <div style={{ border: '1px solid var(--border-primary)', padding: '24px', backgroundColor: 'var(--bg-primary)' }}>
                <h3 style={{ textTransform: 'uppercase', letterSpacing: '0.08em', fontSize: '1rem', borderBottom: '1px solid var(--border-primary)', paddingBottom: '12px', marginBottom: '16px' }}>
                  VISITOR MESSAGE JOURNAL
                </h3>
                {statsLoading ? (
                  <div style={{ padding: '12px', fontSize: '0.85rem' }}>FETCHING VISITOR LOGS...</div>
                ) : stats && stats.recent_contacts.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {stats.recent_contacts.map(c => (
                      <div key={c.id} style={{
                        padding: '12px',
                        borderBottom: '1px solid var(--border-light)',
                        fontSize: '0.85rem',
                        backgroundColor: 'var(--bg-secondary)'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>
                          <span>{c.name} ({c.email})</span>
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{c.created_at}</span>
                        </div>
                        <div style={{ fontWeight: 600, margin: '4px 0', color: 'var(--accent)' }}>SUBJ: {c.subject}</div>
                        <div style={{ fontSize: '0.8rem', fontStyle: 'italic', color: 'var(--text-secondary)' }}>
                          "{c.comments}"
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>NO MESSAGES REGISTERED IN JOURNAL.</div>
                )}
              </div>

            </div>
          </div>
        )}

        {/* ---------------- ORDERS TAB ---------------- */}
        {activeTab === 'orders' && (
          <div className="animate-fade-in">
            <h3 style={{ textTransform: 'uppercase', letterSpacing: '0.08em', fontSize: '1.1rem', marginBottom: '20px' }}>
              CUSTOMER ORDERS LOG
            </h3>
            {ordersLoading ? (
              <div style={{ padding: '24px', textAlign: 'center' }}>LOADING LOGISTICAL TRANSCRIPT...</div>
            ) : orders.length === 0 ? (
              <div style={{ padding: '40px', border: '1px dashed var(--border-primary)', textAlign: 'center', color: 'var(--text-muted)' }}>
                NO PLACED ORDERS CURRENTLY RECORDED.
              </div>
            ) : (
              <div style={{ overflowX: 'auto', border: '1px solid var(--border-primary)' }}>
                <table style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  fontSize: '0.85rem',
                  textAlign: 'left',
                  backgroundColor: 'var(--bg-secondary)'
                }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border-primary)', backgroundColor: 'var(--bg-tertiary)', textTransform: 'uppercase', fontFamily: 'var(--font-heading)' }}>
                      <th style={{ padding: '12px 16px', fontWeight: 700 }}>Order ID</th>
                      <th style={{ padding: '12px 16px', fontWeight: 700 }}>Customer Info</th>
                      <th style={{ padding: '12px 16px', fontWeight: 700 }}>Purchase Date</th>
                      <th style={{ padding: '12px 16px', fontWeight: 700 }}>Total Units</th>
                      <th style={{ padding: '12px 16px', fontWeight: 700 }}>Total Price</th>
                      <th style={{ padding: '12px 16px', fontWeight: 700 }}>Order Status</th>
                      <th style={{ padding: '12px 16px', fontWeight: 700, textAlign: 'center' }}>Inspect</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map(order => (
                      <tr key={order.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                        <td style={{ padding: '14px 16px', fontWeight: 700 }}>#{order.order_id}</td>
                        <td style={{ padding: '14px 16px' }}>
                          <div style={{ fontWeight: 600 }}>{order.address?.first_name} {order.address?.last_name}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{order.address?.email}</div>
                        </td>
                        <td style={{ padding: '14px 16px' }}>{order.order_date}</td>
                        <td style={{ padding: '14px 16px' }}>{order.total_quantity}</td>
                        <td style={{ padding: '14px 16px', fontWeight: 700 }}>₹{order.total_amount}</td>
                        <td style={{ padding: '14px 16px' }}>
                          <select
                            value={order.order_status}
                            onChange={(e) => handleUpdateOrderStatus(order.order_id, e.target.value)}
                            style={{
                              padding: '6px 12px',
                              backgroundColor: 'var(--bg-primary)',
                              border: '1px solid var(--border-primary)',
                              fontFamily: 'var(--font-heading)',
                              fontWeight: 700,
                              fontSize: '0.75rem',
                              textTransform: 'uppercase',
                              outline: 'none',
                              cursor: 'pointer'
                            }}
                          >
                            <option value="Pending">Pending</option>
                            <option value="Confirmed">Confirmed</option>
                            <option value="Delivered">Delivered</option>
                            <option value="Cancelled">Cancelled</option>
                            <option value="Returned">Returned</option>
                          </select>
                        </td>
                        <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                          <button
                            onClick={() => setSelectedOrder(order)}
                            className="btn-icon"
                            style={{ width: '32px', height: '32px', display: 'inline-flex' }}
                            title="Inspect Order detail"
                          >
                            <Eye size={12} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ---------------- PRODUCTS TAB ---------------- */}
        {activeTab === 'products' && (
          <div className="animate-fade-in" style={{
            display: 'grid',
            gridTemplateColumns: '1fr',
            gap: '40px'
          }}>
            
            {/* Edit / Add Product Form Module */}
            <div style={{
              border: '2px solid var(--border-primary)',
              padding: '24px',
              backgroundColor: 'var(--bg-secondary)'
            }}>
              <h3 style={{ textTransform: 'uppercase', letterSpacing: '0.08em', fontSize: '1.1rem', borderBottom: '1px solid var(--border-primary)', paddingBottom: '12px', marginBottom: '20px' }}>
                {editingProduct ? 'MODIFY REGISTERED PRODUCT' : 'REGISTER NEW PRODUCT'}
              </h3>
              
              <form onSubmit={editingProduct ? handleUpdateProductSubmit : handleCreateProductSubmit} style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '16px'
              }}>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                  gap: '20px'
                }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Product Name</label>
                    <input 
                      type="text" 
                      className="form-input"
                      value={editingProduct ? editingProduct.name : newProduct.name}
                      onChange={(e) => {
                        if (editingProduct) setEditingProduct({ ...editingProduct, name: e.target.value });
                        else setNewProduct({ ...newProduct, name: e.target.value });
                      }}
                      required
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Base Price (INR)</label>
                    <input 
                      type="number" 
                      className="form-input"
                      value={editingProduct ? editingProduct.price : newProduct.price}
                      onChange={(e) => {
                        if (editingProduct) setEditingProduct({ ...editingProduct, price: e.target.value });
                        else setNewProduct({ ...newProduct, price: e.target.value });
                      }}
                      required
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Catalog Category</label>
                    <select
                      className="form-input"
                      value={editingProduct ? editingProduct.category_id : newProduct.category_id}
                      onChange={(e) => {
                        if (editingProduct) setEditingProduct({ ...editingProduct, category_id: e.target.value });
                        else setNewProduct({ ...newProduct, category_id: e.target.value });
                      }}
                      required
                    >
                      {attributes.categories.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Garment Description / Archival Notes</label>
                  <textarea 
                    className="form-input"
                    rows="3"
                    value={editingProduct ? editingProduct.description : newProduct.description}
                    onChange={(e) => {
                      if (editingProduct) setEditingProduct({ ...editingProduct, description: e.target.value });
                      else setNewProduct({ ...newProduct, description: e.target.value });
                    }}
                    style={{ resize: 'vertical' }}
                    required
                  ></textarea>
                </div>

                {/* File Upload */}
                <div className="form-group">
                  <label className="form-label">
                    Garment Image {editingProduct && <span style={{ color: 'var(--text-muted)' }}>(Leave blank to keep existing)</span>}
                  </label>
                  <input 
                    type="file" 
                    id="product-image-file"
                    className="form-input"
                    accept="image/*"
                    onChange={(e) => {
                      if (editingProduct) setEditingProduct({ ...editingProduct, image: e.target.files[0] });
                      else setNewProduct({ ...newProduct, image: e.target.files[0] });
                    }}
                    required={!editingProduct}
                  />
                </div>

                {/* Stock Attributes options (Color / Size / Stock Qty) */}
                <div style={{
                  border: '1px solid var(--border-primary)',
                  padding: '16px',
                  backgroundColor: 'var(--bg-primary)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      STOCK & ATTR SPECIFICATION GRID
                    </span>
                    <button 
                      type="button" 
                      onClick={() => addStockRow(!!editingProduct)}
                      style={{
                        padding: '4px 10px',
                        fontSize: '0.65rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                      className="btn btn-secondary"
                    >
                      <Plus size={10} /> ADD ATTRIBUTE COMBINATION
                    </button>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {(editingProduct ? editingProduct.attributes_list : newProduct.attributes).map((row, idx) => (
                      <div key={idx} style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr 1fr auto',
                        gap: '12px',
                        alignItems: 'center'
                      }}>
                        <div>
                          <label style={{ fontSize: '0.6rem', color: 'var(--text-secondary)' }}>SIZE</label>
                          <input
                            type="text"
                            placeholder="S, M, L, XL..."
                            value={row.size}
                            onChange={(e) => updateStockRowValue(idx, 'size', e.target.value.toUpperCase(), !!editingProduct)}
                            className="form-input"
                            style={{ padding: '6px 10px', fontSize: '0.8rem' }}
                            required
                          />
                        </div>
                        <div>
                          <label style={{ fontSize: '0.6rem', color: 'var(--text-secondary)' }}>COLOR</label>
                          <input
                            type="text"
                            placeholder="Charcoal, Eggshell..."
                            value={row.color}
                            onChange={(e) => updateStockRowValue(idx, 'color', e.target.value, !!editingProduct)}
                            className="form-input"
                            style={{ padding: '6px 10px', fontSize: '0.8rem' }}
                            required
                          />
                        </div>
                        <div>
                          <label style={{ fontSize: '0.6rem', color: 'var(--text-secondary)' }}>QUANTITY</label>
                          <input
                            type="number"
                            min="0"
                            placeholder="0"
                            value={row.stock}
                            onChange={(e) => updateStockRowValue(idx, 'stock', parseInt(e.target.value) || 0, !!editingProduct)}
                            className="form-input"
                            style={{ padding: '6px 10px', fontSize: '0.8rem' }}
                            required
                          />
                        </div>
                        <div style={{ alignSelf: 'end' }}>
                          <button
                            type="button"
                            onClick={() => removeStockRow(idx, !!editingProduct)}
                            disabled={(editingProduct ? editingProduct.attributes_list : newProduct.attributes).length <= 1}
                            className="btn-icon"
                            style={{ width: '32px', height: '32px', color: 'var(--accent)' }}
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '8px' }}>
                  {editingProduct && (
                    <button 
                      type="button" 
                      onClick={() => setEditingProduct(null)} 
                      className="btn btn-secondary"
                    >
                      CANCEL EDIT
                    </button>
                  )}
                  <button 
                    type="submit" 
                    className="btn btn-primary"
                    disabled={actionLoading}
                    style={{ minWidth: '160px' }}
                  >
                    {actionLoading ? 'PROCESSING...' : editingProduct ? 'SAVE CHANGES' : 'REGISTER PRODUCT'}
                  </button>
                </div>
              </form>
            </div>

            {/* Products catalog list */}
            <div>
              <h3 style={{ textTransform: 'uppercase', letterSpacing: '0.08em', fontSize: '1.1rem', marginBottom: '20px' }}>
                REGISTERED PRODUCTS REGISTRY
              </h3>
              {productsLoading ? (
                <div style={{ padding: '24px', textAlign: 'center' }}>LOADING PRODUCTS RECORD...</div>
              ) : products.length === 0 ? (
                <div style={{ padding: '40px', border: '1px dashed var(--border-primary)', textAlign: 'center', color: 'var(--text-muted)' }}>
                  NO PRODUCTS CURRENTLY REGISTERED.
                </div>
              ) : (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                  gap: '24px'
                }}>
                  {products.map(sp => (
                    <div key={sp.id} style={{
                      border: '1px solid var(--border-primary)',
                      backgroundColor: 'var(--bg-secondary)',
                      display: 'flex',
                      flexDirection: 'column'
                    }}>
                      {/* Image section */}
                      <div style={{
                        height: '220px',
                        borderBottom: '1px solid var(--border-primary)',
                        backgroundColor: 'var(--bg-tertiary)',
                        position: 'relative',
                        overflow: 'hidden'
                      }}>
                        {sp.image ? (
                          <img 
                            src={sp.image.startsWith('http') ? sp.image : `${API_BASE.replace('/api', '')}/media/${sp.image}`} 
                            alt={sp.product.name} 
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        ) : (
                          <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                            NO IMAGE FILE
                          </div>
                        )}
                        <span style={{
                          position: 'absolute',
                          top: '10px',
                          left: '10px',
                          backgroundColor: 'var(--border-primary)',
                          color: 'var(--bg-primary)',
                          padding: '2px 8px',
                          fontFamily: 'var(--font-heading)',
                          fontSize: '0.65rem',
                          fontWeight: 700,
                          textTransform: 'uppercase'
                        }}>
                          {sp.product.category.name}
                        </span>
                      </div>

                      {/* Info section */}
                      <div style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '8px' }}>
                            <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '0.95rem', margin: 0, textTransform: 'uppercase' }}>
                              {sp.product.name}
                            </h4>
                            <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>
                              ₹{sp.product.price}
                            </span>
                          </div>
                          
                          <p style={{ 
                            fontSize: '0.75rem', 
                            color: 'var(--text-secondary)',
                            lineHeight: 1.4,
                            marginBottom: '12px',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden'
                          }}>
                            {sp.description}
                          </p>

                          {/* Sizes / Stock Pills */}
                          <div style={{ marginBottom: '16px' }}>
                            <div style={{ fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '6px', color: 'var(--text-muted)' }}>
                              Stock Inventory
                            </div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                              {sp.product_size_color.map(psc => (
                                <span key={psc.id} style={{
                                  fontSize: '0.65rem',
                                  padding: '2px 6px',
                                  backgroundColor: 'var(--bg-primary)',
                                  border: '1px solid var(--border-light)',
                                  display: 'inline-flex',
                                  gap: '4px'
                                }}>
                                  <strong style={{ color: 'var(--accent)' }}>{psc.size}</strong> 
                                  <span>{psc.color}</span> 
                                  <span style={{ opacity: 0.6 }}>({psc.stock_quantity})</span>
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div style={{
                          display: 'flex',
                          borderTop: '1px solid var(--border-light)',
                          paddingTop: '12px',
                          gap: '8px'
                        }}>
                          <button
                            onClick={() => {
                              startEditingProduct(sp);
                              window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                            className="btn btn-secondary"
                            style={{ flex: 1, padding: '8px', fontSize: '0.7rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
                          >
                            <Edit3 size={12} /> MODIFY
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(sp.id)}
                            className="btn btn-secondary"
                            style={{ padding: '8px', width: '36px', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            title="Delete Garment"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}

        {/* ---------------- ATTRIBUTES TAB ---------------- */}
        {activeTab === 'attributes' && (
          <div className="animate-fade-in" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '32px'
          }}>
            
            {/* Create form */}
            <div style={{
              border: '2px solid var(--border-primary)',
              padding: '24px',
              backgroundColor: 'var(--bg-secondary)',
              height: 'fit-content'
            }}>
              <h3 style={{ textTransform: 'uppercase', letterSpacing: '0.08em', fontSize: '1.1rem', borderBottom: '1px solid var(--border-primary)', paddingBottom: '12px', marginBottom: '20px' }}>
                ADD REGISTRY ATTRIBUTE
              </h3>
              
              <form onSubmit={handleCreateAttributeSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Attribute Registry Classification</label>
                  <select
                    className="form-input"
                    value={newAttr.type}
                    onChange={(e) => setNewAttr({ ...newAttr, type: e.target.value })}
                  >
                    <option value="category">Category Classification</option>
                    <option value="color">Color Swatch Name</option>
                    <option value="size">Standard Metric Size</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Attribute Name</label>
                  <input
                    type="text"
                    className="form-input"
                    value={newAttr.name}
                    onChange={(e) => setNewAttr({ ...newAttr, name: e.target.value })}
                    placeholder="e.g. Vintage Indigo, XXL, Kids Outerwear"
                    required
                  />
                </div>

                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={actionLoading}
                  style={{ width: '100%' }}
                >
                  {actionLoading ? 'SUBMITTING...' : 'ADD TO REGISTRY'}
                </button>
              </form>
            </div>

            {/* Registry Lists Display */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '24px'
            }}>
              {attributesLoading ? (
                <div style={{ padding: '24px', textAlign: 'center' }}>LOADING SYSTEM REGISTRY...</div>
              ) : (
                <>
                  {/* Categories */}
                  <div style={{ border: '1px solid var(--border-primary)', padding: '20px', backgroundColor: 'var(--bg-primary)' }}>
                    <h4 style={{ textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.8rem', borderBottom: '1px solid var(--border-primary)', paddingBottom: '8px', marginBottom: '12px' }}>
                      Categories Registered ({attributes.categories.length})
                    </h4>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {attributes.categories.map(c => (
                        <span key={c.id} style={{ border: '1px solid var(--border-primary)', padding: '4px 10px', fontSize: '0.75rem', fontWeight: 600, backgroundColor: 'var(--bg-secondary)' }}>
                          {c.name}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Colors */}
                  <div style={{ border: '1px solid var(--border-primary)', padding: '20px', backgroundColor: 'var(--bg-primary)' }}>
                    <h4 style={{ textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.8rem', borderBottom: '1px solid var(--border-primary)', paddingBottom: '8px', marginBottom: '12px' }}>
                      Color Swatches ({attributes.colors.length})
                    </h4>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {attributes.colors.map(c => (
                        <span key={c.id} style={{ border: '1px solid var(--border-primary)', padding: '4px 10px', fontSize: '0.75rem', fontWeight: 600, backgroundColor: 'var(--bg-secondary)' }}>
                          {c.name}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Sizes */}
                  <div style={{ border: '1px solid var(--border-primary)', padding: '20px', backgroundColor: 'var(--bg-primary)' }}>
                    <h4 style={{ textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.8rem', borderBottom: '1px solid var(--border-primary)', paddingBottom: '8px', marginBottom: '12px' }}>
                      Metric Sizes ({attributes.sizes.length})
                    </h4>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {attributes.sizes.map(c => (
                        <span key={c.id} style={{ border: '1px solid var(--border-primary)', padding: '4px 10px', fontSize: '0.75rem', fontWeight: 600, backgroundColor: 'var(--bg-secondary)' }}>
                          {c.name}
                        </span>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>

          </div>
        )}

      </div>

      {/* ---------------- ORDER DETAIL INSPECT DRAWER ---------------- */}
      {selectedOrder && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(26, 26, 26, 0.4)',
          zIndex: 100,
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'stretch'
        }} className="animate-fade-in">
          <div 
            onClick={() => setSelectedOrder(null)} 
            style={{ flex: 1 }}
          ></div>
          <div style={{
            width: '100%',
            maxWidth: '520px',
            backgroundColor: 'var(--bg-primary)',
            borderLeft: '2px solid var(--border-primary)',
            padding: '32px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            overflowY: 'auto'
          }} className="animate-slide-in">
            
            <div>
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-primary)', paddingBottom: '16px', marginBottom: '24px' }}>
                <h3 style={{ textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '1.1rem', margin: 0 }}>
                  INSPECT ORDER #{selectedOrder.order_id}
                </h3>
                <button 
                  onClick={() => setSelectedOrder(null)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                >
                  <X size={20} />
                </button>
              </div>

              {/* Order Info */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', fontSize: '0.85rem' }}>
                
                {/* Meta details */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', borderBottom: '1px solid var(--border-light)', paddingBottom: '16px' }}>
                  <div>
                    <span style={{ fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)' }}>TRANSACTION DATE</span>
                    <div style={{ fontWeight: 700, marginTop: '2px' }}>{selectedOrder.order_date}</div>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)' }}>PAYMENT MODE</span>
                    <div style={{ fontWeight: 700, marginTop: '2px' }}>{selectedOrder.payment_mode}</div>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)' }}>SHIPPING CHARGES</span>
                    <div style={{ fontWeight: 700, marginTop: '2px' }}>₹{selectedOrder.shipping_charge}</div>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)' }}>DELIVERY EST.</span>
                    <div style={{ fontWeight: 700, marginTop: '2px' }}>{selectedOrder.delivery_date || 'N/A'}</div>
                  </div>
                </div>

                {/* Shipping Address */}
                <div>
                  <span style={{ fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)' }}>SHIPPING DESTINATION</span>
                  <div style={{ marginTop: '4px', border: '1px solid var(--border-light)', padding: '12px', backgroundColor: 'var(--bg-secondary)' }}>
                    <div style={{ fontWeight: 700 }}>{selectedOrder.address?.first_name} {selectedOrder.address?.last_name}</div>
                    <div style={{ margin: '4px 0' }}>{selectedOrder.address?.street_address}</div>
                    <div>{selectedOrder.address?.city}, {selectedOrder.address?.state?.state_name} - {selectedOrder.address?.pincode}</div>
                    <div style={{ marginTop: '6px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      TEL: {selectedOrder.address?.phone_number} | MAIL: {selectedOrder.address?.email}
                    </div>
                  </div>
                </div>

                {/* Items */}
                <div>
                  <span style={{ fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)' }}>CONSTITUENT GARMENTS</span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '6px' }}>
                    {selectedOrder.items.map(item => (
                      <div key={item.id} style={{
                        display: 'flex',
                        gap: '12px',
                        padding: '8px 0',
                        borderBottom: '1px dashed var(--border-light)'
                      }}>
                        <div style={{ width: '48px', height: '48px', backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-light)' }}>
                          {item.subproduct?.image ? (
                            <img 
                              src={item.subproduct.image.startsWith('http') ? item.subproduct.image : `${API_BASE.replace('/api', '')}/media/${item.subproduct.image}`}
                              alt={item.subproduct?.product?.name}
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                          ) : null}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 700 }}>{item.subproduct?.product?.name}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                            Metric: {item.size} • Swatch: {item.color} • Qty: {item.quantity}
                          </div>
                        </div>
                        <div style={{ fontWeight: 700 }}>
                          ₹{item.price}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>

            {/* Actions footer */}
            <div style={{ borderTop: '1px solid var(--border-primary)', paddingTop: '20px', marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 800, textTransform: 'uppercase' }}>GRAND TOTAL</span>
                <span style={{ fontSize: '1.4rem', fontFamily: 'var(--font-heading)', fontWeight: 700 }}>₹{selectedOrder.total_amount}</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '8px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)' }}>UPDATE TRANSACTION STATUS</label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {['Pending', 'Confirmed', 'Delivered', 'Cancelled'].map(statusOption => (
                      <button
                        key={statusOption}
                        onClick={() => handleUpdateOrderStatus(selectedOrder.order_id, statusOption)}
                        style={{
                          flex: 1,
                          padding: '10px 4px',
                          fontSize: '0.7rem',
                          backgroundColor: selectedOrder.order_status === statusOption ? 'var(--border-primary)' : 'var(--bg-secondary)',
                          color: selectedOrder.order_status === statusOption ? 'var(--bg-primary)' : 'var(--text-primary)',
                          border: '1px solid var(--border-primary)',
                          cursor: 'pointer',
                          fontWeight: 700,
                          textTransform: 'uppercase'
                        }}
                      >
                        {statusOption}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Animation rule inject */}
      <style>{`
        .animate-spin {
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

export default AdminDashboard;
