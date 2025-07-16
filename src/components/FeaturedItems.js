import React, { useState, useEffect } from 'react';
import './FeaturedItems.css';
import PizzaModal from './PizzaModal';

const FeaturedItems = () => {
  const [selectedPizza, setSelectedPizza] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [featuredItems, setFeaturedItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
      
      // Increase timeout and add retry logic
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
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
      } else {
        throw new Error(`Failed to load featured items: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error fetching featured items:', error);
      
      // Instead of using mock data, show a proper error message
      setError('Unable to load featured items. Please check your connection and try again.');
      setFeaturedItems([]);
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