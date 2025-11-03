import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getImageUrl, livestockAPI } from '../apiConfig';
import OwnerNavbar from './OwnerNavbar';
import './LivestockForm.css';

const LivestockForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const editLivestock = location.state?.livestock;

  const [formData, setFormData] = useState({
    name: '',
    species: '',
    age: '',
    breed: '',
    healthCondition: '',
    location: '',
    vaccinationStatus: '',
    attachment: null
  });
  const [errors, setErrors] = useState({});
  const [imagePreview, setImagePreview] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (editLivestock) {
      setFormData({
        name: editLivestock.name,
        species: editLivestock.species,
        age: editLivestock.age,
        breed: editLivestock.breed,
        healthCondition: editLivestock.healthCondition,
        location: editLivestock.location,
        vaccinationStatus: editLivestock.vaccinationStatus,
        attachment: null
      });
      if (editLivestock.attachment) {
        setImagePreview(getImageUrl(editLivestock.attachment));
      }
    } else {
      // Clear form if no edit data (handles navigation from edit mode)
      setFormData({
        name: '',
        species: '',
        age: '',
        breed: '',
        healthCondition: '',
        location: '',
        vaccinationStatus: '',
        attachment: null
      });
      setImagePreview(null);
    }
  }, [editLivestock, location.key]);

  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.species.trim()) {
      newErrors.species = 'Species is required';
    }

    if (!formData.age) {
      newErrors.age = 'Age is required';
    } else if (isNaN(formData.age) || Number(formData.age) < 0) {
      newErrors.age = 'Age must be a valid number';
    }

    if (!formData.breed.trim()) {
      newErrors.breed = 'Breed is required';
    }

    if (!formData.healthCondition.trim()) {
      newErrors.healthCondition = 'Health condition is required';
    }

    if (!formData.location.trim()) {
      newErrors.location = 'Location is required';
    }

    if (!formData.vaccinationStatus.trim()) {
      newErrors.vaccinationStatus = 'Vaccination status is required';
    }

    if (!editLivestock && !formData.attachment) {
      newErrors.attachment = 'File is required';
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

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (50KB = 50 * 1024 bytes)
      if (file.size > 50 * 1024) {
        setErrors({
          ...errors,
          attachment: 'File size must be less than 50KB'
        });
        return;
      }

      setFormData({
        ...formData,
        attachment: file
      });
      setImagePreview(URL.createObjectURL(file));
      if (errors.attachment) {
        setErrors({
          ...errors,
          attachment: ''
        });
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name.trim());
      formDataToSend.append('species', formData.species.trim());
      formDataToSend.append('age', formData.age);
      formDataToSend.append('breed', formData.breed.trim());
      formDataToSend.append('healthCondition', formData.healthCondition.trim());
      formDataToSend.append('location', formData.location.trim());
      formDataToSend.append('vaccinationStatus', formData.vaccinationStatus.trim());
      
      if (formData.attachment && formData.attachment instanceof File) {
        formDataToSend.append('attachment', formData.attachment);
      }

      let response;
      if (editLivestock) {
        response = await livestockAPI.updateLivestock(editLivestock._id, formDataToSend);
      } else {
        response = await livestockAPI.addLivestock(formDataToSend);
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
    navigate('/owner/view-livestock');
  };

  return (
    <div className="livestock-form-container">
      <OwnerNavbar />
      
      <div className="livestock-form-content">
        <div className="livestock-form-wrapper">
          <h1 className="form-title">{editLivestock ? 'Edit Livestock' : 'Add New Livestock'}</h1>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={errors.name ? 'error-input' : ''}
                disabled={isSubmitting}
              />
              {errors.name && <span className="error-message">{errors.name}</span>}
            </div>

            <div className="form-group">
              <label>Species *</label>
              <input
                type="text"
                name="species"
                value={formData.species}
                onChange={handleChange}
                className={errors.species ? 'error-input' : ''}
                disabled={isSubmitting}
              />
              {errors.species && <span className="error-message">{errors.species}</span>}
            </div>

            <div className="form-group">
              <label>Age *</label>
              <input
                type="number"
                name="age"
                value={formData.age}
                onChange={handleChange}
                className={errors.age ? 'error-input' : ''}
                disabled={isSubmitting}
              />
              {errors.age && <span className="error-message">{errors.age}</span>}
            </div>

            <div className="form-group">
              <label>Breed *</label>
              <input
                type="text"
                name="breed"
                value={formData.breed}
                onChange={handleChange}
                className={errors.breed ? 'error-input' : ''}
                disabled={isSubmitting}
              />
              {errors.breed && <span className="error-message">{errors.breed}</span>}
            </div>

            <div className="form-group">
              <label>Health Condition *</label>
              <input
                type="text"
                name="healthCondition"
                value={formData.healthCondition}
                onChange={handleChange}
                className={errors.healthCondition ? 'error-input' : ''}
                disabled={isSubmitting}
              />
              {errors.healthCondition && <span className="error-message">{errors.healthCondition}</span>}
            </div>

            <div className="form-group">
              <label>Location *</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                className={errors.location ? 'error-input' : ''}
                disabled={isSubmitting}
              />
              {errors.location && <span className="error-message">{errors.location}</span>}
            </div>

            <div className="form-group">
              <label>Vaccination Status *</label>
              <input
                type="text"
                name="vaccinationStatus"
                value={formData.vaccinationStatus}
                onChange={handleChange}
                className={errors.vaccinationStatus ? 'error-input' : ''}
                disabled={isSubmitting}
              />
              {errors.vaccinationStatus && <span className="error-message">{errors.vaccinationStatus}</span>}
            </div>

            <div className="form-group">
              <label>Attachment *</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className={errors.attachment ? 'error-input' : ''}
                disabled={isSubmitting}
              />
              {errors.attachment && <span className="error-message">{errors.attachment}</span>}
              {imagePreview && (
                <div className="image-preview">
                  <img src={imagePreview} alt="Preview" />
                </div>
              )}
            </div>

            <button type="submit" className="submit-button" disabled={isSubmitting}>
              {isSubmitting ? 'Processing...' : (editLivestock ? 'Update Livestock' : 'Add Livestock')}
            </button>
          </form>
        </div>
      </div>

      {showSuccessModal && (
        <div className="modal-overlay" onClick={handleModalClose}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>{editLivestock ? "Updated Successfully!" : "Successfully Added!"}</h3>
            <button className="modal-button" onClick={handleModalClose}>Ok</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LivestockForm;