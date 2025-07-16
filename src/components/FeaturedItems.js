import React, { useState, useEffect } from 'react';
import './FeaturedItems.css';
import PizzaModal from './PizzaModal';

// Mock data for when the backend is not available
const mockFeaturedItems = [
  {
    id: 1,
    name: "Margherita Pizza",
    price: "$24.99",
    image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
    rating: "95%",
    reviews: "(324)",
    badge: "#1 Most Liked",
    category: "pizza",
    isActive: true,
    description: "Fresh tomato sauce, mozzarella cheese, fresh basil, and olive oil",
    ingredients: ["tomato sauce", "mozzarella", "basil", "olive oil"]
  },
  {
    id: 2,
    name: "Pepperoni Deluxe",
    price: "$28.99",
    image: "https://images.unsplash.com/photo-1628840042765-356cda07504e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
    rating: "92%",
    reviews: "(268)",
    badge: "Popular",
    category: "pizza",
    isActive: true,
    description: "Pepperoni, mozzarella cheese, and tomato sauce",
    ingredients: ["pepperoni", "mozzarella", "tomato sauce"]
  },
  {
    id: 3,
    name: "Vegetarian Supreme",
    price: "$26.99",
    image: "https://images.unsplash.com/photo-1571407970349-bc81e7e96d47?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
    rating: "88%",
    reviews: "(195)",
    badge: "Healthy Choice",
    category: "pizza",
    isActive: true,
    description: "Bell peppers, mushrooms, onions, olives, and tomatoes",
    ingredients: ["bell peppers", "mushrooms", "onions", "olives", "tomatoes"]
  },
  {
    id: 4,
    name: "Classic Caesar Salad",
    price: "$12.99",
    image: "https://images.unsplash.com/photo-1546793665-c74683f339c1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
    rating: "90%",
    reviews: "(142)",
    badge: "Fresh",
    category: "salad",
    isActive: true,
    description: "Crisp romaine lettuce, parmesan cheese, croutons, and Caesar dressing",
    ingredients: ["romaine lettuce", "parmesan", "croutons", "caesar dressing"]
  },
  {
    id: 5,
    name: "Coca Cola",
    price: "$2.99",
    image: "https://images.unsplash.com/photo-1622650862525-fd8e4b0c4c53?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
    rating: "85%",
    reviews: "(89)",
    badge: "Refreshing",
    category: "drink",
    isActive: true,
    description: "Ice-cold Coca Cola served in a chilled glass",
    ingredients: ["coca cola", "ice"]
  },
  {
    id: 6,
    name: "Garlic Bread",
    price: "$8.99",
    image: "https://images.unsplash.com/photo-1553909489-cd47e0ef937f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
    rating: "93%",
    reviews: "(156)",
    badge: "Appetizer",
    category: "appetizer",
    isActive: true,
    description: "Freshly baked bread with garlic butter and herbs",
    ingredients: ["bread", "garlic", "butter", "herbs"]
  }
];

const FeaturedItems = () => {
  const [selectedPizza, setSelectedPizza] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [featuredItems, setFeaturedItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [usingMockData, setUsingMockData] = useState(false);

  // Available filter categories
  const filterCategories = [
    { key: 'all', label: 'All Items', icon: '🍽️' },
    { key: 'pizza', label: 'Pizza', icon: '🍕' },
    { key: 'drink', label: 'Drinks', icon: '🥤' },
    { key: 'salad', label: 'Salads', icon: '🥗' },
    { key: 'appetizer', label: 'Appetizers', icon: '🍤' }
  ];

  useEffect(() => {
    fetchFeaturedItems();
  }, []);

  // Filter items when featuredItems or selectedFilter changes
  useEffect(() => {
    if (selectedFilter === 'all') {
      setFilteredItems(featuredItems);
    } else {
      const filtered = featuredItems.filter(item => item.category === selectedFilter);
      setFilteredItems(filtered);
    }
  }, [featuredItems, selectedFilter]);

  const fetchFeaturedItems = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Use environment variable for API URL or fallback to localhost for development
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      
      // Add timeout to prevent long waits
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
      
      const response = await fetch(`${apiUrl}/api/featured-items`, {
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        const data = await response.json();
        // Only show active items on the frontend
        const activeItems = data.filter(item => item.isActive);
        setFeaturedItems(activeItems);
        setUsingMockData(false);
      } else {
        throw new Error('Failed to load featured items');
      }
    } catch (error) {
      console.error('Error fetching featured items:', error);
      
      // Use mock data as fallback
      console.log('Using mock data as fallback...');
      setFeaturedItems(mockFeaturedItems);
      setUsingMockData(true);
      setError(null); // Clear error since we have fallback data
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (item) => {
    setSelectedPizza(item);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedPizza(null);
  };

  const handleFilterChange = (filterKey) => {
    setSelectedFilter(filterKey);
  };

  if (loading) {
    return (
      <section className="featured-items">
        <div className="featured-header">
          <h2 className="featured-title">Featured Items</h2>
          <div className="carousel-controls">
            <button className="carousel-btn prev-btn">
              <span>‹</span>
            </button>
            <button className="carousel-btn next-btn">
              <span>›</span>
            </button>
          </div>
        </div>
        <div className="loading-state">
          <p>Loading featured items...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="featured-items">
      <div className="featured-header">
        <h2 className="featured-title">Featured Items</h2>
        <div className="carousel-controls">
          <button className="carousel-btn prev-btn">
            <span>‹</span>
          </button>
          <button className="carousel-btn next-btn">
            <span>›</span>
          </button>
        </div>
      </div>
      
      {/* Show demo mode notification */}
      {usingMockData && (
        <div className="demo-notification">
          <p>🍕 Demo Mode: Displaying sample menu items</p>
        </div>
      )}
      
      {/* Filter Buttons */}
      <div className="filter-container">
        <div className="filter-buttons">
          {filterCategories.map(category => (
            <button
              key={category.key}
              className={`filter-btn ${selectedFilter === category.key ? 'active' : ''}`}
              onClick={() => handleFilterChange(category.key)}
            >
              <span className="filter-icon">{category.icon}</span>
              <span className="filter-label">{category.label}</span>
            </button>
          ))}
        </div>
      </div>
      
      <div className="featured-scroll-container">
        <div className="featured-grid">
          {filteredItems.length === 0 ? (
            <div className="no-items">
              <p>
                {selectedFilter === 'all' 
                  ? 'No featured items available at the moment.' 
                  : `No ${filterCategories.find(cat => cat.key === selectedFilter)?.label.toLowerCase()} available at the moment.`}
              </p>
            </div>
          ) : (
            filteredItems.map(item => (
              <div key={item.id} className="featured-item">
                <div className="item-image-container">
                  <img src={item.image} alt={item.name} className="item-image" />
                  <button 
                    className="add-to-cart-btn"
                    onClick={() => handleAddToCart(item)}
                  >
                    <span>+</span>
                  </button>
                </div>
                
                <div className="item-content">
                  <h3 className="item-name">{item.name}</h3>
                  <div className="item-price-rating">
                    <span className="item-price">{item.price}</span>
                    <div className="item-rating">
                      <span className="thumbs-up">👍</span>
                      <span className="rating-percentage">{item.rating}</span>
                      <span className="rating-count">{item.reviews}</span>
                    </div>
                  </div>
                  {item.badge && (
                    <div className="most-liked-badge">
                      {item.badge}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <PizzaModal 
        isOpen={isModalOpen}
        onClose={closeModal}
        pizza={selectedPizza}
      />
    </section>
  );
};

export default FeaturedItems; 