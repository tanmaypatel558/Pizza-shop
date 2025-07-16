import React, { useState } from 'react';
import './StoreInfo.css';

const StoreInfo = () => {
  const [activeDeliveryOption, setActiveDeliveryOption] = useState('delivery');
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  const deliveryOptions = [
    {
      id: 'delivery',
      icon: '🚚',
      text: 'Delivery',
      time: '20-35 min',
      fee: '$0.99 Fee'
    },
    {
      id: 'pickup',
      icon: '🏪',
      text: 'Pickup',
      time: '15-25 min',
      fee: 'No Fee'
    },
    {
      id: 'group',
      icon: '👥',
      text: 'Group Order',
      time: '30-45 min',
      fee: '$2.99 Fee'
    }
  ];

  const shopPhotos = [
    {
      id: 1,
      src: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
      alt: 'Interior of Gioia Pizzeria',
      title: 'Cozy Restaurant Interior'
    },
    {
      id: 2,
      src: 'https://images.unsplash.com/photo-1571997478779-2adcbbe9ab2f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
      alt: 'Pizza oven at Gioia Pizzeria',
      title: 'Traditional Wood-Fired Oven'
    },
    {
      id: 3,
      src: 'https://images.unsplash.com/photo-1588315029754-2dd089d39a1a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
      alt: 'Outdoor seating at Gioia Pizzeria',
      title: 'Beautiful Outdoor Seating'
    }
  ];

  const handleDeliveryOptionClick = (optionId) => {
    setActiveDeliveryOption(optionId);
  };

  const handlePhotoClick = (photo) => {
    setSelectedPhoto(photo);
  };

  const closePhotoModal = () => {
    setSelectedPhoto(null);
  };

  return (
    <section className="store-info">
      <div className="store-header">
        <div className="store-details">
          <h1 className="store-name">Gioia Pizzeria</h1>
          <div className="store-meta">
            <div className="dashpass">
              <span className="dashpass-icon">🚚</span>
              <span>DashPass</span>
            </div>
            <div className="rating">
              <span className="rating-star">⭐</span>
              <span className="rating-number">4.7</span>
              <span className="rating-count">(10k+ ratings)</span>
            </div>
            <div className="price-cuisine">
              <span className="price-range">$$</span>
              <span className="separator">•</span>
              <span className="cuisine-type">Italian</span>
            </div>
          </div>
          <p className="store-description">
            If the thought of a New York-style pizza brings you immense amounts...
          </p>
        </div>
        <div className="search-container">
          <input 
            type="text" 
            placeholder="Search Gioia Pizzeria" 
            className="search-input"
          />
        </div>
      </div>

      {/* Pizza Shop Photos Section */}
      <div className="shop-photos">
        <h3 className="photos-title">
          <span className="photos-icon">📸</span>
          Our Restaurant
        </h3>
        <div className="photos-grid">
          {shopPhotos.map((photo) => (
            <div 
              key={photo.id}
              className="photo-item"
              onClick={() => handlePhotoClick(photo)}
            >
              <img 
                src={photo.src} 
                alt={photo.alt}
                className="photo-image"
              />
              <div className="photo-overlay">
                <span className="photo-title">{photo.title}</span>
                <span className="photo-zoom">🔍</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="delivery-options">
        {deliveryOptions.map((option) => (
          <div 
            key={option.id}
            className={`delivery-option ${activeDeliveryOption === option.id ? 'active' : ''}`}
            onClick={() => handleDeliveryOptionClick(option.id)}
          >
            <div className="delivery-icon">{option.icon}</div>
            <div className="delivery-text">{option.text}</div>
            <div className="delivery-details">
              <div className="delivery-time">{option.time}</div>
              <div className="delivery-fee">{option.fee}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Photo Modal */}
      {selectedPhoto && (
        <div className="photo-modal" onClick={closePhotoModal}>
          <div className="photo-modal-content">
            <button className="photo-modal-close" onClick={closePhotoModal}>
              ✕
            </button>
            <img 
              src={selectedPhoto.src} 
              alt={selectedPhoto.alt}
              className="photo-modal-image"
            />
            <div className="photo-modal-title">{selectedPhoto.title}</div>
          </div>
        </div>
      )}
    </section>
  );
};

export default StoreInfo; 