import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { feedbackAPI } from '../apiConfig';
import SupplierNavbar from './SupplierNavbar';
import './SupplierFeedback.css';

const SupplierFeedback = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [ratingFilter, setRatingFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const itemsPerPage = 4;

  // Sorting state - initially sorted by date (newest first)
  const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'desc' });

  const sortData = (data, key) => {
    if (!key) return data;

    const sorted = [...data].sort((a, b) => {
      let aVal = a[key];
      let bVal = b[key];

      // Handle nested objects
      if (key.includes('.')) {
        const keys = key.split('.');
        aVal = keys.reduce((obj, k) => obj?.[k], a);
        bVal = keys.reduce((obj, k) => obj?.[k], b);
      }

      // Handle dates
      if (key === 'createdAt') {
        aVal = new Date(aVal).getTime();
        bVal = new Date(bVal).getTime();
      }

      // Handle numbers
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortConfig.direction === 'asc' ? aVal - bVal : bVal - aVal;
      }

      // Handle strings
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

  const { data: feedbacks, isLoading, isError } = useQuery({
    queryKey: ['supplierFeedbacks'],
    queryFn: async () => {
      const response = await feedbackAPI.getAllFeedbacksBySupplier();
      return response.data;
    },
    retry: 1,         
    retryDelay: 5000,  
    refetchInterval: 5000, 
    refetchOnWindowFocus: false
  });

  const feedbacksArray = Array.isArray(feedbacks) ? feedbacks : [];

  // Apply search filter
  const searchedFeedbacks = feedbacksArray.filter(feedback => {
    const searchLower = searchTerm.toLowerCase();
    const title = feedback.title?.toLowerCase() || '';
    const itemName = feedback.itemName?.toLowerCase() || '';
    const ownerName = feedback.ownerId?.userName?.toLowerCase() || '';
    
    return title.includes(searchLower) || 
           itemName.includes(searchLower) || 
           ownerName.includes(searchLower);
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

  // Function to render sort indicator
  const renderSortIndicator = (columnKey) => {
    if (sortConfig.key !== columnKey) return null;
    return sortConfig.direction === 'asc' ? ' ↑' : ' ↓';
  };

  return (
    <div className="supplier-feedback-container">
      <SupplierNavbar />
      
      <div className="feedback-content">
        <h1 className="page-title">View Feedback</h1>

        {/* Search and Filters in One Line */}
        <div className="filters-search-section">
          <input
            type="text"
            placeholder="Search by title, item name, or owner..."
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
                <th>Owner</th>
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
                  <td colSpan="8" style={{ textAlign: 'center', padding: '50px' }}>
                    <div className="loading-spinner"></div>
                    Loading feedback...
                  </td>
                </tr>
              ) : isError ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '50px', color: '#f44336' }}>
                    Failed to load feedback. Please try again.
                  </td>
                </tr>
              ) : currentItems.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '50px' }}>
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
                    <td>{feedback.ownerId?.userName || 'N/A'}</td>
                    <td>
                      <span className="rating-display">
                        {'⭐'.repeat(feedback.rating)} {feedback.rating}/5
                      </span>
                    </td>
                    <td>{formatDate(feedback.createdAt)}</td>
                    <td>
                      <button 
                        className="btn-view" 
                        onClick={() => setSelectedFeedback(feedback)}
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {!isLoading && !isError && totalPages > 1 && (
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

      {/* View Feedback Details Modal */}
      {selectedFeedback && (
        <div className="modal-overlay" onClick={() => setSelectedFeedback(null)}>
          <div className="modal-content feedback-detail-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Feedback Details</h3>
            
            <div className="detail-row">
              <strong>Title:</strong>
              <span>{selectedFeedback.title}</span>
            </div>

            <div className="detail-row">
              <strong>Category:</strong>
              <span className={`category-badge ${selectedFeedback.category?.toLowerCase()}`}>
                {selectedFeedback.category}
              </span>
            </div>

            <div className="detail-row">
              <strong>Item:</strong>
              <span>{getItemName(selectedFeedback)}</span>
            </div>

            <div className="detail-row">
              <strong>Owner:</strong>
              <span>{selectedFeedback.ownerId?.userName || 'N/A'}</span>
            </div>

            <div className="detail-row">
              <strong>Rating:</strong>
              <span className="rating-display">
                {'⭐'.repeat(selectedFeedback.rating)} {selectedFeedback.rating}/5
              </span>
            </div>

            <div className="detail-row">
              <strong>Date:</strong>
              <span>{formatDate(selectedFeedback.createdAt)}</span>
            </div>

            <div className="detail-row description">
              <strong>Description:</strong>
              <p>{selectedFeedback.description}</p>
            </div>

            <button className="btn-close-modal" onClick={() => setSelectedFeedback(null)}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupplierFeedback;