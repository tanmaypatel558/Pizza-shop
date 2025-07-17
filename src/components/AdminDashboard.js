import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import './AdminDashboard.css';
import OrderManagement from './OrderManagement';
import FeaturedItemsManagement from './FeaturedItemsManagement';
import PizzaMenuManagement from './PizzaMenuManagement';
import ToppingsManagement from './ToppingsManagement';
import OrdersStatusToggle from './OrdersStatusToggle';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('orders');
  const [orders, setOrders] = useState([]);
  const [featuredItems, setFeaturedItems] = useState([]);
  const [pizzaMenu, setPizzaMenu] = useState([]);
  const [toppings, setToppings] = useState([]);
  const [extraToppings, setExtraToppings] = useState({});
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    // Initialize socket connection
    const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
    const socketConnection = io(apiUrl);

    // Join admin room for real-time updates
    socketConnection.emit('join-admin');

    // Listen for real-time order updates
    socketConnection.on('new-order', (order) => {
      setOrders(prevOrders => [order, ...prevOrders]);
      addNotification(`New order received: ${order.pizza.name}`, 'success');
    });

    socketConnection.on('order-status-updated', (updatedOrder) => {
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === updatedOrder.id ? updatedOrder : order
        )
      );
      addNotification(`Order ${updatedOrder.id.substring(0, 8)} status updated to ${updatedOrder.status}`, 'info');
    });

    // Load initial data
    loadOrders();
    loadFeaturedItems();
    loadPizzaMenu();
    loadToppings();
    loadExtraToppings();

    return () => {
      socketConnection.disconnect();
    };
  }, []);

  const loadOrders = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/orders');
      const data = await response.json();
      setOrders(data);
    } catch (error) {
      console.error('Error loading orders:', error);
    }
  };

  const loadFeaturedItems = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/featured-items');
      const data = await response.json();
      setFeaturedItems(data);
    } catch (error) {
      console.error('Error loading featured items:', error);
    }
  };

  const loadPizzaMenu = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/pizza-menu');
      const data = await response.json();
      setPizzaMenu(data);
    } catch (error) {
      console.error('Error loading pizza menu:', error);
    }
  };

  const loadToppings = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/toppings');
      const data = await response.json();
      setToppings(data);
    } catch (error) {
      console.error('Error loading toppings:', error);
    }
  };

  const loadExtraToppings = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/extra-toppings');
      const data = await response.json();
      setExtraToppings(data);
    } catch (error) {
      console.error('Error loading extra toppings:', error);
    }
  };

  const addNotification = (message, type) => {
    const notification = {
      id: Date.now(),
      message,
      type,
      timestamp: new Date().toISOString()
    };
    setNotifications(prev => [notification, ...prev.slice(0, 4)]);
    
    // Auto-remove notification after 5 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== notification.id));
    }, 5000);
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const response = await fetch(`http://localhost:5000/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });
      
      if (response.ok) {
        addNotification(`Order status updated to ${newStatus}`, 'success');
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      addNotification('Error updating order status', 'error');
    }
  };

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'orders':
        return (
          <OrderManagement 
            orders={orders} 
            onStatusUpdate={updateOrderStatus}
            onNotification={addNotification}
          />
        );
      case 'featured-items':
        return (
          <FeaturedItemsManagement 
            items={featuredItems} 
            onItemsUpdate={loadFeaturedItems}
            onNotification={addNotification}
          />
        );
      case 'pizza-menu':
        return (
          <PizzaMenuManagement 
            menu={pizzaMenu} 
            onMenuUpdate={loadPizzaMenu}
            onNotification={addNotification}
          />
        );
      case 'toppings':
        return (
          <ToppingsManagement 
            toppings={toppings} 
            onToppingsUpdate={loadToppings}
            onNotification={addNotification}
          />
        );
      case 'extra-toppings':
        return (
          <ToppingsManagement 
            toppings={extraToppings} 
            onToppingsUpdate={loadExtraToppings}
            onNotification={addNotification}
            isExtraTopping={true}
          />
        );
      case 'orders-status':
        return <OrdersStatusToggle />;
      default:
        return null;
    }
  };

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <h1 className="admin-title">🍕 Gioia Pizzeria - Admin Dashboard</h1>
        <div className="admin-stats">
          <div className="stat-item">
            <span className="stat-number">{orders.length}</span>
            <span className="stat-label">Total Orders</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{orders.filter(o => o.status === 'received').length}</span>
            <span className="stat-label">Pending</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{orders.filter(o => o.status === 'in-oven').length}</span>
            <span className="stat-label">In Oven</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{orders.filter(o => o.status === 'out-for-delivery').length}</span>
            <span className="stat-label">Out for Delivery</span>
          </div>
        </div>
      </div>

      <div className="admin-notifications">
        {notifications.map(notification => (
          <div key={notification.id} className={`notification ${notification.type}`}>
            <span className="notification-message">{notification.message}</span>
            <span className="notification-time">
              {new Date(notification.timestamp).toLocaleTimeString()}
            </span>
          </div>
        ))}
      </div>

      <div className="admin-tabs">
        <button 
          className={`tab-button ${activeTab === 'orders' ? 'active' : ''}`}
          onClick={() => setActiveTab('orders')}
        >
          📋 Orders
        </button>
        <button 
          className={`tab-button ${activeTab === 'featured-items' ? 'active' : ''}`}
          onClick={() => setActiveTab('featured-items')}
        >
          ⭐ Featured Items
        </button>
        <button 
          className={`tab-button ${activeTab === 'pizza-menu' ? 'active' : ''}`}
          onClick={() => setActiveTab('pizza-menu')}
        >
          🍕 Pizza Menu
        </button>
        <button 
          className={`tab-button ${activeTab === 'toppings' ? 'active' : ''}`}
          onClick={() => setActiveTab('toppings')}
        >
          🥓 Toppings
        </button>
        <button 
          className={`tab-button ${activeTab === 'extra-toppings' ? 'active' : ''}`}
          onClick={() => setActiveTab('extra-toppings')}
        >
          🧀 Extra Toppings
        </button>
        <button 
          className={`tab-button ${activeTab === 'orders-status' ? 'active' : ''}`}
          onClick={() => setActiveTab('orders-status')}
        >
          🚫 Orders Status
        </button>
      </div>

      <div className="admin-content">
        {renderActiveTab()}
      </div>
    </div>
  );
};

export default AdminDashboard; 