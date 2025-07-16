import React from 'react';
import './OrdersClosedScreen.css';

const OrdersClosedScreen = ({ message }) => {
  return (
    <div className="orders-closed-screen">
      <div className="orders-closed-container">
        <div className="error-animation">
          <div className="error-icon">🚫</div>
          <div className="error-code">503</div>
        </div>
        
        <div className="error-content">
          <h1 className="error-title">Online Orders Closed</h1>
          <p className="error-message">
            {message || "We're temporarily not accepting online orders. Please try again later."}
          </p>
          
          <div className="error-details">
            <div className="detail-item">
              <span className="detail-icon">📞</span>
              <span>For urgent orders, please call us directly</span>
            </div>
            <div className="detail-item">
              <span className="detail-icon">🕒</span>
              <span>Service will resume shortly</span>
            </div>
            <div className="detail-item">
              <span className="detail-icon">🍕</span>
              <span>Thank you for your patience</span>
            </div>
          </div>
          
          <button 
            className="retry-button"
            onClick={() => window.location.reload()}
          >
            <span className="retry-icon">🔄</span>
            Refresh Page
          </button>
        </div>
        
        <div className="decorative-elements">
          <div className="floating-pizza">🍕</div>
          <div className="floating-pizza">🍕</div>
          <div className="floating-pizza">🍕</div>
        </div>
      </div>
    </div>
  );
};

export default OrdersClosedScreen; 