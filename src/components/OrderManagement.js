import React, { useState } from 'react';
import './OrderManagement.css';

const OrderManagement = ({ orders, onStatusUpdate, onNotification }) => {
  const [filterStatus, setFilterStatus] = useState('all');

  const orderStatuses = [
    { value: 'received', label: 'Received', color: '#17a2b8', icon: '📨' },
    { value: 'in-preparation', label: 'In Preparation', color: '#ffc107', icon: '👨‍🍳' },
    { value: 'in-oven', label: 'In Oven', color: '#fd7e14', icon: '🔥' },
    { value: 'ready', label: 'Ready', color: '#28a745', icon: '✅' },
    { value: 'out-for-delivery', label: 'Out for Delivery', color: '#6f42c1', icon: '🚚' },
    { value: 'delivered', label: 'Delivered', color: '#20c997', icon: '🎉' }
  ];

  const getStatusInfo = (status) => {
    return orderStatuses.find(s => s.value === status) || orderStatuses[0];
  };

  const filteredOrders = filterStatus === 'all' 
    ? orders 
    : orders.filter(order => order.status === filterStatus);

  const handleStatusChange = (orderId, newStatus) => {
    onStatusUpdate(orderId, newStatus);
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  const getTimeSinceOrder = (timestamp) => {
    const now = new Date();
    const orderTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now - orderTime) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  return (
    <div className="order-management">
      <div className="order-header">
        <h2>Order Management</h2>
        <div className="order-filters">
          <select 
            value={filterStatus} 
            onChange={(e) => setFilterStatus(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Orders ({orders.length})</option>
            {orderStatuses.map(status => (
              <option key={status.value} value={status.value}>
                {status.icon} {status.label} ({orders.filter(o => o.status === status.value).length})
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="orders-grid">
        {filteredOrders.length === 0 ? (
          <div className="no-orders">
            <p>No orders found for the selected filter.</p>
          </div>
        ) : (
          filteredOrders.map(order => {
            const statusInfo = getStatusInfo(order.status);
            return (
              <div key={order.id} className="order-card">
                <div className="order-card-header">
                  <div className="order-id">
                    <strong>Order #{order.id.substring(0, 8)}</strong>
                  </div>
                  <div className="order-time">
                    <span className="time-ago">{getTimeSinceOrder(order.createdAt)}</span>
                  </div>
                </div>

                <div className="order-details">
                  <div className="pizza-info">
                    <h3 className="pizza-name">{order.pizza.name}</h3>
                    <div className="pizza-details">
                      <span className="quantity">Qty: {order.quantity}</span>
                      {order.isGlutenFree && <span className="gluten-free">🌾 Gluten Free</span>}
                      <span className="price">${order.totalPrice}</span>
                    </div>
                  </div>

                  <div className="customer-info">
                    <p><strong>Customer:</strong> {order.customerInfo.name}</p>
                    <p><strong>Phone:</strong> {order.customerInfo.phone}</p>
                    <p><strong>Address:</strong> {order.customerInfo.address}</p>
                  </div>

                  <div className="order-status-section">
                    <div className="current-status">
                      <span 
                        className="status-badge"
                        style={{ backgroundColor: statusInfo.color }}
                      >
                        {statusInfo.icon} {statusInfo.label}
                      </span>
                    </div>

                    <div className="status-actions">
                      <label htmlFor={`status-${order.id}`}>Update Status:</label>
                      <select
                        id={`status-${order.id}`}
                        value={order.status}
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        className="status-select"
                      >
                        {orderStatuses.map(status => (
                          <option key={status.value} value={status.value}>
                            {status.icon} {status.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="order-timeline">
                  <div className="timeline-item">
                    <span className="timeline-time">
                      {formatTime(order.createdAt)}
                    </span>
                    <span className="timeline-label">Order Received</span>
                  </div>
                  <div className="timeline-item">
                    <span className="timeline-time">
                      {formatTime(order.updatedAt)}
                    </span>
                    <span className="timeline-label">Last Updated</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default OrderManagement; 