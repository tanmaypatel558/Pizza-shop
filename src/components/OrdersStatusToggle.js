import React, { useState, useEffect } from 'react';
import './OrdersStatusToggle.css';

const OrdersStatusToggle = () => {
  const [ordersStatus, setOrdersStatus] = useState({
    isOpen: true,
    message: "Online orders are currently closed. Please try again later.",
    lastUpdated: null
  });
  const [loading, setLoading] = useState(false);
  const [customMessage, setCustomMessage] = useState('');

  useEffect(() => {
    fetchOrdersStatus();
  }, []);

  const fetchOrdersStatus = async () => {
    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiUrl}/api/orders-status`);
      if (response.ok) {
        const data = await response.json();
        setOrdersStatus(data);
        setCustomMessage(data.message);
      }
    } catch (error) {
      console.error('Error fetching orders status:', error);
    }
  };

  const toggleOrdersStatus = async () => {
    setLoading(true);
    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiUrl}/api/orders-status/toggle`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: customMessage
        })
      });

      if (response.ok) {
        const data = await response.json();
        setOrdersStatus(data);
      }
    } catch (error) {
      console.error('Error toggling orders status:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateMessage = async () => {
    setLoading(true);
    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiUrl}/api/orders-status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          isOpen: ordersStatus.isOpen,
          message: customMessage
        })
      });

      if (response.ok) {
        const data = await response.json();
        setOrdersStatus(data);
        alert('Message updated successfully!');
      }
    } catch (error) {
      console.error('Error updating message:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="orders-status-toggle">
      <div className="status-header">
        <h2>🍕 Orders Status Control</h2>
        <div className={`status-indicator ${ordersStatus.isOpen ? 'open' : 'closed'}`}>
          <span className="status-icon">
            {ordersStatus.isOpen ? '🟢' : '🔴'}
          </span>
          <span className="status-text">
            {ordersStatus.isOpen ? 'ACCEPTING ORDERS' : 'ORDERS CLOSED'}
          </span>
        </div>
      </div>

      <div className="toggle-section">
        <div className="toggle-container">
          <button 
            className={`toggle-btn ${ordersStatus.isOpen ? 'open' : 'closed'}`}
            onClick={toggleOrdersStatus}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="loading-spinner"></span>
                Processing...
              </>
            ) : (
              <>
                <span className="toggle-icon">
                  {ordersStatus.isOpen ? '🚫' : '✅'}
                </span>
                {ordersStatus.isOpen ? 'CLOSE ORDERS' : 'OPEN ORDERS'}
              </>
            )}
          </button>
        </div>

        <div className="status-info">
          <p><strong>Last Updated:</strong> {formatDate(ordersStatus.lastUpdated)}</p>
          <p><strong>Current Status:</strong> {ordersStatus.isOpen ? 'Open' : 'Closed'}</p>
        </div>
      </div>

      <div className="message-section">
        <h3>Closed Message</h3>
        <p>This message will be displayed to customers when orders are closed:</p>
        <textarea
          value={customMessage}
          onChange={(e) => setCustomMessage(e.target.value)}
          placeholder="Enter message to display when orders are closed..."
          rows="4"
          className="message-input"
        />
        <button 
          className="update-message-btn"
          onClick={updateMessage}
          disabled={loading}
        >
          {loading ? 'Updating...' : 'Update Message'}
        </button>
      </div>

      <div className="emergency-section">
        <h3>⚠️ Emergency Mode</h3>
        <p>Use this during rush hours or when you need to temporarily stop accepting orders.</p>
        <div className="emergency-actions">
          <button 
            className="emergency-btn close"
            onClick={() => {
              setCustomMessage("We're experiencing high demand. Orders temporarily closed.");
              toggleOrdersStatus();
            }}
            disabled={loading || !ordersStatus.isOpen}
          >
            🚨 EMERGENCY CLOSE
          </button>
          <button 
            className="emergency-btn open"
            onClick={() => {
              setCustomMessage("Online orders are currently closed. Please try again later.");
              toggleOrdersStatus();
            }}
            disabled={loading || ordersStatus.isOpen}
          >
            🚀 QUICK REOPEN
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrdersStatusToggle; 