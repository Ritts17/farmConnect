import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { toast } from 'react-toastify';
import { feedAPI, livestockAPI, requestAPI } from '../apiConfig';
import OwnerNavbar from './OwnerNavbar';
import './OwnerViewFeed.css';

const OwnerViewFeed = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showRequestModal, setShowRequestModal] = useState(null);
  const [selectedLivestock, setSelectedLivestock] = useState('');
  const [quantity, setQuantity] = useState('');
  const [requestErrors, setRequestErrors] = useState({});
  const [typeFilter, setTypeFilter] = useState('All');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const itemsPerPage = 3;

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

  const { data: feeds, isLoading: feedsLoading } = useQuery({
    queryKey: ['feeds'],
    queryFn: async () => {
      const response = await feedAPI.getAllFeeds();
      return response.data;
    },
    retry: 1,         
    retryDelay: 5000,  
    refetchInterval: 5000, 
    refetchOnWindowFocus: false
  });

  const { data: livestock } = useQuery({
    queryKey: ['livestock'],
    queryFn: async () => {
      const response = await livestockAPI.getAllLivestock();
      return response.data;
    },
    retry: 1,         
    retryDelay: 5000,  
    refetchInterval: 5000, 
    refetchOnWindowFocus: false
  });

  const requestMutation = useMutation({
    mutationFn: async (requestData) => {
      const response = await requestAPI.addRequest(requestData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['requests']);
      toast.success('Request sent successfully');
      setShowRequestModal(null);
      setSelectedLivestock('');
      setQuantity('');
    },
    onError: (error) => {
      const errorMessage = error.response?.data?.message || 'Failed to send request';
      toast.error(errorMessage);
    }
  });

  const feedsArray = Array.isArray(feeds) ? feeds : [];
  const livestockArray = Array.isArray(livestock) ? livestock : [];

  const uniqueTypes = React.useMemo(() => {
    const types = [...new Set(feedsArray.map(feed => feed.type).filter(Boolean))];
    return types.sort();
  }, [feedsArray]);

  const filteredFeeds = feedsArray.filter(feed => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = feed.feedName.toLowerCase().includes(searchLower);
    const matchesType = typeFilter === 'All' || feed.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const sortedFeeds = sortData(filteredFeeds, sortConfig.key);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedFeeds.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(sortedFeeds.length / itemsPerPage);

  const handleRequestClick = (feed) => {
    setShowRequestModal(feed);
    setRequestErrors({});
  };

  const validateRequest = () => {
    const errors = {};
    if (!selectedLivestock) {
      errors.livestock = 'Livestock is required';
    }
    if (!quantity) {
      errors.quantity = 'Quantity is required';
    } else if (Number(quantity) <= 0) {
      errors.quantity = 'Quantity must be greater than 0';
    } else if (Number(quantity) > showRequestModal.availableUnits) {
      errors.quantity = `Only ${showRequestModal.availableUnits} units available`;
    }
    setRequestErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleConfirmRequest = () => {
    if (!validateRequest()) {
      return;
    }

    const requestData = {
      itemType: 'Feed',
      itemId: showRequestModal._id,
      itemName : showRequestModal.feedName,
      livestockName : selectedLivestock,
      quantity: Number(quantity)
    };

    requestMutation.mutate(requestData);
  };

  return (
    <div className="owner-feed-container">
      <OwnerNavbar />
      
      <div className="feed-content">
        <h1 className="page-title">Available Feeds</h1>

        <div className="filters-search-section">
          <input
            type="text"
            placeholder="Search by Feed Name"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="search-input"
          />

          <select 
            value={typeFilter} 
            onChange={(e) => {
              setTypeFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="filter-select"
            disabled={feedsLoading || uniqueTypes.length === 0}
          >
            <option value="All">All Types</option>
            {uniqueTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        <div className="table-responsive">
          <table className="feed-table">
            <thead>
              <tr>
                <th>SNo</th>
                <th 
                  onClick={() => handleSort('feedName')} 
                  style={{ cursor: 'pointer', userSelect: 'none' }}
                  title="Click to sort"
                >
                  Feed Name{renderSortIndicator('feedName')}
                </th>
                <th 
                  onClick={() => handleSort('type')} 
                  style={{ cursor: 'pointer', userSelect: 'none' }}
                  title="Click to sort"
                >
                  Type{renderSortIndicator('type')}
                </th>
                <th>Description</th>
                <th>Unit</th>
                <th 
                  onClick={() => handleSort('pricePerUnit')} 
                  style={{ cursor: 'pointer', userSelect: 'none' }}
                  title="Click to sort"
                >
                  Price Per Unit{renderSortIndicator('pricePerUnit')}
                </th>
                <th 
                  onClick={() => handleSort('availableUnits')} 
                  style={{ cursor: 'pointer', userSelect: 'none' }}
                  title="Click to sort"
                >
                  Available Units{renderSortIndicator('availableUnits')}
                </th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {feedsLoading ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '50px' }}>
                    <div className="loading-spinner"></div>
                    Loading feeds...
                  </td>
                </tr>
              ) : currentItems.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '50px' }}>
                    {feedsArray.length === 0 ? 'No feeds available.' : 'No feeds match your filters.'}
                  </td>
                </tr>
              ) : (
                currentItems.map((feed, index) => (
                  <tr key={feed._id}>
                    <td>{indexOfFirstItem + index + 1}</td>
                    <td>{feed.feedName}</td>
                    <td>{feed.type}</td>
                    <td>{feed.description}</td>
                    <td>{feed.unit}</td>
                    <td>₹{feed.pricePerUnit}</td>
                    <td>{feed.availableUnits}</td>
                    <td>
                      <button 
                        className="btn-request" 
                        onClick={() => handleRequestClick(feed)}
                        disabled={feed.availableUnits === 0}
                      >
                        {feed.availableUnits === 0 ? 'Out of Stock' : 'Request'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {!feedsLoading && totalPages > 1 && (
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

      {showRequestModal && (
        <div className="modal-overlay" onClick={() => setShowRequestModal(null)}>
          <div className="modal-content request-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Request Feed</h3>
            <p className="feed-name">{showRequestModal.feedName}</p>
            <p className="available-info">Available Units: {showRequestModal.availableUnits}</p>
            
            <div className="form-group">
              <label>Select Livestock *</label>
              <select
                value={selectedLivestock}
                onChange={(e) => {
                  setSelectedLivestock(e.target.value);
                  setRequestErrors({ ...requestErrors, livestock: '' });
                }}
                className={requestErrors.livestock ? 'error-input' : ''}
              >
                <option value="">-- Select Livestock --</option>
                {livestockArray.map(item => (
                  <option key={item._id} value={item.name}>
                    {item.name} ({item.species})
                  </option>
                ))}
              </select>
              {requestErrors.livestock && (
                <span className="error-message">{requestErrors.livestock}</span>
              )}
            </div>

            <div className="form-group">
              <label>Quantity *</label>
              <input
                type="number"
                value={quantity}
                onChange={(e) => {
                  setQuantity(e.target.value);
                  setRequestErrors({ ...requestErrors, quantity: '' });
                }}
                className={requestErrors.quantity ? 'error-input' : ''}
                min="1"
                max={showRequestModal.availableUnits}
              />
              {requestErrors.quantity && (
                <span className="error-message">{requestErrors.quantity}</span>
              )}
            </div>

            <div className="modal-actions">
              <button 
                className="btn-cancel" 
                onClick={() => setShowRequestModal(null)}
                disabled={requestMutation.isLoading}
              >
                Cancel
              </button>
              <button 
                className="btn-confirm" 
                onClick={handleConfirmRequest}
                disabled={requestMutation.isLoading}
              >
                {requestMutation.isLoading ? 'Sending...' : 'Confirm Request'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OwnerViewFeed;