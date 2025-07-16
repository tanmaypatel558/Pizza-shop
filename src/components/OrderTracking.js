import React, { useState, useEffect, useCallback } from 'react';
import { io } from 'socket.io-client';
import './OrderTracking.css';

// Mock tracking data for demo orders
const generateMockTrackingData = (orderId) => {
  const pizzaNames = ['Margherita Pizza', 'Pepperoni Deluxe', 'Vegetarian Supreme', 'BBQ Chicken', 'Hawaiian Special'];
  const addresses = ['123 Main St, San Francisco, CA', '456 Oak Ave, Oakland, CA', '789 Pine Rd, Berkeley, CA'];
  const names = ['John Doe', 'Jane Smith', 'Mike Johnson', 'Sarah Wilson', 'David Brown'];
  
  const randomPizza = pizzaNames[Math.floor(Math.random() * pizzaNames.length)];
  const randomAddress = addresses[Math.floor(Math.random() * addresses.length)];
  const randomName = names[Math.floor(Math.random() * names.length)];
  
  // Generate realistic timestamps
  const now = new Date();
  const orderTime = new Date(now.getTime() - (Math.random() * 30 + 10) * 60000); // 10-40 minutes ago
  const prepTime = new Date(orderTime.getTime() + 5 * 60000); // 5 minutes after order
  const ovenTime = new Date(orderTime.getTime() + 15 * 60000); // 15 minutes after order
  const estimatedDelivery = new Date(now.getTime() + (Math.random() * 20 + 10) * 60000); // 10-30 minutes from now
  
  return {
    id: orderId,
    pizza: {
      name: randomPizza,
      image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80"
    },
    quantity: Math.floor(Math.random() * 3) + 1,
    totalPrice: (Math.random() * 20 + 15).toFixed(2),
    status: 'in-preparation',
    estimatedDelivery: estimatedDelivery.toISOString(),
    customerInfo: {
      name: randomName,
      phone: `(${Math.floor(Math.random() * 900) + 100}) ${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`,
      address: randomAddress
    },
    statusHistory: [
      {
        status: 'received',
        label: 'Order Received',
        icon: '📨',
        completed: true,
        current: false,
        timestamp: orderTime.toISOString()
      },
      {
        status: 'in-preparation',
        label: 'Preparing Your Order',
        icon: '👨‍🍳',
        completed: true,
        current: true,
        timestamp: prepTime.toISOString()
      },
      {
        status: 'in-oven',
        label: 'In the Oven',
        icon: '🔥',
        completed: false,
        current: false,
        timestamp: null
      },
      {
        status: 'ready',
        label: 'Ready for Pickup',
        icon: '✅',
        completed: false,
        current: false,
        timestamp: null
      },
      {
        status: 'out-for-delivery',
        label: 'Out for Delivery',
        icon: '🚚',
        completed: false,
        current: false,
        timestamp: null
      },
      {
        status: 'delivered',
        label: 'Delivered',
        icon: '🎉',
        completed: false,
        current: false,
        timestamp: null
      }
    ]
  };
};

const OrderTracking = ({ orderId, onClose }) => {
  const [trackingData, setTrackingData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [inputOrderId, setInputOrderId] = useState('');
  const [currentOrderId, setCurrentOrderId] = useState(orderId || '');
  const [isDemoOrder, setIsDemoOrder] = useState(false);

  const fetchTrackingData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Check if this is a demo order
      if (currentOrderId.startsWith('demo-')) {
        setIsDemoOrder(true);
        // Generate mock tracking data for demo orders
        const mockData = generateMockTrackingData(currentOrderId);
        setTrackingData(mockData);
        setLoading(false);
        return;
      }
      
      setIsDemoOrder(false);
      
      // Try to fetch from backend with timeout
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
      
      const response = await fetch(`${apiUrl}/api/orders/${currentOrderId}/track`, {
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        const data = await response.json();
        setTrackingData(data);
      } else {
        setError('Order not found');
      }
    } catch (error) {
      console.error('Error fetching tracking data:', error);
      
      if (error.name === 'AbortError') {
        setError('Request timed out. Please try again.');
      } else {
        setError('Failed to fetch tracking data. Please check your order ID.');
      }
    } finally {
      setLoading(false);
    }
  }, [currentOrderId]);

  useEffect(() => {
    if (!currentOrderId) {
      setLoading(false);
      return;
    }

    // Don't setup socket connection for demo orders
    if (currentOrderId.startsWith('demo-')) {
      fetchTrackingData();
      return;
    }

    // Initialize socket connection for real orders
    const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
    
    let socketConnection;
    
    try {
      socketConnection = io(apiUrl);

      // Join customer room for real-time updates
      socketConnection.emit('join-customer', currentOrderId);

      // Listen for real-time order updates
      socketConnection.on('order-status-updated', (updatedOrder) => {
        if (updatedOrder.id === currentOrderId) {
          fetchTrackingData();
        }
      });
    } catch (error) {
      console.error('Socket connection failed:', error);
    }

    // Initial fetch
    fetchTrackingData();

    return () => {
      if (socketConnection) {
        socketConnection.emit('leave-customer', currentOrderId);
        socketConnection.disconnect();
      }
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
                placeholder="Enter your order ID (e.g., demo-abc123...)"
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
              <p>🍕 Demo orders start with "demo-" prefix.</p>
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

        {/* Demo Mode Notification */}
        {isDemoOrder && (
          <div className="demo-notification">
            <p>🍕 Demo Mode: Simulated order tracking</p>
          </div>
        )}

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
              <span>{isDemoOrder ? 'Demo Mode Active' : 'Live Updates Active'}</span>
            </div>
            <p>{isDemoOrder ? 'Simulated order tracking for demonstration' : 'Your order status will update automatically'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderTracking; 