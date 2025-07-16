import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Header from './components/Header';
import HeroSection from './components/HeroSection';
import StoreInfo from './components/StoreInfo';
import FeaturedItems from './components/FeaturedItems';
import AdminDashboard from './components/AdminDashboard';
import { CartProvider } from './context/CartContext';
import CartSidebar from './components/CartSidebar';
import OrdersClosedScreen from './components/OrdersClosedScreen';

function App() {
  return (
    <CartProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<CustomerInterface />} />
            <Route path="/admin" element={<AdminDashboard />} />
          </Routes>
        </div>
      </Router>
    </CartProvider>
  );
}

function CustomerInterface() {
  const [ordersStatus, setOrdersStatus] = useState({
    isOpen: true,
    message: "Online orders are currently closed. Please try again later."
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkOrdersStatus();
    
    // Check orders status every 30 seconds
    const interval = setInterval(checkOrdersStatus, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const checkOrdersStatus = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/orders-status');
      if (response.ok) {
        const data = await response.json();
        setOrdersStatus(data);
      }
    } catch (error) {
      console.error('Error checking orders status:', error);
      // On error, assume orders are open to prevent blocking customers
      setOrdersStatus({ isOpen: true, message: "" });
    } finally {
      setLoading(false);
    }
  };

  // Show loading or closed screen
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        fontSize: '18px'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '40px', marginBottom: '20px' }}>🍕</div>
          <div>Loading Gioia Pizzeria...</div>
        </div>
      </div>
    );
  }

  if (!ordersStatus.isOpen) {
    return <OrdersClosedScreen message={ordersStatus.message} />;
  }

  return (
    <>
      <Header />
      <HeroSection />
      
      <div className="main-content">
        <div id="store-info">
          <StoreInfo />
        </div>
        <div id="featured-items">
          <FeaturedItems />
        </div>
      </div>
      
      <CartSidebar />
    </>
  );
}

export default App; 