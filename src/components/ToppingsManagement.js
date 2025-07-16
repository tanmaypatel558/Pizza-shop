import React, { useState, useEffect } from 'react';
import './ToppingsManagement.css';

const ToppingsManagement = ({ toppings, onToppingsUpdate, onNotification, isExtraTopping = false }) => {
  const [localToppings, setLocalToppings] = useState(isExtraTopping ? {} : []);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTopping, setEditingTopping] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    isActive: true,
    quantities: {
      normal: { price: '', label: 'Normal' },
      extra: { price: '', label: 'Extra' },
      double: { price: '', label: 'Double' }
    }
  });

  useEffect(() => {
    setLocalToppings(toppings);
  }, [toppings]);

  const resetForm = () => {
    setFormData({
      name: '',
      price: '',
      isActive: true,
      quantities: {
        normal: { price: '', label: 'Normal' },
        extra: { price: '', label: 'Extra' },
        double: { price: '', label: 'Double' }
      }
    });
    setEditingTopping(null);
  };

  const openModal = (topping = null) => {
    if (topping) {
      if (isExtraTopping) {
        setFormData({
          name: topping.name,
          price: topping.price,
          isActive: topping.isActive,
          quantities: {
            normal: { price: '', label: 'Normal' },
            extra: { price: '', label: 'Extra' },
            double: { price: '', label: 'Double' }
          }
        });
      } else {
        setFormData({
          name: topping.name,
          price: topping.quantities?.normal?.price || '',
          isActive: topping.isActive,
          quantities: topping.quantities || {
            normal: { price: '', label: 'Normal' },
            extra: { price: '', label: 'Extra' },
            double: { price: '', label: 'Double' }
          }
        });
      }
      setEditingTopping(topping);
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

  const handleQuantityChange = (quantity, field, value) => {
    setFormData(prev => ({
      ...prev,
      quantities: {
        ...prev.quantities,
        [quantity]: {
          ...prev.quantities[quantity],
          [field]: value
        }
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isExtraTopping) {
        // Handle extra toppings
        const updatedToppings = { ...localToppings };
        const key = editingTopping ? Object.keys(localToppings).find(k => localToppings[k].name === editingTopping.name) : 'new';
        
        if (key === 'new') {
          // Add new extra topping (you'd need to add API endpoint for this)
          onNotification('Adding new extra toppings is not supported yet', 'warning');
          return;
        } else {
          updatedToppings[key] = {
            name: formData.name,
            price: parseFloat(formData.price),
            isActive: formData.isActive
          };
        }

        const response = await fetch('http://localhost:5000/api/extra-toppings', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updatedToppings),
        });

        if (response.ok) {
          onToppingsUpdate();
          closeModal();
          onNotification(`Extra topping ${editingTopping ? 'updated' : 'added'} successfully!`, 'success');
        } else {
          onNotification('Error updating extra topping', 'error');
        }
      } else {
        // Handle regular toppings
        const payload = {
          name: formData.name,
          quantities: {
            normal: { price: parseFloat(formData.quantities.normal.price), label: 'Normal' },
            extra: { price: parseFloat(formData.quantities.extra.price), label: 'Extra' },
            double: { price: parseFloat(formData.quantities.double.price), label: 'Double' }
          },
          isActive: formData.isActive
        };

        const url = editingTopping 
          ? `http://localhost:5000/api/toppings/${editingTopping.id}`
          : 'http://localhost:5000/api/toppings';
        
        const method = editingTopping ? 'PUT' : 'POST';

        const response = await fetch(url, {
          method: method,
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });

        if (response.ok) {
          onToppingsUpdate();
          closeModal();
          onNotification(`Topping ${editingTopping ? 'updated' : 'added'} successfully!`, 'success');
        } else {
          onNotification('Error saving topping', 'error');
        }
      }
    } catch (error) {
      console.error('Error saving topping:', error);
      onNotification('Error saving topping', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (topping) => {
    if (!window.confirm(`Are you sure you want to delete "${topping.name}"?`)) {
      return;
    }

    try {
      if (isExtraTopping) {
        onNotification('Deleting extra toppings is not supported yet', 'warning');
        return;
      }

      const response = await fetch(`http://localhost:5000/api/toppings/${topping.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        onToppingsUpdate();
        onNotification(`Topping "${topping.name}" deleted successfully!`, 'success');
      } else {
        onNotification('Error deleting topping', 'error');
      }
    } catch (error) {
      console.error('Error deleting topping:', error);
      onNotification('Error deleting topping', 'error');
    }
  };

  const toggleStatus = async (topping) => {
    try {
      if (isExtraTopping) {
        const updatedToppings = { ...localToppings };
        const key = Object.keys(localToppings).find(k => localToppings[k].name === topping.name);
        updatedToppings[key].isActive = !updatedToppings[key].isActive;

        const response = await fetch('http://localhost:5000/api/extra-toppings', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updatedToppings),
        });

        if (response.ok) {
          onToppingsUpdate();
          onNotification(`Extra topping ${updatedToppings[key].isActive ? 'activated' : 'deactivated'}`, 'success');
        }
      } else {
        const response = await fetch(`http://localhost:5000/api/toppings/${topping.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ isActive: !topping.isActive }),
        });

        if (response.ok) {
          onToppingsUpdate();
          onNotification(`Topping ${!topping.isActive ? 'activated' : 'deactivated'}`, 'success');
        }
      }
    } catch (error) {
      console.error('Error toggling status:', error);
      onNotification('Error updating status', 'error');
    }
  };

  const renderToppingsGrid = () => {
    if (isExtraTopping) {
      return (
        <div className="toppings-grid">
          {Object.entries(localToppings).map(([key, topping]) => (
            <div key={key} className={`topping-card ${!topping.isActive ? 'inactive' : ''}`}>
              <div className="topping-header">
                <h3>{topping.name}</h3>
                <div className="topping-actions">
                  <button 
                    className={`status-toggle ${topping.isActive ? 'active' : 'inactive'}`}
                    onClick={() => toggleStatus(topping)}
                  >
                    {topping.isActive ? '✅' : '❌'}
                  </button>
                  <button 
                    className="edit-btn"
                    onClick={() => openModal(topping)}
                  >
                    ✏️
                  </button>
                </div>
              </div>
              <div className="topping-details">
                <div className="price-info">
                  <span className="price-label">Price:</span>
                  <span className="price-value">${topping.price.toFixed(2)}</span>
                </div>
                <div className="status-info">
                  <span className={`status-badge ${topping.isActive ? 'active' : 'inactive'}`}>
                    {topping.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      );
    } else {
      return (
        <div className="toppings-grid">
          {localToppings.map((topping) => (
            <div key={topping.id} className={`topping-card ${!topping.isActive ? 'inactive' : ''}`}>
              <div className="topping-header">
                <h3>{topping.name}</h3>
                <div className="topping-actions">
                  <button 
                    className={`status-toggle ${topping.isActive ? 'active' : 'inactive'}`}
                    onClick={() => toggleStatus(topping)}
                  >
                    {topping.isActive ? '✅' : '❌'}
                  </button>
                  <button 
                    className="edit-btn"
                    onClick={() => openModal(topping)}
                  >
                    ✏️
                  </button>
                  <button 
                    className="delete-btn"
                    onClick={() => handleDelete(topping)}
                  >
                    🗑️
                  </button>
                </div>
              </div>
              <div className="topping-details">
                <div className="quantities-info">
                  <div className="quantity-row">
                    <span className="quantity-label">Normal:</span>
                    <span className="quantity-price">${topping.quantities?.normal?.price?.toFixed(2) || '0.00'}</span>
                  </div>
                  <div className="quantity-row">
                    <span className="quantity-label">Extra:</span>
                    <span className="quantity-price">${topping.quantities?.extra?.price?.toFixed(2) || '0.00'}</span>
                  </div>
                  <div className="quantity-row">
                    <span className="quantity-label">Double:</span>
                    <span className="quantity-price">${topping.quantities?.double?.price?.toFixed(2) || '0.00'}</span>
                  </div>
                </div>
                <div className="status-info">
                  <span className={`status-badge ${topping.isActive ? 'active' : 'inactive'}`}>
                    {topping.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      );
    }
  };

  const renderModal = () => (
    <div className="modal-overlay" onClick={closeModal}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{editingTopping ? 'Edit' : 'Add'} {isExtraTopping ? 'Extra Topping' : 'Topping'}</h2>
          <button className="close-btn" onClick={closeModal}>×</button>
        </div>
        
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label htmlFor="name">Name:</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              placeholder="Enter topping name"
            />
          </div>

          {isExtraTopping ? (
            <div className="form-group">
              <label htmlFor="price">Price ($):</label>
              <input
                type="number"
                id="price"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                required
                step="0.01"
                min="0"
                placeholder="0.00"
              />
            </div>
          ) : (
            <div className="quantities-section">
              <h3>Quantity Pricing:</h3>
              <div className="quantities-grid">
                {Object.entries(formData.quantities).map(([key, quantity]) => (
                  <div key={key} className="quantity-input">
                    <label htmlFor={`${key}-price`}>{quantity.label} Price ($):</label>
                    <input
                      type="number"
                      id={`${key}-price`}
                      value={quantity.price}
                      onChange={(e) => handleQuantityChange(key, 'price', e.target.value)}
                      required
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="isActive"
                checked={formData.isActive}
                onChange={handleInputChange}
              />
              Active
            </label>
          </div>

          <div className="modal-actions">
            <button type="button" onClick={closeModal} className="cancel-btn">
              Cancel
            </button>
            <button type="submit" disabled={isLoading} className="save-btn">
              {isLoading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return (
    <div className="toppings-management">
      <div className="toppings-header">
        <h1>{isExtraTopping ? 'Extra Toppings' : 'Toppings'} Management</h1>
        <button className="add-btn" onClick={() => openModal()}>
          + Add {isExtraTopping ? 'Extra Topping' : 'Topping'}
        </button>
      </div>

      <div className="toppings-stats">
        <div className="stat-card">
          <div className="stat-number">
            {isExtraTopping ? Object.keys(localToppings).length : localToppings.length}
          </div>
          <div className="stat-label">Total {isExtraTopping ? 'Extra Toppings' : 'Toppings'}</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">
            {isExtraTopping 
              ? Object.values(localToppings).filter(t => t.isActive).length 
              : localToppings.filter(t => t.isActive).length}
          </div>
          <div className="stat-label">Active</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">
            {isExtraTopping 
              ? Object.values(localToppings).filter(t => !t.isActive).length 
              : localToppings.filter(t => !t.isActive).length}
          </div>
          <div className="stat-label">Inactive</div>
        </div>
      </div>

      {renderToppingsGrid()}

      {isModalOpen && renderModal()}
    </div>
  );
};

export default ToppingsManagement; 