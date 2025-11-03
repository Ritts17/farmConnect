// SupplierComponents/AddMedicine.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { medicineAPI } from '../apiConfig';
import SupplierNavbar from './SupplierNavbar';
import './AddMedicine.css';

const AddMedicine = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const editMedicine = location.state?.medicine;

  const [formData, setFormData] = useState({
    medicineName: '',
    type: '',
    description: '',
    dosage: '',
    pricePerUnit: '',
    unit: '',
    manufacturer: '',
    expiryDate: ''
  });
  const [errors, setErrors] = useState({});
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (editMedicine) {
      setFormData({
        medicineName: editMedicine.medicineName,
        type: editMedicine.type,
        description: editMedicine.description,
        dosage: editMedicine.dosage,
        pricePerUnit: editMedicine.pricePerUnit,
        unit: editMedicine.unit,
        manufacturer: editMedicine.manufacturer,
        expiryDate: editMedicine.expiryDate ? new Date(editMedicine.expiryDate).toISOString().split('T')[0] : '',
        availableUnits: editMedicine.availableUnits || 0
      });
    } else {
      // Clear form if no edit data
      setFormData({
        medicineName: '',
        type: '',
        description: '',
        dosage: '',
        pricePerUnit: '',
        unit: '',
        manufacturer: '',
        expiryDate: '',
        availableUnits: ''
      });
    }
  }, [editMedicine, location.key]);

  const validate = () => {
    const newErrors = {};

    if (!formData.medicineName.trim()) {
      newErrors.medicineName = 'Medicine name is required';
    }

    if (!formData.type.trim()) {
      newErrors.type = 'Type is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!formData.dosage.trim()) {
      newErrors.dosage = 'Dosage is required';
    }

    if (!formData.pricePerUnit) {
      newErrors.pricePerUnit = 'Price per unit is required';
    } else if (isNaN(formData.pricePerUnit) || Number(formData.pricePerUnit) <= 0) {
      newErrors.pricePerUnit = 'Price per unit must be a valid number';
    }

    if (!formData.unit.trim()) {
      newErrors.unit = 'Unit is required';
    }

    if (!formData.manufacturer.trim()) {
      newErrors.manufacturer = 'Manufacturer is required';
    }

    if (!formData.expiryDate) {
      newErrors.expiryDate = 'Expiry date is required';
    } else if (new Date(formData.expiryDate) < new Date()) {
      newErrors.expiryDate = 'Expiry date must be in the future';
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
      const medicineData = {
        medicineName: formData.medicineName.trim(),
        type: formData.type.trim(),
        description: formData.description.trim(),
        dosage: formData.dosage.trim(),
        pricePerUnit: Number(formData.pricePerUnit),
        unit: formData.unit.trim(),
        manufacturer: formData.manufacturer.trim(),
        expiryDate: formData.expiryDate,
        availableUnits: Number(formData.availableUnits)
      };

      let response;
      if (editMedicine) {
        response = await medicineAPI.updateMedicine(editMedicine._id, medicineData);
      } else {
        response = await medicineAPI.addMedicine(medicineData);
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
    navigate('/supplier/view-medicines');
  };

  return (
    <div className="add-medicine-container">
      <SupplierNavbar />
      
      <div className="add-medicine-content">
        <div className="add-medicine-wrapper">
          <h1 className="form-title">{editMedicine ? 'Edit Medicine' : 'Add New Medicine'}</h1>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Medicine Name *</label>
              <input
                type="text"
                name="medicineName"
                value={formData.medicineName}
                onChange={handleChange}
                className={errors.medicineName ? 'error-input' : ''}
                disabled={isSubmitting}
              />
              {errors.medicineName && <span className="error-message">{errors.medicineName}</span>}
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
              <label>Dosage *</label>
              <input
                type="text"
                name="dosage"
                value={formData.dosage}
                onChange={handleChange}
                className={errors.dosage ? 'error-input' : ''}
                disabled={isSubmitting}
              />
              {errors.dosage && <span className="error-message">{errors.dosage}</span>}
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
              <label>Manufacturer *</label>
              <input
                type="text"
                name="manufacturer"
                value={formData.manufacturer}
                onChange={handleChange}
                className={errors.manufacturer ? 'error-input' : ''}
                disabled={isSubmitting}
              />
              {errors.manufacturer && <span className="error-message">{errors.manufacturer}</span>}
            </div>

            <div className="form-group">
              <label>Expiry Date *</label>
              <input
                type="date"
                name="expiryDate"
                value={formData.expiryDate}
                onChange={handleChange}
                className={errors.expiryDate ? 'error-input' : ''}
                disabled={isSubmitting}
              />
              {errors.expiryDate && <span className="error-message">{errors.expiryDate}</span>}
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
              {isSubmitting ? 'Processing...' : (editMedicine ? 'Update Medicine' : 'Add Medicine')}
            </button>
          </form>
        </div>
      </div>

      {showSuccessModal && (
        <div className="modal-overlay" onClick={handleModalClose}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Successfully {editMedicine ? 'Updated Successfully!' : 'Added Successfully!'}!</h3>
            <button className="modal-button" onClick={handleModalClose}>Ok</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddMedicine