import React, { useState, useEffect } from 'react';
import './FeaturedItems.css';
import PizzaModal from './PizzaModal';

// Production fallback data when backend is not available
const productionFallbackItems = [
  {
    id: 1,
    name: "PEPPERONI PIE",
    price: "$28.00",
    rating: "95%",
    reviews: "(452)",
    badge: "#1 Most liked",
    image: "https://images.pexels.com/photos/5175556/pexels-photo-5175556.jpeg",
    description: "Lunch size pizza - feeds one hungry pizza lover - our pepperoni: red sauce, 48 pepperonis",
    ingredients: ["Red sauce", "Mozzarella cheese", "Pepperoni", "Italian herbs"],
    category: "pizza",
    isActive: true
  },
  {
    id: 2,
    name: "FORMAGGIO PIE",
    price: "$21.00",
    rating: "95%",
    reviews: "(280)",
    badge: "#3 Most liked",
    image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
    description: "Classic cheese pizza with our signature red sauce and premium mozzarella cheese",
    ingredients: ["Red sauce", "Premium mozzarella cheese", "Italian herbs", "Olive oil"],
    category: "pizza",
    isActive: true
  },
  {
    id: 3,
    name: "FUNGHI PIE",
    price: "$28.00",
    rating: "96%",
    reviews: "(331)",
    badge: "#2 Most liked",
    image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
    description: "Mushroom lover's dream with fresh mushrooms, mozzarella, and our signature red sauce",
    ingredients: ["Red sauce", "Mozzarella cheese", "Fresh mushrooms", "Italian herbs", "Garlic"],
    category: "pizza",
    isActive: true
  },
  {
    id: 4,
    name: "Coke",
    price: "$10.00",
    rating: "95%",
    reviews: "(500)",
    badge: "Most liked drink",
    image: "https://images.pexels.com/photos/39720/pexels-photo-39720.jpeg",
    description: "Ice-cold Coca Cola served chilled",
    ingredients: ["Coca Cola", "Ice"],
    category: "drink",
    isActive: true
  },
  {
    id: 5,
    name: "Meat Pizza",
    price: "$25.00",
    rating: "95%",
    reviews: "(600)",
    badge: "Spicy pizza",
    image: "https://images.pexels.com/photos/825661/pexels-photo-825661.jpeg",
    description: "Loaded with extra meat for the carnivore in you",
    ingredients: ["Red sauce", "Mozzarella cheese", "Pepperoni", "Sausage", "Ham"],
    category: "pizza",
    isActive: true
  },
  {
    id: 6,
    name: "Cheese Pizza",
    price: "$80.00",
    rating: "96%",
    reviews: "(600)",
    badge: "#4 Most liked Pizza",
    image: "https://images.pexels.com/photos/32952940/pexels-photo-32952940.jpeg",
    description: "Tasty and crunchy cheese pizza",
    ingredients: ["Red sauce", "Premium mozzarella cheese", "Italian herbs"],
    category: "pizza",
    isActive: true
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
  const [usingFallback, setUsingFallback] = useState(false);

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
      
      // Check if we're in production and no API URL is set
      const isProduction = process.env.NODE_ENV === 'production';
      const hasApiUrl = process.env.REACT_APP_API_URL;
      
      if (isProduction && !hasApiUrl) {
        console.log('Production mode detected without API URL, using fallback data');
        setFeaturedItems(productionFallbackItems);
        setUsingFallback(true);
        return;
      }
      
      // Increase timeout and add retry logic
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout for production
      
      const response = await fetch(`${apiUrl}/api/featured-items`, {
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Successfully fetched featured items:', data);
        
        // Only show active items on the frontend
        const activeItems = data.filter(item => item.isActive);
        setFeaturedItems(activeItems);
        setError(null);
        setUsingFallback(false);
      } else {
        throw new Error(`Failed to load featured items: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error fetching featured items:', error);
      
      // Use fallback data in production, show error in development
      if (process.env.NODE_ENV === 'production') {
        console.log('Using fallback data due to connection error');
        setFeaturedItems(productionFallbackItems);
        setUsingFallback(true);
        setError(null);
      } else {
        setError('Unable to load featured items. Please check your connection and try again.');
        setFeaturedItems([]);
      }
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

  const handleRetry = () => {
    fetchFeaturedItems();
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
          <div className="loading-spinner"></div>
          <p>Loading featured items...</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="featured-items">
        <div className="featured-header">
          <h2 className="featured-title">Featured Items</h2>
        </div>
        <div className="error-state">
          <div className="error-message">
            <h3>🔌 Connection Error</h3>
            <p>{error}</p>
            <button onClick={handleRetry} className="retry-btn">
              Try Again
            </button>
          </div>
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
      
      {/* Show fallback notification only in production */}
      {usingFallback && (
        <div className="fallback-notification">
          <p>🍕 Showing menu items - Full functionality with backend coming soon!</p>
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

      {/* Featured Items Grid */}
      <div className="featured-grid">
        {filteredItems.length === 0 ? (
          <div className="no-items">
            <h3>No items found</h3>
            <p>No {selectedFilter === 'all' ? '' : selectedFilter + ' '}items are currently available.</p>
            <button onClick={handleRetry} className="retry-btn">
              Refresh Items
            </button>
          </div>
        ) : (
          filteredItems.map((item) => (
            <div key={item.id} className="featured-item">
              <div className="item-image-container">
                <img 
                  src={item.image} 
                  alt={item.name}
                  className="item-image"
                />
                {item.badge && (
                  <div className="item-badge">
                    {item.badge}
                  </div>
                )}
              </div>
              <div className="item-content">
                <h3 className="item-name">{item.name}</h3>
                <p className="item-description">{item.description}</p>
                <div className="item-stats">
                  <span className="item-rating">
                    ⭐ {item.rating}
                  </span>
                  <span className="item-reviews">
                    {item.reviews}
                  </span>
                </div>
                <div className="item-footer">
                  <span className="item-price">{item.price}</span>
                  <button 
                    className="add-to-cart-btn"
                    onClick={() => handleAddToCart(item)}
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pizza Modal */}
      {isModalOpen && (
        <PizzaModal
          pizza={selectedPizza}
          isOpen={isModalOpen}
          onClose={closeModal}
        />
      )}
    </section>
  );
};

export default FeaturedItems; 