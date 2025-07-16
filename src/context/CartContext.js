import React, { createContext, useContext, useReducer } from 'react';

const CartContext = createContext();

const initialState = {
  items: [],
  isOpen: false,
  totalItems: 0,
  totalPrice: 0,
  recentOrders: []
};

const cartReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_ITEM':
      const existingItemIndex = state.items.findIndex(
        item => item.id === action.payload.id && 
                JSON.stringify(item.extraToppings) === JSON.stringify(action.payload.extraToppings) &&
                item.isGlutenFree === action.payload.isGlutenFree
      );

      let newItems;
      if (existingItemIndex !== -1) {
        // Update existing item quantity
        newItems = state.items.map((item, index) =>
          index === existingItemIndex
            ? { ...item, quantity: item.quantity + action.payload.quantity }
            : item
        );
      } else {
        // Add new item
        newItems = [...state.items, { ...action.payload, cartId: Date.now() }];
      }

      return {
        ...state,
        items: newItems,
        totalItems: newItems.reduce((total, item) => total + item.quantity, 0),
        totalPrice: newItems.reduce((total, item) => total + (item.totalPrice * item.quantity), 0)
      };

    case 'REMOVE_ITEM':
      const filteredItems = state.items.filter(item => item.cartId !== action.payload);
      return {
        ...state,
        items: filteredItems,
        totalItems: filteredItems.reduce((total, item) => total + item.quantity, 0),
        totalPrice: filteredItems.reduce((total, item) => total + (item.totalPrice * item.quantity), 0)
      };

    case 'UPDATE_QUANTITY':
      const updatedItems = state.items.map(item =>
        item.cartId === action.payload.cartId
          ? { ...item, quantity: action.payload.quantity }
          : item
      ).filter(item => item.quantity > 0);

      return {
        ...state,
        items: updatedItems,
        totalItems: updatedItems.reduce((total, item) => total + item.quantity, 0),
        totalPrice: updatedItems.reduce((total, item) => total + (item.totalPrice * item.quantity), 0)
      };

    case 'CLEAR_CART':
      return {
        ...state,
        items: [],
        totalItems: 0,
        totalPrice: 0
      };

    case 'TOGGLE_CART':
      return {
        ...state,
        isOpen: !state.isOpen
      };

    case 'OPEN_CART':
      return {
        ...state,
        isOpen: true
      };

    case 'CLOSE_CART':
      return {
        ...state,
        isOpen: false
      };

    case 'ADD_RECENT_ORDER':
      const newRecentOrders = [action.payload, ...state.recentOrders.slice(0, 4)]; // Keep only last 5 orders
      return {
        ...state,
        recentOrders: newRecentOrders
      };

    case 'CLEAR_RECENT_ORDERS':
      return {
        ...state,
        recentOrders: []
      };

    default:
      return state;
  }
};

export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  const addItem = (item) => {
    dispatch({ type: 'ADD_ITEM', payload: item });
  };

  const removeItem = (cartId) => {
    dispatch({ type: 'REMOVE_ITEM', payload: cartId });
  };

  const updateQuantity = (cartId, quantity) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { cartId, quantity } });
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  const toggleCart = () => {
    dispatch({ type: 'TOGGLE_CART' });
  };

  const openCart = () => {
    dispatch({ type: 'OPEN_CART' });
  };

  const closeCart = () => {
    dispatch({ type: 'CLOSE_CART' });
  };

  const addRecentOrder = (order) => {
    dispatch({ type: 'ADD_RECENT_ORDER', payload: order });
  };

  const clearRecentOrders = () => {
    dispatch({ type: 'CLEAR_RECENT_ORDERS' });
  };

  return (
    <CartContext.Provider
      value={{
        ...state,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        toggleCart,
        openCart,
        closeCart,
        addRecentOrder,
        clearRecentOrders
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}; 