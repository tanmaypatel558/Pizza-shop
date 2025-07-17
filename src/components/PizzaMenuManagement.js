import React, { useState } from 'react';
import './PizzaMenuManagement.css';

const PizzaMenuManagement = ({ menu, onMenuUpdate, onNotification }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPizza, setEditingPizza] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    description: '',
    ingredients: [],
    image: '',
    category: 'pizza',
    isAvailable: true,
    isGlutenFreeOption: false,
    customizations: {
      sizes: [],
      toppings: [],
      crusts: []
    }
  });

  const resetForm = () => {
    setFormData({
      name: '',
      price: '',
      description: '',
      ingredients: [],
      image: '',
      category: 'pizza',
      isAvailable: true,
      isGlutenFreeOption: false,
      customizations: {
        sizes: [],
        toppings: [],
        crusts: []
      }
    });
    setEditingPizza(null);
  };

  const openModal = (pizza = null) => {
    if (pizza) {
      setFormData({
        ...pizza,
        ingredients: pizza.ingredients || [],
        customizations: pizza.customizations || {
          sizes: [],
          toppings: [],
          crusts: []
        }
      });
      setEditingPizza(pizza);
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

  const handleCustomizationChange = (type, value) => {
    const items = value.split(',').map(item => item.trim()).filter(item => item);
    setFormData(prev => ({
      ...prev,
      customizations: {
        ...prev.customizations,
        [type]: items
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      const url = editingPizza 
        ? `${apiUrl}/api/pizza-menu/${editingPizza.id}`
        : `${apiUrl}/api/pizza-menu`;
      
      const method = editingPizza ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        onMenuUpdate();
        closeModal();
        onNotification(
          editingPizza ? 'Pizza updated successfully' : 'Pizza added successfully',
          'success'
        );
      } else {
        onNotification('Error saving pizza', 'error');
      }
    } catch (error) {
      console.error('Error saving pizza:', error);
      onNotification('Error saving pizza', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this pizza?')) {
      try {
        const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
        const response = await fetch(`${apiUrl}/api/pizza-menu/${id}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          onMenuUpdate();
          onNotification('Pizza deleted successfully', 'success');
        } else {
          onNotification('Error deleting pizza', 'error');
        }
      } catch (error) {
        console.error('Error deleting pizza:', error);
        onNotification('Error deleting pizza', 'error');
      }
    }
  };

  const toggleAvailability = async (pizza) => {
    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiUrl}/api/pizza-menu/${pizza.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...pizza, isAvailable: !pizza.isAvailable }),
      });

      if (response.ok) {
        onMenuUpdate();
        onNotification(
          `Pizza ${pizza.isAvailable ? 'marked as unavailable' : 'marked as available'}`,
          'success'
        );
      }
    } catch (error) {
      console.error('Error updating pizza:', error);
      onNotification('Error updating pizza', 'error');
    }
  };

  return (
    <div className="pizza-menu-management">
      <div className="management-header">
        <h2>Pizza Menu Management</h2>
        <button className="add-btn" onClick={() => openModal()}>
          + Add New Pizza
        </button>
      </div>

      <div className="pizza-grid">
        {menu.length === 0 ? (
          <div className="no-pizzas">
            <p>No pizzas in menu. Add your first pizza!</p>
          </div>
        ) : (
          menu.map(pizza => (
            <div key={pizza.id} className={`pizza-card ${!pizza.isAvailable ? 'unavailable' : ''}`}>
              <div className="pizza-image">
                <img src={pizza.image} alt={pizza.name} />
                <div className="pizza-actions">
                  <button 
                    className="edit-btn" 
                    onClick={() => openModal(pizza)}
                    title="Edit"
                  >
                    ✏️
                  </button>
                  <button 
                    className="delete-btn" 
                    onClick={() => handleDelete(pizza.id)}
                    title="Delete"
                  >
                    🗑️
                  </button>
                  <button 
                    className="toggle-btn" 
                    onClick={() => toggleAvailability(pizza)}
                    title={pizza.isAvailable ? 'Mark Unavailable' : 'Mark Available'}
                  >
                    {pizza.isAvailable ? '⏸️' : '▶️'}
                  </button>
                </div>
              </div>
              
              <div className="pizza-info">
                <h3 className="pizza-name">{pizza.name}</h3>
                <div className="pizza-price">{pizza.price}</div>
                <div className="pizza-description">{pizza.description}</div>
                
                {pizza.ingredients && pizza.ingredients.length > 0 && (
                  <div className="pizza-ingredients">
                    <strong>Ingredients:</strong> {pizza.ingredients.join(', ')}
                  </div>
                )}
                
                <div className="pizza-options">
                  {pizza.isGlutenFreeOption && (
                    <span className="option-tag">🌾 Gluten-Free Available</span>
                  )}
                  <span className="availability-tag">
                    {pizza.isAvailable ? '🟢 Available' : '🔴 Unavailable'}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {isModalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingPizza ? 'Edit Pizza' : 'Add New Pizza'}</h3>
              <button className="close-btn" onClick={closeModal}>×</button>
            </div>

            <form onSubmit={handleSubmit} className="pizza-form">
              <div className="form-group">
                <label>Pizza Name:</label>
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
                  <label>Category:</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                  >
                    <option value="pizza">Pizza</option>
                    <option value="specialty">Specialty</option>
                    <option value="vegetarian">Vegetarian</option>
                    <option value="vegan">Vegan</option>
                  </select>
                </div>
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

              <div className="form-group">
                <label>Available Sizes (comma-separated):</label>
                <input
                  type="text"
                  value={formData.customizations.sizes.join(', ')}
                  onChange={(e) => handleCustomizationChange('sizes', e.target.value)}
                  placeholder="Small, Medium, Large"
                />
              </div>

              <div className="form-group">
                <label>Extra Toppings (comma-separated):</label>
                <input
                  type="text"
                  value={formData.customizations.toppings.join(', ')}
                  onChange={(e) => handleCustomizationChange('toppings', e.target.value)}
                  placeholder="Extra cheese, Mushrooms, Olives"
                />
              </div>

              <div className="form-group">
                <label>Crust Options (comma-separated):</label>
                <input
                  type="text"
                  value={formData.customizations.crusts.join(', ')}
                  onChange={(e) => handleCustomizationChange('crusts', e.target.value)}
                  placeholder="Thin, Thick, Stuffed"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>
                    <input
                      type="checkbox"
                      name="isAvailable"
                      checked={formData.isAvailable}
                      onChange={handleInputChange}
                    />
                    Available
                  </label>
                </div>

                <div className="form-group">
                  <label>
                    <input
                      type="checkbox"
                      name="isGlutenFreeOption"
                      checked={formData.isGlutenFreeOption}
                      onChange={handleInputChange}
                    />
                    Gluten-Free Option Available
                  </label>
                </div>
              </div>

              <div className="form-actions">
                <button type="button" onClick={closeModal} className="cancel-btn">
                  Cancel
                </button>
                <button type="submit" className="save-btn">
                  {editingPizza ? 'Update' : 'Add'} Pizza
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PizzaMenuManagement; 