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
    recentOrders, 
    addRecentOrder 
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
      const orderPromises = orders.map(order => 
        fetch('http://localhost:5000/api/orders', {
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
        // Get the created orders from responses
        const createdOrders = await Promise.all(
          responses.map(response => response.json())
        );
        
        // Add orders to recent orders
        createdOrders.forEach(order => {
          addRecentOrder({
            id: order.id,
            pizzaName: order.pizza.name,
            totalPrice: order.totalPrice,
            createdAt: order.createdAt,
            status: order.status
          });
        });

        // Show order IDs to the user
        const orderIdsList = createdOrders.map(order => 
          `• ${order.pizza.name}: ${order.id.substring(0, 8)}...`
        ).join('\n');
        
        alert(`🎉 Orders placed successfully!\n\n📦 Your Order IDs:\n${orderIdsList}\n\n💰 Total: $${totalPrice.toFixed(2)}\n\n✅ You can track your orders using the Order IDs above.`);
        
        // Auto-open order tracking for the first order
        if (createdOrders.length > 0) {
          setTimeout(() => {
            setTrackingOrderId(createdOrders[0].id);
            setShowOrderTracking(true);
          }, 1000);
        }
        
        clearCart();
        closeCart();
        setCustomerInfo({ name: '', phone: '', address: '' });
      } else {
        alert('Error placing some orders. Please try again.');
      }
    } catch (error) {
      console.error('Error placing orders:', error);
      alert('Error placing orders. Please try again.');
    } finally {
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

  return (
    <>
      {isOpen && <div className="cart-overlay" onClick={closeCart}></div>}
      
      <div className={`cart-sidebar ${isOpen ? 'open' : ''}`}>
        <div className="cart-header">
          <h2>🛒 Your Cart</h2>
          <button className="close-btn" onClick={closeCart}>×</button>
        </div>

        {items.length === 0 ? (
          <div className="empty-cart">
            <div className="empty-cart-icon">🛒</div>
            <p>Your cart is empty</p>
            <span>Add some delicious items to get started!</span>
          </div>
        ) : (
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
                  disabled={isCheckingOut}
                >
                  Clear Cart
                </button>
                <button 
                  onClick={handleCheckout}
                  className="checkout-btn"
                  disabled={isCheckingOut}
                >
                  {isCheckingOut ? 'Placing Order...' : 'Place Order'}
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
        )}
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