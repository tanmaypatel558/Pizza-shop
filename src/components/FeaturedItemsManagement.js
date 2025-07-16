import React, { useState } from 'react';
import './FeaturedItemsManagement.css';

const FeaturedItemsManagement = ({ items, onItemsUpdate, onNotification }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    rating: '',
    reviews: '',
    badge: '',
    image: '',
    description: '',
    ingredients: [],
    category: 'pizza',
    isActive: true
  });

  const resetForm = () => {
    setFormData({
      name: '',
      price: '',
      rating: '',
      reviews: '',
      badge: '',
      image: '',
      description: '',
      ingredients: [],
      category: 'pizza',
      isActive: true
    });
    setEditingItem(null);
  };

  const openModal = (item = null) => {
    if (item) {
      setFormData({
        ...item,
        ingredients: item.ingredients || []
      });
      setEditingItem(item);
    } else {
      resetForm();
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    resetForm();
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleIngredientsChange = (e) => {
    const ingredients = e.target.value.split(',').map(item => item.trim()).filter(item => item);
    setFormData(prev => ({
      ...prev,
      ingredients
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const url = editingItem 
        ? `http://localhost:5000/api/featured-items/${editingItem.id}`
        : 'http://localhost:5000/api/featured-items';
      
      const method = editingItem ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        onItemsUpdate();
        closeModal();
        onNotification(
          editingItem ? 'Featured item updated successfully' : 'Featured item added successfully',
          'success'
        );
      } else {
        onNotification('Error saving featured item', 'error');
      }
    } catch (error) {
      console.error('Error saving featured item:', error);
      onNotification('Error saving featured item', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this featured item?')) {
      try {
        const response = await fetch(`http://localhost:5000/api/featured-items/${id}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          onItemsUpdate();
          onNotification('Featured item deleted successfully', 'success');
        } else {
          onNotification('Error deleting featured item', 'error');
        }
      } catch (error) {
        console.error('Error deleting featured item:', error);
        onNotification('Error deleting featured item', 'error');
      }
    }
  };

  const toggleActive = async (item) => {
    try {
      const response = await fetch(`http://localhost:5000/api/featured-items/${item.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...item, isActive: !item.isActive }),
      });

      if (response.ok) {
        onItemsUpdate();
        onNotification(
          `Featured item ${item.isActive ? 'deactivated' : 'activated'} successfully`,
          'success'
        );
      }
    } catch (error) {
      console.error('Error updating featured item:', error);
      onNotification('Error updating featured item', 'error');
    }
  };

  return (
    <div className="featured-items-management">
      <div className="management-header">
        <h2>Featured Items Management</h2>
        <button className="add-btn" onClick={() => openModal()}>
          + Add New Featured Item
        </button>
      </div>

      <div className="items-grid">
        {items.map(item => (
          <div key={item.id} className={`item-card ${!item.isActive ? 'inactive' : ''}`}>
            <div className="item-image">
              <img src={item.image} alt={item.name} />
              <div className="item-actions">
                <button 
                  className="edit-btn" 
                  onClick={() => openModal(item)}
                  title="Edit"
                >
                  ✏️
                </button>
                <button 
                  className="delete-btn" 
                  onClick={() => handleDelete(item.id)}
                  title="Delete"
                >
                  🗑️
                </button>
                <button 
                  className="toggle-btn" 
                  onClick={() => toggleActive(item)}
                  title={item.isActive ? 'Deactivate' : 'Activate'}
                >
                  {item.isActive ? '⏸️' : '▶️'}
                </button>
              </div>
            </div>
            
            <div className="item-info">
              <h3 className="item-name">{item.name}</h3>
              <div className="item-meta">
                <span className="item-price">{item.price}</span>
                <span className="item-rating">👍 {item.rating} {item.reviews}</span>
              </div>
              {item.badge && (
                <div className="item-badge">{item.badge}</div>
              )}
              <div className="item-status">
                Status: {item.isActive ? '🟢 Active' : '🔴 Inactive'}
              </div>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingItem ? 'Edit Featured Item' : 'Add New Featured Item'}</h3>
              <button className="close-btn" onClick={closeModal}>×</button>
            </div>

            <form onSubmit={handleSubmit} className="item-form">
              <div className="form-group">
                <label>Name:</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Price:</label>
                  <input
                    type="text"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    placeholder="$28.00"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Rating:</label>
                  <input
                    type="text"
                    name="rating"
                    value={formData.rating}
                    onChange={handleInputChange}
                    placeholder="95%"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Reviews:</label>
                  <input
                    type="text"
                    name="reviews"
                    value={formData.reviews}
                    onChange={handleInputChange}
                    placeholder="(452)"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Badge (optional):</label>
                <input
                  type="text"
                  name="badge"
                  value={formData.badge}
                  onChange={handleInputChange}
                  placeholder="#1 Most liked"
                />
              </div>

              <div className="form-group">
                <label>Image URL:</label>
                <input
                  type="url"
                  name="image"
                  value={formData.image}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Description:</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="3"
                  required
                />
              </div>

              <div className="form-group">
                <label>Ingredients (comma-separated):</label>
                <input
                  type="text"
                  value={formData.ingredients.join(', ')}
                  onChange={handleIngredientsChange}
                  placeholder="Red sauce, Mozzarella cheese, Pepperoni"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Category:</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                  >
                    <option value="pizza">Pizza</option>
                    <option value="salad">Salad</option>
                    <option value="appetizer">Appetizer</option>
                    <option value="drink">Drink</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>
                    <input
                      type="checkbox"
                      name="isActive"
                      checked={formData.isActive}
                      onChange={handleInputChange}
                    />
                    Active
                  </label>
                </div>
              </div>

              <div className="form-actions">
                <button type="button" onClick={closeModal} className="cancel-btn">
                  Cancel
                </button>
                <button type="submit" className="save-btn">
                  {editingItem ? 'Update' : 'Add'} Featured Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeaturedItemsManagement; 