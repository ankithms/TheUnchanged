import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Navbar from './components/Navbar';
import CartDrawer from './components/CartDrawer';
import Footer from './components/Footer';

// Pages
import Home from './pages/Home';
import ProductDetail from './pages/ProductDetail';
import AuthPage from './pages/AuthPage';
import Checkout from './pages/Checkout';
import OrderConfirmPage from './pages/OrderConfirmPage';
import OrderHistory from './pages/OrderHistory';
import About from './pages/About';
import Contact from './pages/Contact';
import AdminDashboard from './pages/AdminDashboard';

import './App.css';

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            minHeight: '100vh',
            position: 'relative'
          }}>
            {/* Header Sticky Navigation */}
            <Navbar />

            {/* Main Page Content */}
            <main style={{ flex: 1 }}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/products/:id" element={<ProductDetail />} />
                <Route path="/auth" element={<AuthPage />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/order-confirm/:orderId" element={<OrderConfirmPage />} />
                <Route path="/orders" element={<OrderHistory />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/admin" element={<AdminDashboard />} />
              </Routes>
            </main>

            {/* Shopping Cart Slider Drawer Overlay */}
            <CartDrawer />

            {/* Global Footer */}
            <Footer />
          </div>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
