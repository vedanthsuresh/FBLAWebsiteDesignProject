import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem('hma-cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('hma-cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (item) => {
    setCart((prevCart) => {
      // Check if item already exists to avoid duplicates if desired, 
      // but usually for events you might want multiple "tickets" 
      // though the user said "add an event it should be added to the cart".
      // Let's allow duplicates for now or handle by quantity if needed.
      // For simplicity, let's treat each add as a new item entry.
      const newItem = {
        ...item,
        cartId: Math.random().toString(36).substr(2, 9),
        addedAt: new Date().toISOString()
      };
      return [...prevCart, newItem];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (cartId) => {
    setCart((prevCart) => prevCart.filter((item) => item.cartId !== cartId));
  };

  const clearCart = () => {
    setCart([]);
  };

  const toggleCart = () => setIsCartOpen(!isCartOpen);

  return (
    <CartContext.Provider value={{ 
      cart, 
      addToCart, 
      removeFromCart, 
      clearCart, 
      isCartOpen, 
      setIsCartOpen, 
      toggleCart 
    }}>
      {children}
    </CartContext.Provider>
  );
};
