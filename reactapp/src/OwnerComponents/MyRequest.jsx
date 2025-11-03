import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { toast } from 'react-toastify';
import { requestAPI, feedbackAPI } from '../apiConfig';
import OwnerNavbar from './OwnerNavbar';
import './MyRequest.css';

const MyRequest = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteRequestId, setDeleteRequestId] = useState(null);
  const [showFeedbackModal, setShowFeedbackModal] = useState(null);
  const [statusFilter, setStatusFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [sortConfig, setSortConfig] = useState({ key: 'requestDate', direction: 'desc' });
  const [feedbackForm, setFeedbackForm] = useState({
    title: '',
    description: '',
    rating: ''
  });
  const [feedbackErrors, setFeedbackErrors] = useState({});
  const itemsPerPage = 4;

  const sortData = (data, key) => {
    if (!key) return data;

    const sorted = [...data].sort((a, b) => {
      let aVal = a[key];
      let bVal = b[key];

      if (key.includes('.')) {
        const keys = key.split('.');
        aVal = keys.reduce((obj, k) => obj?.[k], a);
        bVal = keys.reduce((obj, k) => obj?.[k], b);
      }

      if (key === 'requestDate' || key === 'createdAt') {
        aVal = new Date(aVal).getTime();
        bVal = new Date(bVal).getTime();
      }

      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortConfig.direction === 'asc' ? aVal - bVal : bVal - aVal;
      }

      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortConfig.direction === 'asc'
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }

      return 0;
    });

    return sorted;
  };

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const renderSortIndicator = (columnKey) => {
    if (sortConfig.key !== columnKey) return null;
    return sortConfig.direction === 'asc' ? ' ↑' : ' ↓';
  };

  const { data: myFeedbacks } = useQuery({
    queryKey: ['myFeedbacks'],
    queryFn: async () => {
      const response = await feedbackAPI.getFeedbacksByOwnerId();
      return response.data;
    },
    retry: 1,         
    retryDelay: 5000,  
    refetchInterval: 5000, 
    refetchOnWindowFocus: false
  });

  const { data: requests, isLoading } = useQuery({
    queryKey: ['myRequests'],
    queryFn: async () => {
      const response = await requestAPI.getRequestsByOwnerId();
      return response.data;
    },
    retry: 1,         
    retryDelay: 5000,  
    refetchInterval: 5000, 
    refetchOnWindowFocus: false
  });

  const hasFeedback = (request) => {
    const feedbacksArray = Array.isArray(myFeedbacks) ? myFeedbacks : [];
    return feedbacksArray.some(
      feedback =>
        feedback?.itemId?._id === request?.itemId?._id &&
        feedback.category === request.itemType
    );
  };

  const deleteMutation = useMutation({
    mutationFn: async (requestId) => {
      const response = await requestAPI.deleteRequest(requestId);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['myRequests']);
      toast.success('Request deleted successfully');
      setDeleteRequestId(null);
    },
    onError: (error) => {
      const errorMessage = error.response?.data?.message || 'Failed to delete request';
      toast.error(errorMessage);
    }
  });

  const feedbackMutation = useMutation({
    mutationFn: async (feedbackData) => {
      const response = await feedbackAPI.addFeedback(feedbackData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['myRequests']);
      queryClient.invalidateQueries(['myFeedbacks']);
      toast.success('Feedback submitted successfully');
      setShowFeedbackModal(null);
      setFeedbackForm({ title: '', description: '', rating: '' });
      setFeedbackErrors({});
    },
    onError: (error) => {
      const errorMessage = error.response?.data?.message || 'Failed to submit feedback';
      toast.error(errorMessage);
    }
  });

  const validateFeedback = () => {
    const errors = {};

    if (!feedbackForm.title.trim()) {
      errors.title = 'Title is required';
    }

    if (!feedbackForm.description.trim()) {
      errors.description = 'Description is required';
    }

    if (!feedbackForm.rating) {
      errors.rating = 'Rating is required';
    }

    setFeedbackErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleFeedbackSubmit = () => {
    if (!validateFeedback()) {
      return;
    }

    const feedbackData = {
      title: feedbackForm.title.trim(),
      description: feedbackForm.description.trim(),
      category: showFeedbackModal.itemType,
      rating: Number(feedbackForm.rating),
      itemId: showFeedbackModal?.itemId._id || 'N/A',
      supplierId: showFeedbackModal?.itemId.supplierId || 'N/A'
    };

    feedbackMutation.mutate(feedbackData);
  };

  const requestsArray = Array.isArray(requests) ? requests : [];

  const filteredRequests = requestsArray.filter(request => {
    const searchLower = searchTerm.toLowerCase();
    const itemName = request.itemName || request.itemName || '';
    const matchesSearch = itemName.toLowerCase().includes(searchLower);
    const matchesStatus = statusFilter === 'All' || request.status === statusFilter;
    const matchesType = typeFilter === 'All' || request.itemType === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const sortedRequests = sortData(filteredRequests, sortConfig.key);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedRequests.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(sortedRequests.length / itemsPerPage);

  const handleDelete = (requestId, status) => {
    if (status !== 'Pending') {
      toast.warning('Only pending requests can be deleted');
      return;
    }
    setDeleteRequestId(requestId);
  };

  const confirmDelete = () => {
    deleteMutation.mutate(deleteRequestId);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getItemName = (request) => {
    if (request.itemType === 'Feed') {
      return request.itemId?.feedName || 'N/A';
    } else {
      return request.itemId?.medicineName || 'N/A';
    }
  };

  return (
    <div className="my-request-container">
      <OwnerNavbar />

      <div className="request-content">
        <h1 className="page-title">My Requests</h1>

        <div className="filters-search-section">
          <input
            type="text"
            placeholder="Search by Item Name"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="search-input"
          />

          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="filter-select"
          >
            <option value="All">All Status</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
          </select>

          <select
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="filter-select"
          >
            <option value="All">All Types</option>
            <option value="Feed">Feed</option>
            <option value="Medicine">Medicine</option>
          </select>
        </div>

        <div className="table-responsive">
          <table className="request-table">
            <thead>
              <tr>
                <th>SNo</th>
                <th>Type</th>
                <th>Item Name</th>
                <th>Livestock</th>
                <th
                  onClick={() => handleSort('quantity')}
                  style={{ cursor: 'pointer', userSelect: 'none' }}
                  title="Click to sort"
                >
                  Quantity{renderSortIndicator('quantity')}
                </th>
                <th>Status</th>
                <th
                  onClick={() => handleSort('requestDate')}
                  style={{ cursor: 'pointer', userSelect: 'none' }}
                  title="Click to sort"
                >
                  Request Date{renderSortIndicator('requestDate')}
                </th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '50px' }}>
                    <div className="loading-spinner"></div>
                    Loading requests...
                  </td>
                </tr>
              ) : currentItems.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '50px' }}>
                    {requestsArray.length === 0 ? 'No requests found.' : 'No requests match your filters.'}
                  </td>
                </tr>
              ) : (
                currentItems.map((request, index) => (
                  <tr key={request._id}>
                    <td>{indexOfFirstItem + index + 1}</td>
                    <td>
                      <span className={`type-badge ${request?.itemType?.toLowerCase()}`}>
                        {request.itemType}
                      </span>
                    </td>
                    <td>{request.itemName}</td>
                    <td>{request.livestockName || 'N/A'}</td>
                    <td>{request.quantity}</td>
                    <td>
                      <span className={`status-badge ${request.status?.toLowerCase()}`}>
                        {request.status}
                      </span>
                    </td>
                    <td>{formatDate(request.requestDate || request.createdAt)}</td>
                    <td>
                      {request.status === 'Pending' ? (
                        <button
                          className="btn-delete"
                          onClick={() => handleDelete(request._id, request.status)}
                        >
                          Delete
                        </button>
                      ) : request.status === 'Approved' && request.itemId !== null ? (
                        <button
                          className="btn-feedback"
                          onClick={() => setShowFeedbackModal(request)}
                          disabled={hasFeedback(request)}
                          title={hasFeedback(request) ? 'Feedback already submitted' : 'Add Feedback'}
                        >
                          {hasFeedback(request) ? 'Feedback Submitted' : 'Add Feedback'}
                        </button>
                      ) : null}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {!isLoading && totalPages > 1 && (
          <div className="pagination">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="page-btn"
            >
              Prev
            </button>
            <span className="page-info">Page {currentPage} of {totalPages}</span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="page-btn"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteRequestId && (
        <div className="modal-overlay" onClick={() => setDeleteRequestId(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Are you sure you want to delete this request?</h3>
            <div className="modal-actions">
              <button
                className="btn-cancel"
                onClick={() => setDeleteRequestId(null)}
                disabled={deleteMutation.isLoading}
              >
                Cancel
              </button>
              <button
                className="btn-confirm"
                onClick={confirmDelete}
                disabled={deleteMutation.isLoading}
              >
                {deleteMutation.isLoading ? 'Deleting...' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Feedback Modal */}
      {showFeedbackModal && (
        <div className="modal-overlay" onClick={() => {
          setShowFeedbackModal(null);
          setFeedbackForm({ title: '', description: '', rating: '' });
          setFeedbackErrors({});
        }}>
          <div className="modal-content feedback-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Add Feedback</h3>

            <div className="form-group">
              <label>Item Type</label>
              <input
                type="text"
                value={showFeedbackModal.itemType}
                disabled
                className="form-input disabled"
              />
            </div>

            <div className="form-group">
              <label>Item Name</label>
              <input
                type="text"
                value={showFeedbackModal.itemName}
                disabled
                className="form-input disabled"
              />
            </div>

            <div className="form-group">
              <label>Livestock</label>
              <input
                type="text"
                value={showFeedbackModal.livestockName || 'N/A'}
                disabled
                className="form-input disabled"
              />
            </div>

            <div className="form-group">
              <label>Title <span className="required">*</span></label>
              <input
                type="text"
                placeholder="Enter feedback title"
                value={feedbackForm.title}
                onChange={(e) => {
                  setFeedbackForm({ ...feedbackForm, title: e.target.value });
                  if (feedbackErrors.title) {
                    setFeedbackErrors({ ...feedbackErrors, title: '' });
                  }
                }}
                className={`form-input ${feedbackErrors.title ? 'error' : ''}`}
              />
              {feedbackErrors.title && (
                <span className="error-text">{feedbackErrors.title}</span>
              )}
            </div>

            <div className="form-group">
              <label>Description <span className="required">*</span></label>
              <textarea
                placeholder="Enter feedback description"
                rows="4"
                value={feedbackForm.description}
                onChange={(e) => {
                  setFeedbackForm({ ...feedbackForm, description: e.target.value });
                  if (feedbackErrors.description) {
                    setFeedbackErrors({ ...feedbackErrors, description: '' });
                  }
                }}
                className={`form-input ${feedbackErrors.description ? 'error' : ''}`}
              />
              {feedbackErrors.description && (
                <span className="error-text">{feedbackErrors.description}</span>
              )}
            </div>

            <div className="form-group">
              <label>Rating <span className="required">*</span></label>
              <select
                value={feedbackForm.rating}
                onChange={(e) => {
                  setFeedbackForm({ ...feedbackForm, rating: e.target.value });
                  if (feedbackErrors.rating) {
                    setFeedbackErrors({ ...feedbackErrors, rating: '' });
                  }
                }}
                className={`form-input ${feedbackErrors.rating ? 'error' : ''}`}
              >
                <option value="">Select rating</option>
                <option value="1">1 - Poor</option>
                <option value="2">2 - Fair</option>
                <option value="3">3 - Good</option>
                <option value="4">4 - Very Good</option>
                <option value="5">5 - Excellent</option>
              </select>
              {feedbackErrors.rating && (
                <span className="error-text">{feedbackErrors.rating}</span>
              )}
            </div>

            <div className="modal-actions">
              <button
                className="btn-cancel"
                onClick={() => {
                  setShowFeedbackModal(null);
                  setFeedbackForm({ title: '', description: '', rating: '' });
                  setFeedbackErrors({});
                }}
                disabled={feedbackMutation.isLoading}
              >
                Cancel
              </button>
              <button
                className="btn-confirm"
                onClick={handleFeedbackSubmit}
                disabled={feedbackMutation.isLoading}
              >
                {feedbackMutation.isLoading ? 'Submitting...' : 'Submit Feedback'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyRequest;