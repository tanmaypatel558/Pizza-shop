import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import './PizzaModal.css';

const PizzaModal = ({ isOpen, onClose, pizza }) => {
  const [quantity, setQuantity] = useState(1);
  const [isGlutenFree, setIsGlutenFree] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [extraToppings, setExtraToppings] = useState({
    extraCheese: false,
    extraMeat: false,
    extraVeg: false
  });
  const { addItem, openCart } = useCart();

  // Fetch extra toppings prices from backend
  const [extraToppingsData, setExtraToppingsData] = useState({
    extraCheese: { name: 'Extra Cheese', price: 3.00 },
    extraMeat: { name: 'Extra Meat', price: 4.00 },
    extraVeg: { name: 'Extra Vegetables', price: 2.50 }
  });

  React.useEffect(() => {
    const fetchExtraToppings = async () => {
      try {
        const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiUrl}/api/extra-toppings`);
        if (response.ok) {
          const data = await response.json();
          setExtraToppingsData(data);
        }
      } catch (error) {
        console.error('Error fetching extra toppings:', error);
        // Keep default values if backend is not available
      }
    };

    if (isOpen) {
      fetchExtraToppings();
    }
  }, [isOpen]);

  if (!isOpen || !pizza) return null;

  const basePrice = parseFloat(pizza.price.replace('$', ''));
  const glutenFreePrice = 3.45;
  const toppingsPrice = Object.entries(extraToppings).reduce((sum, [key, selected]) => {
    return sum + (selected ? extraToppingsData[key].price : 0);
  }, 0);
  const totalPrice = (basePrice + (isGlutenFree ? glutenFreePrice : 0) + toppingsPrice) * quantity;

  const handleQuantityChange = (change) => {
    const newQuantity = quantity + change;
    if (newQuantity >= 1) {
      setQuantity(newQuantity);
    }
  };



  const handleExtraToppingChange = (toppingKey, checked) => {
    setExtraToppings(prev => ({
      ...prev,
      [toppingKey]: checked
    }));
  };

  const handleAddToCart = async () => {
    setIsLoading(true);
    
    try {
      const cartItem = {
        id: pizza.id,
        name: pizza.name,
        price: pizza.price,
        image: pizza.image,
        quantity,
        isGlutenFree,
        extraToppings,
        totalPrice: totalPrice / quantity // Individual item price
      };

      addItem(cartItem);
      
      // Reset form
      setQuantity(1);
      setIsGlutenFree(false);
      setExtraToppings({
        extraCheese: false,
        extraMeat: false,
        extraVeg: false
      });
      
      onClose();
      openCart(); // Open cart after adding item
      
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('Error adding to cart. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getPizzaDescription = (name) => {
    const descriptions = {
      "PEPPERONI PIE": "Lunch size pizza - feeds one hungry pizza lover - our pepperoni: red sauce, 48 pepperonis *Please note we respectfully decline add on requests, modifications, and swaps. Thank you* *We are not a certified gluten-free facility. Our gluten free dough has trace amounts of dairy. If you have a severe allergy or have celiac disease, we recommend seeking other dining options.*",
      "FORMAGGIO PIE": "Classic cheese pizza with our signature red sauce and premium mozzarella cheese. Made with fresh ingredients and traditional Italian techniques.",
      "FUNGHI PIE": "Mushroom lover's dream with fresh mushrooms, mozzarella, and our signature red sauce on our handmade dough.",
      "SALSICCIA PIE": "Italian sausage pizza with premium sausage, mozzarella cheese, and our signature red sauce.",
      "JULIAN PIE": "Specialty pizza with unique blend of toppings, mozzarella cheese, and our signature red sauce.",
      "Avocado & Arugula Salad": "Fresh salad with ripe avocado, peppery arugula, cherry tomatoes, and house-made dressing."
    };
    return descriptions[name] || pizza.description || "Delicious pizza made with fresh ingredients and traditional Italian techniques.";
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>
        
        <div className="modal-header">
          <h2 className="modal-title">{pizza.name}</h2>
        </div>

        <div className="modal-body">
          <p className="pizza-description">
            {getPizzaDescription(pizza.name)}
          </p>

          <div className="pizza-image-container">
            <img src={pizza.image} alt={pizza.name} className="modal-pizza-image" />
          </div>



          <div className="customization-section">
            <h3 className="section-title">Would you like to make this Gluten Free?</h3>
            <p className="section-subtitle">(Optional) • Select up to 1</p>
            
            <div className="option-item">
              <label className="option-label">
                <input
                  type="checkbox"
                  checked={isGlutenFree}
                  onChange={(e) => setIsGlutenFree(e.target.checked)}
                  className="option-checkbox"
                />
                <span className="option-text">Gluten Free Dough</span>
                <span className="option-price">+$3.45</span>
              </label>
            </div>
          </div>

          <div className="toppings-section">
            <h3 className="section-title">🍕 Extra Toppings</h3>
            <p className="section-subtitle">(Optional) • Select any extra toppings you'd like</p>
            
            <div className="extra-toppings-list">
              {Object.entries(extraToppingsData).map(([key, topping]) => (
                <div key={key} className="extra-topping-item">
                  <label className="extra-topping-label">
                    <input
                      type="checkbox"
                      checked={extraToppings[key]}
                      onChange={(e) => handleExtraToppingChange(key, e.target.checked)}
                      className="extra-topping-checkbox"
                    />
                    <span className="extra-topping-name">{topping.name}</span>
                    <span className="extra-topping-price">+${topping.price.toFixed(2)}</span>
                  </label>
                </div>
              ))}
            </div>
            
            {Object.values(extraToppings).some(selected => selected) && (
              <div className="selected-toppings">
                <h4>Selected Extra Toppings:</h4>
                <div className="selected-list">
                  {Object.entries(extraToppings).map(([key, selected]) => {
                    if (!selected) return null;
                    const topping = extraToppingsData[key];
                    return (
                      <span key={key} className="selected-topping">
                        {topping.name} (+${topping.price.toFixed(2)})
                      </span>
                    );
                  })}
                </div>
                <div className="toppings-total">
                  Extra Toppings Total: +${toppingsPrice.toFixed(2)}
                </div>
              </div>
            )}
          </div>

          <div className="quantity-section">
            <div className="quantity-controls">
              <button 
                className="quantity-btn" 
                onClick={() => handleQuantityChange(-1)}
                disabled={quantity <= 1}
              >
                -
              </button>
              <span className="quantity-display">{quantity}</span>
              <button 
                className="quantity-btn" 
                onClick={() => handleQuantityChange(1)}
              >
                +
              </button>
            </div>
          </div>

          <button 
            className="add-to-cart-modal-btn" 
            onClick={handleAddToCart}
            disabled={isLoading}
          >
            {isLoading ? 'Adding to Cart...' : `Add to Cart - $${totalPrice.toFixed(2)}`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PizzaModal; 