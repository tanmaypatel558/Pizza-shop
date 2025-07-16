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
      const response = await fetch(`${apiUrl}/api/featured-items`);
      
      if (response.ok) {
        const data = await response.json();
        // Only show active items on the frontend
        const activeItems = data.filter(item => item.isActive);
        setFeaturedItems(activeItems);
      } else {
        setError('Failed to load featured items');
      }
    } catch (error) {
      console.error('Error fetching featured items:', error);
      setError('Error connecting to server');
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

  if (error) {
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
        <div className="error-state">
          <p>{error}</p>
          <button onClick={fetchFeaturedItems} className="retry-btn">
            Try Again
          </button>
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