import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { feedAPI } from '../apiConfig';
import SupplierNavbar from './SupplierNavbar';
import './AddFeed.css';

const AddFeed = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const editFeed = location.state?.feed;
  console.log(location);

  const [formData, setFormData] = useState({
    feedName: '',
    type: '',
    description: '',
    unit: '',
    pricePerUnit: '',
    availableUnits: ''
  });
  const [errors, setErrors] = useState({});
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (editFeed) {
      setFormData({
        feedName: editFeed.feedName,
        type: editFeed.type,
        description: editFeed.description,
        unit: editFeed.unit,
        pricePerUnit: editFeed.pricePerUnit,
        availableUnits: editFeed.availableUnits || 0
      });
    } else {
      // Clear form if no edit data (handles navigation from edit mode)
      setFormData({
        feedName: '',
        type: '',
        description: '',
        unit: '',
        pricePerUnit: '',
        availableUnits: ''
      });
    }
  }, [editFeed, location.key]);

  const validate = () => {
    const newErrors = {};

    if (!formData.feedName.trim()) {
      newErrors.feedName = 'Feed name is required';
    }

    if (!formData.type.trim()) {
      newErrors.type = 'Type is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!formData.unit.trim()) {
      newErrors.unit = 'Unit is required';
    }

    if (!formData.pricePerUnit) {
      newErrors.pricePerUnit = 'Price per unit is required';
    } else if (isNaN(formData.pricePerUnit) || Number(formData.pricePerUnit) <= 0) {
      newErrors.pricePerUnit = 'Price per unit must be a valid number';
    }

    if (!formData.availableUnits) {
      newErrors.availableUnits = 'Available units is required';
    } else if (isNaN(formData.availableUnits) || Number(formData.availableUnits) < 0) {
      newErrors.availableUnits = 'Available units must be a valid number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const feedData = {
        feedName: formData.feedName.trim(),
        type: formData.type.trim(),
        description: formData.description.trim(),
        unit: formData.unit.trim(),
        pricePerUnit: Number(formData.pricePerUnit),
        availableUnits: Number(formData.availableUnits)
      };

      let response;
      if (editFeed) {
        response = await feedAPI.updateFeed(editFeed._id, feedData);
      } else {
        response = await feedAPI.addFeed(feedData);
      }

      if (response.data) {
        setShowSuccessModal(true);
      }
    } catch (error) {
      console.error('Submit error:', error);
      const errorMessage = error.response?.data?.message || 'An error occurred. Please try again.';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleModalClose = () => {
    setShowSuccessModal(false);
    navigate('/supplier/view-feeds');
  };

  return (
    <div className="add-feed-container">
      <SupplierNavbar />
      
      <div className="add-feed-content">
        <div className="add-feed-wrapper">
          <h1 className="form-title">{editFeed ? 'Edit Feed' : 'Add New Feed'}</h1>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Feed Name *</label>
              <input
                type="text"
                name="feedName"
                value={formData.feedName}
                onChange={handleChange}
                className={errors.feedName ? 'error-input' : ''}
                disabled={isSubmitting}
              />
              {errors.feedName && <span className="error-message">{errors.feedName}</span>}
            </div>

            <div className="form-group">
              <label>Type *</label>
              <input
                type="text"
                name="type"
                value={formData.type}
                onChange={handleChange}
                className={errors.type ? 'error-input' : ''}
                disabled={isSubmitting}
              />
              {errors.type && <span className="error-message">{errors.type}</span>}
            </div>

            <div className="form-group">
              <label>Description *</label>
              <textarea
                name="description"
                rows="4"
                value={formData.description}
                onChange={handleChange}
                className={errors.description ? 'error-input' : ''}
                disabled={isSubmitting}
              />
              {errors.description && <span className="error-message">{errors.description}</span>}
            </div>

            <div className="form-group">
              <label>Unit *</label>
              <input
                type="text"
                name="unit"
                value={formData.unit}
                onChange={handleChange}
                className={errors.unit ? 'error-input' : ''}
                disabled={isSubmitting}
              />
              {errors.unit && <span className="error-message">{errors.unit}</span>}
            </div>

            <div className="form-group">
              <label>Price Per Unit *</label>
              <input
                type="number"
                name="pricePerUnit"
                value={formData.pricePerUnit}
                onChange={handleChange}
                className={errors.pricePerUnit ? 'error-input' : ''}
                disabled={isSubmitting}
              />
              {errors.pricePerUnit && <span className="error-message">{errors.pricePerUnit}</span>}
            </div>

            <div className="form-group">
              <label>Available Units *</label>
              <input
                type="number"
                name="availableUnits"
                value={formData.availableUnits}
                onChange={handleChange}
                className={errors.availableUnits ? 'error-input' : ''}
                disabled={isSubmitting}
              />
              {errors.availableUnits && <span className="error-message">{errors.availableUnits}</span>}
            </div>

            <button type="submit" className="submit-button" disabled={isSubmitting}>
              {isSubmitting ? 'Processing...' : (editFeed ? 'Update Feed' : 'Add Feed')}
            </button>
          </form>
        </div>
      </div>

      {showSuccessModal && (
        <div className="modal-overlay" onClick={handleModalClose}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>{editFeed ? "Successfully Updated!" : "Successfully Added!"}</h3>
            <button className="modal-button" onClick={handleModalClose}>Ok</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddFeed;