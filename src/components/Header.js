import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import OrderTracking from './OrderTracking';
import './Header.css';

const Header = () => {
  const { totalItems, toggleCart } = useCart();
  const [showOrderTracking, setShowOrderTracking] = useState(false);
  const [trackingOrderId, setTrackingOrderId] = useState('');
  
  const handleTrackOrder = () => {
    setShowOrderTracking(true);
  };

  const closeOrderTracking = () => {
    setShowOrderTracking(false);
    setTrackingOrderId('');
  };

  return (
    <header className="header">
      <nav className="breadcrumb">
        <button className="breadcrumb-link" onClick={() => window.location.href = '/'}>Home</button>
        <span className="breadcrumb-separator">/</span>
        <button className="breadcrumb-link" onClick={() => window.location.href = '/san-francisco'}>San Francisco</button>
        <span className="breadcrumb-separator">/</span>
        <button className="breadcrumb-link" onClick={() => window.location.href = '/italian'}>Italian</button>
        <span className="breadcrumb-separator">/</span>
        <span className="breadcrumb-current">Gioia Pizzeria</span>
      </nav>
      <div className="header-actions">
        <button className="track-order-btn" onClick={handleTrackOrder}>
          <span className="track-icon">📦</span>
          <span className="track-text">Track Order</span>
        </button>
        <div className="cart-icon-container">
          <button className="cart-icon-btn" onClick={toggleCart}>
            <span className="cart-icon">🛒</span>
            {totalItems > 0 && (
              <span className="cart-badge">{totalItems}</span>
            )}
          </button>
        </div>
      </div>

      {showOrderTracking && (
        <OrderTracking
          orderId={trackingOrderId}
          onClose={closeOrderTracking}
        />
      )}
    </header>
  );
};

export default Header; 