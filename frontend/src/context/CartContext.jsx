import React, { createContext, useState, useEffect, useContext } from 'react';
import { useAuth, API_BASE } from './AuthContext';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { token } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [cartSummary, setCartSummary] = useState({
    total_amount: 0,
    shipping_charge: 0,
    grand_total: 0,
    item_count: 0
  });
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const toggleCart = () => setIsCartOpen(!isCartOpen);
  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);

  const fetchCart = async () => {
    if (!token) {
      setCartItems([]);
      setCartSummary({
        total_amount: 0,
        shipping_charge: 0,
        grand_total: 0,
        item_count: 0
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/cart/`, {
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setCartItems(data.items);
        setCartSummary(data.summary);
      }
    } catch (err) {
      console.error('Error fetching cart:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch cart automatically when token changes
  useEffect(() => {
    fetchCart();
  }, [token]);

  const addToCart = async (subproduct_id, quantity, size, color) => {
    if (!token) {
      return { success: false, error: 'Please login to add items to cart.' };
    }

    try {
      const response = await fetch(`${API_BASE}/cart/`, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ subproduct_id, quantity, size, color })
      });

      const data = await response.json();

      if (response.ok) {
        await fetchCart();
        openCart(); // Slide open cart drawer on successful add!
        return { success: true };
      } else {
        return { success: false, error: data.error || 'Could not add to cart' };
      }
    } catch (err) {
      return { success: false, error: 'Network error. Please try again.' };
    }
  };

  const updateCartItem = async (cartItemId, quantity, size, color) => {
    if (!token) return { success: false };

    try {
      const response = await fetch(`${API_BASE}/cart/${cartItemId}/`, {
        method: 'PUT',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ quantity, size, color })
      });

      const data = await response.json();

      if (response.ok) {
        await fetchCart();
        return { success: true };
      } else {
        return { success: false, error: data.error || 'Could not update item' };
      }
    } catch (err) {
      return { success: false, error: 'Network error.' };
    }
  };

  const removeCartItem = async (cartItemId) => {
    if (!token) return { success: false };

    try {
      const response = await fetch(`${API_BASE}/cart/${cartItemId}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        await fetchCart();
        return { success: true };
      } else {
        return { success: false, error: 'Could not remove item' };
      }
    } catch (err) {
      return { success: false, error: 'Network error.' };
    }
  };

  const clearCartLocally = () => {
    setCartItems([]);
    setCartSummary({
      total_amount: 0,
      shipping_charge: 0,
      grand_total: 0,
      item_count: 0
    });
  };

  return (
    <CartContext.Provider value={{
      cartItems, cartSummary, isCartOpen, loading,
      toggleCart, openCart, closeCart, fetchCart,
      addToCart, updateCartItem, removeCartItem, clearCartLocally
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
