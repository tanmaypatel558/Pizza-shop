import React, { useState, useEffect, useCallback } from 'react';
import { io } from 'socket.io-client';
import './OrderTracking.css';

const OrderTracking = ({ orderId, onClose }) => {
  const [trackingData, setTrackingData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [inputOrderId, setInputOrderId] = useState('');
  const [currentOrderId, setCurrentOrderId] = useState(orderId || '');
  const [, setSocket] = useState(null);

  const fetchTrackingData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Check if this is a demo order
      const isDemoOrder = currentOrderId.startsWith('DEMO-');
      const isProduction = process.env.NODE_ENV === 'production';
      const hasApiUrl = process.env.REACT_APP_API_URL;
      
      if (isDemoOrder || (isProduction && !hasApiUrl)) {
        // Generate mock tracking data for demo mode
        const mockTrackingData = {
          id: currentOrderId,
          status: 'in-preparation',
          pizza: {
            id: 1,
            name: 'DEMO PIZZA',
            price: '$24.00',
            image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80'
          },
          quantity: 1,
          totalPrice: '24.00',
          customerInfo: {
            name: 'Demo Customer',
            phone: '(555) 123-4567',
            address: '123 Demo Street, Demo City'
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          estimatedDelivery: new Date(Date.now() + 30 * 60000).toISOString(), // 30 minutes from now
          statusHistory: [
            {
              status: 'received',
              label: 'Order Received',
              icon: '📋',
              completed: true,
              current: false,
              timestamp: new Date(Date.now() - 10 * 60000).toISOString() // 10 minutes ago
            },
            {
              status: 'in-preparation',
              label: 'Preparing',
              icon: '👨‍🍳',
              completed: true,
              current: true,
              timestamp: new Date(Date.now() - 5 * 60000).toISOString() // 5 minutes ago
            },
            {
              status: 'in-oven',
              label: 'In Oven',
              icon: '🔥',
              completed: false,
              current: false,
              timestamp: null
            },
            {
              status: 'ready',
              label: 'Ready',
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
        
        // Simulate loading delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setTrackingData(mockTrackingData);
        setError(null);
        console.log('Demo mode: Using mock tracking data');
        return;
      }
      
      // Use environment variable for API URL or fallback to localhost for development
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout
      
      const response = await fetch(`${apiUrl}/api/orders/${currentOrderId}/track`, {
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        const data = await response.json();
        setTrackingData(data);
        setError(null);
      } else if (response.status === 404) {
        setError('Order not found. Please check your order ID and try again.');
      } else {
        setError('Unable to fetch order details. Please try again later.');
      }
    } catch (error) {
      console.error('Error fetching tracking data:', error);
      
      if (error.name === 'AbortError') {
        setError('Request timed out. Please check your connection and try again.');
      } else {
        setError('Unable to connect to order tracking service. Please try again later.');
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
    
    fetchTrackingData();
  }, [currentOrderId, fetchTrackingData]);

  // Socket connection for real-time updates
  useEffect(() => {
    if (!trackingData) return;
    
    const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
    
    try {
      const newSocket = io(apiUrl);
      setSocket(newSocket);
      
      // Join the order room for real-time updates
      newSocket.emit('join-order-room', currentOrderId);
      
      // Listen for order status updates
      newSocket.on('order-status-update', (updatedOrder) => {
        if (updatedOrder.id === currentOrderId) {
          setTrackingData(updatedOrder);
        }
      });
      
      return () => {
        newSocket.disconnect();
      };
    } catch (error) {
      console.error('Socket connection error:', error);
      // Continue without socket if connection fails
    }
  }, [currentOrderId, trackingData]);

  const handleTrackOrder = () => {
    if (inputOrderId.trim()) {
      setCurrentOrderId(inputOrderId.trim());
      setInputOrderId('');
    }
  };

  const handleRetry = () => {
    if (currentOrderId) {
      fetchTrackingData();
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'received':
        return '📨';
      case 'in-preparation':
        return '👨‍🍳';
      case 'in-oven':
        return '🔥';
      case 'ready':
        return '✅';
      case 'out-for-delivery':
        return '🚗';
      case 'delivered':
        return '🎉';
      default:
        return '⏳';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'received':
        return '#007bff';
      case 'in-preparation':
        return '#ffc107';
      case 'in-oven':
        return '#fd7e14';
      case 'ready':
        return '#28a745';
      case 'out-for-delivery':
        return '#6f42c1';
      case 'delivered':
        return '#20c997';
      default:
        return '#6c757d';
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatEstimatedDelivery = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = date - now;
    const diffMins = Math.round(diffMs / 60000);
    
    if (diffMins <= 0) return 'Any moment now';
    if (diffMins === 1) return 'In 1 minute';
    if (diffMins < 60) return `In ${diffMins} minutes`;
    
    return date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  if (loading) {
    return (
      <div className="order-tracking-overlay">
        <div className="order-tracking-modal">
          <div className="order-tracking-header">
            <h2>Order Tracking</h2>
            <button className="close-btn" onClick={onClose}>×</button>
          </div>
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading order details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="order-tracking-overlay">
        <div className="order-tracking-modal">
          <div className="order-tracking-header">
            <h2>Order Tracking</h2>
            <button className="close-btn" onClick={onClose}>×</button>
          </div>
          <div className="error-container">
            <div className="error-icon">❌</div>
            <h3>Unable to Track Order</h3>
            <p>{error}</p>
            <div className="error-actions">
              <button onClick={handleRetry} className="retry-btn">
                Try Again
              </button>
              <button onClick={() => setCurrentOrderId('')} className="back-btn">
                Enter Different Order ID
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!currentOrderId) {
    return (
      <div className="order-tracking-overlay">
        <div className="order-tracking-modal">
          <div className="order-tracking-header">
            <h2>Order Tracking</h2>
            <button className="close-btn" onClick={onClose}>×</button>
          </div>
          <div className="order-id-input">
            <h3>Enter Order ID</h3>
            <p>Please enter your order ID to track your order</p>
            <div className="input-group">
              <input
                type="text"
                value={inputOrderId}
                onChange={(e) => setInputOrderId(e.target.value)}
                placeholder="Enter your order ID"
                onKeyPress={(e) => e.key === 'Enter' && handleTrackOrder()}
              />
              <button onClick={handleTrackOrder} disabled={!inputOrderId.trim()}>
                Track Order
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!trackingData) {
    return (
      <div className="order-tracking-overlay">
        <div className="order-tracking-modal">
          <div className="order-tracking-header">
            <h2>Order Tracking</h2>
            <button className="close-btn" onClick={onClose}>×</button>
          </div>
          <div className="no-data-container">
            <div className="no-data-icon">📦</div>
            <h3>No Order Data</h3>
            <p>Unable to load order information</p>
            <button onClick={handleRetry} className="retry-btn">
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="order-tracking-overlay">
      <div className="order-tracking-modal">
        <div className="order-tracking-header">
          <h2>Order Tracking</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        {/* Demo mode notification */}
        {(currentOrderId.startsWith('DEMO-') || (process.env.NODE_ENV === 'production' && !process.env.REACT_APP_API_URL)) && (
          <div className="demo-notification">
            <p>
              <span>🧪</span>
              <strong>Demo Mode:</strong> This is a simulated order for demonstration purposes
            </p>
          </div>
        )}

        <div className="order-info">
          <div className="order-details">
            <h3>Order #{currentOrderId}</h3>
            <div className="order-meta">
              <span className="order-status" style={{ color: getStatusColor(trackingData.status) }}>
                {getStatusIcon(trackingData.status)} {trackingData.status?.replace('-', ' ').toUpperCase()}
              </span>
              {trackingData.estimatedDelivery && (
                <span className="estimated-delivery">
                  🕐 Estimated: {formatEstimatedDelivery(trackingData.estimatedDelivery)}
                </span>
              )}
            </div>
          </div>

          {trackingData.pizza && (
            <div className="order-item">
              <img src={trackingData.pizza.image} alt={trackingData.pizza.name} />
              <div className="item-details">
                <h4>{trackingData.pizza.name}</h4>
                <p>Quantity: {trackingData.quantity}</p>
                <p>Total: ${trackingData.totalPrice}</p>
              </div>
            </div>
          )}

          {trackingData.customerInfo && (
            <div className="customer-info">
              <h4>Delivery Information</h4>
              <p><strong>Name:</strong> {trackingData.customerInfo.name}</p>
              <p><strong>Phone:</strong> {trackingData.customerInfo.phone}</p>
              <p><strong>Address:</strong> {trackingData.customerInfo.address}</p>
            </div>
          )}
        </div>

        <div className="status-timeline">
          <h4>Order Progress</h4>
          <div className="timeline">
            {trackingData.statusHistory?.map((item, index) => (
              <div key={index} className={`timeline-item ${item.completed ? 'completed' : ''} ${item.current ? 'current' : ''}`}>
                <div className="timeline-icon" style={{ color: item.completed ? getStatusColor(item.status) : '#ccc' }}>
                  {getStatusIcon(item.status)}
                </div>
                <div className="timeline-content">
                  <h5>{item.label}</h5>
                  {item.timestamp && (
                    <span className="timeline-time">{formatTime(item.timestamp)}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="tracking-actions">
          <button onClick={() => setCurrentOrderId('')} className="track-another-btn">
            Track Another Order
          </button>
          <button onClick={handleRetry} className="refresh-btn">
            Refresh Status
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderTracking; 