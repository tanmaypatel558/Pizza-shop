import React, { useState, useEffect, useCallback } from 'react';
import { io } from 'socket.io-client';
import './OrderTracking.css';

const OrderTracking = ({ orderId, onClose }) => {
  const [trackingData, setTrackingData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [inputOrderId, setInputOrderId] = useState('');
  const [currentOrderId, setCurrentOrderId] = useState(orderId || '');

  const fetchTrackingData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiUrl}/api/orders/${currentOrderId}/track`);
      
      if (response.ok) {
        const data = await response.json();
        setTrackingData(data);
      } else {
        setError('Order not found');
      }
    } catch (error) {
      console.error('Error fetching tracking data:', error);
      setError('Failed to fetch tracking data');
    } finally {
      setLoading(false);
    }
  }, [currentOrderId]);

  useEffect(() => {
    if (!currentOrderId) {
      setLoading(false);
      return;
    }

    // Initialize socket connection
          const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      const socketConnection = io(apiUrl);

    // Join customer room for real-time updates
    socketConnection.emit('join-customer', currentOrderId);

    // Listen for real-time order updates
    socketConnection.on('order-status-updated', (updatedOrder) => {
      if (updatedOrder.id === currentOrderId) {
        fetchTrackingData();
      }
    });

    // Initial fetch
    fetchTrackingData();

    return () => {
      socketConnection.emit('leave-customer', currentOrderId);
      socketConnection.disconnect();
    };
  }, [currentOrderId, fetchTrackingData]);

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    return new Date(timestamp).toLocaleString();
  };

  const formatEstimatedDelivery = (timestamp) => {
    if (!timestamp) return '';
    const time = new Date(timestamp);
    const now = new Date();
    const diffMinutes = Math.ceil((time - now) / (1000 * 60));
    
    if (diffMinutes <= 0) return 'Now';
    if (diffMinutes < 60) return `${diffMinutes} min`;
    
    const hours = Math.floor(diffMinutes / 60);
    const minutes = diffMinutes % 60;
    return `${hours}h ${minutes}m`;
  };

  const handleTrackOrder = () => {
    if (inputOrderId.trim()) {
      setCurrentOrderId(inputOrderId.trim());
      setInputOrderId('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleTrackOrder();
    }
  };

  if (loading) {
    return (
      <div className="order-tracking-modal">
        <div className="tracking-container">
          <div className="tracking-header">
            <h2>Order Tracking</h2>
            <button className="close-btn" onClick={onClose}>×</button>
          </div>
          <div className="tracking-loading">
            <div className="loading-spinner"></div>
            <p>Loading tracking information...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!currentOrderId) {
    return (
      <div className="order-tracking-modal">
        <div className="tracking-container">
          <div className="tracking-header">
            <h2>Order Tracking</h2>
            <button className="close-btn" onClick={onClose}>×</button>
          </div>
          <div className="tracking-input">
            <div className="input-icon">📦</div>
            <h3>Track Your Order</h3>
            <p>Enter your order ID to track your pizza delivery</p>
            <div className="input-group">
              <input
                type="text"
                value={inputOrderId}
                onChange={(e) => setInputOrderId(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Enter your order ID (e.g., e084ce3c-24da-4c71...)"
                className="order-id-input"
              />
              <button 
                className="track-btn-primary"
                onClick={handleTrackOrder}
                disabled={!inputOrderId.trim()}
              >
                Track Order
              </button>
            </div>
            <div className="help-text">
              <p>💡 Your order ID was provided when you placed your order.</p>
              <p>📱 Check your confirmation message or recent orders.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="order-tracking-modal">
        <div className="tracking-container">
          <div className="tracking-header">
            <h2>Order Tracking</h2>
            <button className="close-btn" onClick={onClose}>×</button>
          </div>
          <div className="tracking-error">
            <div className="error-icon">❌</div>
            <h3>Order Not Found</h3>
            <p>{error}</p>
            <div className="error-actions">
              <button className="retry-btn" onClick={fetchTrackingData}>
                Try Again
              </button>
              <button className="back-btn" onClick={() => setCurrentOrderId('')}>
                Enter Different ID
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Add null check for trackingData
  if (!trackingData) {
    return (
      <div className="order-tracking-modal">
        <div className="tracking-container">
          <div className="tracking-header">
            <h2>Order Tracking</h2>
            <button className="close-btn" onClick={onClose}>×</button>
          </div>
          <div className="tracking-loading">
            <div className="loading-spinner"></div>
            <p>Loading tracking information...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="order-tracking-modal">
      <div className="tracking-container">
        <div className="tracking-header">
          <h2>Order Tracking</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="tracking-content">
          {/* Order Summary */}
          <div className="order-summary">
            <div className="order-id">
              <span className="label">Order ID:</span>
              <span className="value">{trackingData.id}</span>
            </div>
            <div className="order-info">
              <div className="pizza-info">
                <img 
                  src={trackingData.pizza.image} 
                  alt={trackingData.pizza.name}
                  className="pizza-image"
                />
                <div className="pizza-details">
                  <h3>{trackingData.pizza.name}</h3>
                  <p>Quantity: {trackingData.quantity}</p>
                  <p className="total-price">Total: ${trackingData.totalPrice}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Estimated Delivery */}
          <div className="estimated-delivery">
            <div className="delivery-icon">🚚</div>
            <div className="delivery-info">
              <h3>Estimated Delivery</h3>
              <p className="delivery-time">
                {formatEstimatedDelivery(trackingData.estimatedDelivery)}
              </p>
              <p className="delivery-address">
                {trackingData.customerInfo.address}
              </p>
            </div>
          </div>

          {/* Status Timeline */}
          <div className="status-timeline">
            <h3>Order Status</h3>
            <div className="timeline">
              {trackingData.statusHistory.map((step, index) => (
                <div 
                  key={step.status}
                  className={`timeline-step ${step.completed ? 'completed' : ''} ${step.current ? 'current' : ''}`}
                >
                  <div className="step-icon">
                    <span className="icon">{step.icon}</span>
                  </div>
                  <div className="step-content">
                    <div className="step-label">{step.label}</div>
                    {step.timestamp && (
                      <div className="step-time">{formatTime(step.timestamp)}</div>
                    )}
                  </div>
                  {index < trackingData.statusHistory.length - 1 && (
                    <div className="step-line"></div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Customer Information */}
          <div className="customer-info">
            <h3>Delivery Information</h3>
            <div className="info-grid">
              <div className="info-item">
                <span className="info-label">Name:</span>
                <span className="info-value">{trackingData.customerInfo.name}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Phone:</span>
                <span className="info-value">{trackingData.customerInfo.phone}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Address:</span>
                <span className="info-value">{trackingData.customerInfo.address}</span>
              </div>
            </div>
          </div>

          {/* Live Updates Status */}
          <div className="live-status">
            <div className="live-indicator">
              <div className="pulse"></div>
              <span>Live Updates Active</span>
            </div>
            <p>Your order status will update automatically</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderTracking; 