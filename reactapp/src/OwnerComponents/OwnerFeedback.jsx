import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { toast } from 'react-toastify';
import { feedbackAPI } from '../apiConfig';
import OwnerNavbar from './OwnerNavbar';
import './OwnerFeedback.css';

const OwnerFeedback = () => {
  const queryClient = useQueryClient();
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteFeedbackId, setDeleteFeedbackId] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [ratingFilter, setRatingFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'desc' });
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

      if (key === 'createdAt') {
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

  const { data: feedbacks, isLoading } = useQuery({
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

  const deleteMutation = useMutation({
    mutationFn: async (feedbackId) => {
      const response = await feedbackAPI.deleteFeedback(feedbackId);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['myFeedbacks']);
      toast.success('Feedback deleted successfully');
      setDeleteFeedbackId(null);
    },
    onError: (error) => {
      const errorMessage = error.response?.data?.message || 'Failed to delete feedback';
      toast.error(errorMessage);
    }
  });

  const feedbacksArray = Array.isArray(feedbacks) ? feedbacks : [];

  // Apply search filter
  const searchedFeedbacks = feedbacksArray.filter(feedback => {
    const searchLower = searchTerm.toLowerCase();
    const title = feedback.title?.toLowerCase() || '';
    const itemName = feedback.itemName?.toLowerCase() || '';
    
    return title.includes(searchLower) || itemName.includes(searchLower);
  });

  // Apply category filter
  const filteredByCategory = categoryFilter === 'All' 
    ? searchedFeedbacks 
    : searchedFeedbacks.filter(feedback => feedback.category === categoryFilter);

  // Apply rating filter
  const filteredByRating = ratingFilter === 'All'
    ? filteredByCategory
    : filteredByCategory.filter(feedback => feedback.rating === Number(ratingFilter));

  const sortedFeedbacks = sortData(filteredByRating, sortConfig.key);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedFeedbacks.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(sortedFeedbacks.length / itemsPerPage);

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getItemName = (feedback) => {
    if (feedback.category === 'Feed') {
      return feedback.itemName || 'N/A';
    } else {
      return feedback.itemName || 'N/A';
    }
  };

  return (
    <div className="owner-feedback-container">
      <OwnerNavbar />
      
      <div className="feedback-content">
        <h1 className="page-title">My Feedback</h1>

        {/* Search and Filters in One Line */}
        <div className="filters-search-section">
          <input
            type="text"
            placeholder="Search by title or item name..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="search-input"
          />

          <select 
            value={categoryFilter} 
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="filter-select"
          >
            <option value="All">All Categories</option>
            <option value="Feed">Feed</option>
            <option value="Medicine">Medicine</option>
          </select>

          <select 
            value={ratingFilter} 
            onChange={(e) => {
              setRatingFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="filter-select"
          >
            <option value="All">All Ratings</option>
            <option value="5">5 Stars</option>
            <option value="4">4 Stars</option>
            <option value="3">3 Stars</option>
            <option value="2">2 Stars</option>
            <option value="1">1 Star</option>
          </select>
        </div>

        <div className="table-responsive">
          <table className="feedback-table">
            <thead>
              <tr>
                <th>SNo</th>
                <th 
                  onClick={() => handleSort('title')} 
                  style={{ cursor: 'pointer', userSelect: 'none' }}
                  title="Click to sort"
                >
                  Title{renderSortIndicator('title')}
                </th>
                <th>Category</th>
                <th>Item Name</th>
                <th 
                  onClick={() => handleSort('rating')} 
                  style={{ cursor: 'pointer', userSelect: 'none' }}
                  title="Click to sort"
                >
                  Rating{renderSortIndicator('rating')}
                </th>
                <th 
                  onClick={() => handleSort('createdAt')} 
                  style={{ cursor: 'pointer', userSelect: 'none' }}
                  title="Click to sort"
                >
                  Date{renderSortIndicator('createdAt')}
                </th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '50px' }}>
                    <div className="loading-spinner"></div>
                    Loading feedback...
                  </td>
                </tr>
              ) : currentItems.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '50px' }}>
                    {feedbacksArray.length === 0 ? 'No feedback found.' : 'No feedback matches your search or filters.'}
                  </td>
                </tr>
              ) : (
                currentItems.map((feedback, index) => (
                  <tr key={feedback._id}>
                    <td>{indexOfFirstItem + index + 1}</td>
                    <td>{feedback.title}</td>
                    <td>
                      <span className={`category-badge ${feedback.category?.toLowerCase()}`}>
                        {feedback.category}
                      </span>
                    </td>
                    <td>{getItemName(feedback)}</td>
                    <td>
                      <span className="rating-display">
                        {'⭐'.repeat(feedback.rating)} {feedback.rating}/5
                      </span>
                    </td>
                    <td>{formatDate(feedback.createdAt)}</td>
                    <td>
                      <button 
                        className="btn-delete" 
                        onClick={() => setDeleteFeedbackId(feedback._id)}
                        disabled={deleteMutation.isLoading}
                      >
                        Delete
                      </button>
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
      {deleteFeedbackId && (
        <div className="modal-overlay" onClick={() => setDeleteFeedbackId(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Are you sure you want to delete this feedback?</h3>
            <div className="modal-actions">
              <button 
                className="btn-cancel" 
                onClick={() => setDeleteFeedbackId(null)}
                disabled={deleteMutation.isLoading}
              >
                Cancel
              </button>
              <button 
                className="btn-confirm" 
                onClick={() => deleteMutation.mutate(deleteFeedbackId)}
                disabled={deleteMutation.isLoading}
              >
                {deleteMutation.isLoading ? 'Deleting...' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OwnerFeedback;