import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import OrderTracking from './OrderTracking';
import './CartSidebar.css';

const CartSidebar = () => {
  const { 
    items, 
    isOpen, 
    totalItems, 
    totalPrice, 
    removeItem, 
    updateQuantity, 
    clearCart, 
    closeCart, 
    recentOrders
  } = useCart();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    phone: '',
    address: ''
  });
  const [showOrderTracking, setShowOrderTracking] = useState(false);
  const [trackingOrderId, setTrackingOrderId] = useState(null);
  const [showTrackingInput, setShowTrackingInput] = useState(false);
  const [trackingIdInput, setTrackingIdInput] = useState('');
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderIds, setOrderIds] = useState([]);
  const [orderError, setOrderError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleQuantityChange = (cartId, newQuantity) => {
    if (newQuantity <= 0) {
      removeItem(cartId);
    } else {
      updateQuantity(cartId, newQuantity);
    }
  };

  const handleCheckout = async () => {
    if (!customerInfo.name || !customerInfo.phone || !customerInfo.address) {
      alert('Please fill in all customer information fields');
      return;
    }

    setIsCheckingOut(true);
    setIsLoading(true);
    setOrderError(null);
    
    try {
      // Create orders for each cart item
      const orders = items.map(item => ({
        pizza: {
          id: item.id,
          name: item.name,
          price: item.price,
          image: item.image
        },
        quantity: item.quantity,
        isGlutenFree: item.isGlutenFree,
        extraToppings: item.extraToppings,
        totalPrice: (item.totalPrice * item.quantity).toFixed(2),
        customerInfo
      }));

      // Send each order to the backend
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      
      const orderPromises = orders.map(order => 
        fetch(`${apiUrl}/api/orders`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(order),
        })
      );

      const responses = await Promise.all(orderPromises);
      const allSuccessful = responses.every(response => response.ok);

      if (allSuccessful) {
        // Extract order IDs from successful responses
        const orderIds = await Promise.all(
          responses.map(response => response.json())
        );
        
        // Show success message with order IDs
        setOrderSuccess(true);
        setOrderIds(orderIds.map(order => order.id));
        
        // Clear cart
        clearCart();
        
        // Auto-open order tracking after 2 seconds
        setTimeout(() => {
          setOrderSuccess(false);
          handleOrderPlaced(orderIds.map(order => order.id));
        }, 2000);
      } else {
        throw new Error('Some orders failed to process');
      }
    } catch (error) {
      console.error('Error placing orders:', error);
      
      // Check if we're in production mode
      const isProduction = process.env.NODE_ENV === 'production';
      
      if (isProduction) {
        // In production, show a user-friendly message
        setOrderError('Unable to process your order at this time. Please try again later or contact support.');
      } else {
        // In development, show detailed error
        if (error.name === 'AbortError') {
          setOrderError('Order request timed out. Please check your connection and try again.');
        } else {
          setOrderError('Unable to connect to the order system. Please ensure the backend server is running.');
        }
      }
      
      // Clear error after 5 seconds
      setTimeout(() => {
        setOrderError(null);
      }, 5000);
    } finally {
      setIsLoading(false);
      setIsCheckingOut(false);
    }
  };

  const handleCustomerInfoChange = (e) => {
    const { name, value } = e.target;
    setCustomerInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const getItemDescription = (item) => {
    const extras = [];
    if (item.isGlutenFree) extras.push('Gluten Free');
    
    const selectedToppings = Object.entries(item.extraToppings || {})
      .filter(([_, selected]) => selected)
      .map(([key, _]) => {
        const toppings = {
          extraCheese: 'Extra Cheese',
          extraMeat: 'Extra Meat',
          extraVeg: 'Extra Vegetables'
        };
        return toppings[key] || key;
      });

    return [...extras, ...selectedToppings].join(', ');
  };

  const handleTrackOrder = (orderId) => {
    setTrackingOrderId(orderId);
    setShowOrderTracking(true);
  };

  const handleTrackByInput = () => {
    if (trackingIdInput.trim()) {
      setTrackingOrderId(trackingIdInput.trim());
      setShowOrderTracking(true);
      setShowTrackingInput(false);
      setTrackingIdInput('');
    }
  };

  const closeOrderTracking = () => {
    setShowOrderTracking(false);
    setTrackingOrderId(null);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const handleOrderPlaced = (ids) => {
    if (ids && ids.length > 0) {
      setTrackingOrderId(ids[0]);
      setShowOrderTracking(true);
    }
  };

  return (
    <>
      {isOpen && <div className="cart-overlay" onClick={closeCart}></div>}
      
      <div className={`cart-sidebar ${isOpen ? 'open' : ''}`}>
        <div className="cart-header">
          <h2>🛒 Your Cart</h2>
          <button className="close-btn" onClick={closeCart}>×</button>
        </div>

        {orderSuccess && (
          <div className="order-success-display">
            <div className="success-icon">🎉</div>
            <h3>Order Placed Successfully!</h3>
            <p>Your order IDs:</p>
            <div className="order-ids">
              {orderIds.map((id, index) => (
                <div key={index} className="order-id">
                  📦 {id}
                </div>
              ))}
            </div>
            <p className="success-message">
              Redirecting to order tracking...
            </p>
          </div>
        )}

        {orderError && (
          <div className="order-error-display">
            <div className="error-icon">❌</div>
            <h3>Order Failed</h3>
            <p>{orderError}</p>
          </div>
        )}

        {!orderSuccess && items.length === 0 ? (
          <div className="empty-cart">
            <div className="empty-cart-icon">🛒</div>
            <p>Your cart is empty</p>
            <span>Add some delicious items to get started!</span>
          </div>
        ) : !orderSuccess ? (
          <>
            <div className="cart-items">
              {items.map(item => (
                <div key={item.cartId} className="cart-item">
                  <img src={item.image} alt={item.name} className="cart-item-image" />
                  <div className="cart-item-details">
                    <h4 className="cart-item-name">{item.name}</h4>
                    <p className="cart-item-price">${item.price}</p>
                    {getItemDescription(item) && (
                      <p className="cart-item-description">{getItemDescription(item)}</p>
                    )}
                    <div className="cart-item-controls">
                      <div className="quantity-controls">
                        <button 
                          onClick={() => handleQuantityChange(item.cartId, item.quantity - 1)}
                          className="quantity-btn"
                        >
                          -
                        </button>
                        <span className="quantity">{item.quantity}</span>
                        <button 
                          onClick={() => handleQuantityChange(item.cartId, item.quantity + 1)}
                          className="quantity-btn"
                        >
                          +
                        </button>
                      </div>
                      <button 
                        onClick={() => removeItem(item.cartId)}
                        className="remove-btn"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                  <div className="cart-item-total">
                    ${(item.totalPrice * item.quantity).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>

            <div className="cart-footer">
              <div className="cart-summary">
                <div className="summary-row">
                  <span>Items ({totalItems})</span>
                  <span>${totalPrice.toFixed(2)}</span>
                </div>
                <div className="summary-row total">
                  <span>Total</span>
                  <span>${totalPrice.toFixed(2)}</span>
                </div>
              </div>

              <div className="customer-info">
                <h3>Customer Information</h3>
                <div className="form-group">
                  <input
                    type="text"
                    name="name"
                    value={customerInfo.name}
                    onChange={handleCustomerInfoChange}
                    placeholder="Your Name"
                    required
                  />
                </div>
                <div className="form-group">
                  <input
                    type="tel"
                    name="phone"
                    value={customerInfo.phone}
                    onChange={handleCustomerInfoChange}
                    placeholder="Phone Number"
                    required
                  />
                </div>
                <div className="form-group">
                  <input
                    type="text"
                    name="address"
                    value={customerInfo.address}
                    onChange={handleCustomerInfoChange}
                    placeholder="Delivery Address"
                    required
                  />
                </div>
              </div>

              <div className="cart-actions">
                <button 
                  onClick={clearCart}
                  className="clear-btn"
                  disabled={isCheckingOut || isLoading}
                >
                  Clear Cart
                </button>
                <button 
                  onClick={handleCheckout}
                  className="checkout-btn"
                  disabled={isCheckingOut || isLoading}
                >
                  {isLoading ? 'Placing Order...' : 'Place Order'}
                </button>
              </div>

              {/* Order Tracking Section */}
              <div className="order-tracking-section">
                <h3>Order Tracking</h3>
                
                {/* Recent Orders */}
                {recentOrders.length > 0 && (
                  <div className="recent-orders">
                    <h4>Recent Orders</h4>
                    <div className="recent-orders-list">
                      {recentOrders.map(order => (
                        <div key={order.id} className="recent-order-item">
                          <div className="recent-order-info">
                            <div className="order-pizza-name">{order.pizzaName}</div>
                            <div className="order-date">{formatDate(order.createdAt)}</div>
                            <div className="order-price">${order.totalPrice}</div>
                          </div>
                          <button 
                            onClick={() => handleTrackOrder(order.id)}
                            className="track-btn"
                          >
                            Track Order
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Track by Order ID */}
                <div className="track-by-id">
                  <button 
                    onClick={() => setShowTrackingInput(!showTrackingInput)}
                    className="track-input-toggle"
                  >
                    📦 Track Order by ID
                  </button>
                  
                  {showTrackingInput && (
                    <div className="tracking-input-section">
                      <input
                        type="text"
                        value={trackingIdInput}
                        onChange={(e) => setTrackingIdInput(e.target.value)}
                        placeholder="Enter Order ID"
                        className="tracking-input"
                      />
                      <button 
                        onClick={handleTrackByInput}
                        className="track-submit-btn"
                        disabled={!trackingIdInput.trim()}
                      >
                        Track
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        ) : null}
      </div>
      
      {/* Order Tracking Modal */}
      {showOrderTracking && (
        <OrderTracking 
          orderId={trackingOrderId} 
          onClose={closeOrderTracking}
        />
      )}
    </>
  );
};

export default CartSidebar; 