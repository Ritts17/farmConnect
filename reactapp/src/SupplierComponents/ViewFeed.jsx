import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { feedAPI } from '../apiConfig';
import SupplierNavbar from './SupplierNavbar';
import './ViewFeed.css';

const ViewFeed = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteFeedId, setDeleteFeedId] = useState(null);
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

  const { data: feeds, isLoading, isError } = useQuery({
    queryKey: ['supplierFeeds'],
    queryFn: async () => {
      const response = await feedAPI.getSupplierFeeds();
      return response.data;
    },
    retry: 1,         
    retryDelay: 5000,  
    refetchInterval: 5000, 
    refetchOnWindowFocus: false
  });

  const deleteMutation = useMutation({
    mutationFn: async (feedId) => {
      const response = await feedAPI.deleteFeed(feedId);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['supplierFeeds']);
      toast.success('Feed deleted successfully');
      setDeleteFeedId(null);
    },
    onError: (error) => {
      const errorMessage = error.response?.data?.message || 'Failed to delete feed';
      toast.error(errorMessage);
    }
  });

  const feedsArray = Array.isArray(feeds) ? feeds : [];

  // Get unique types dynamically from the data
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

  const handleEdit = (feed) => {
    navigate('/supplier/add-feed', { state: { feed } });
  };

  const handleDelete = (feedId) => {
    setDeleteFeedId(feedId);
  };

  const confirmDelete = () => {
    deleteMutation.mutate(deleteFeedId);
  };

  return (
    <div className="view-feed-container">
      <SupplierNavbar />
      
      <div className="feed-content">
        <h1 className="page-title">Feeds</h1>

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
            disabled={isLoading || uniqueTypes.length === 0}
          >
            <option value="All">All Types</option>
            {uniqueTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        <div className="table-responsive">
          <table className="feed-table" role='table'>
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
              {isLoading ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '50px' }}>
                    <div className="loading-spinner"></div>
                    Loading feeds...
                  </td>
                </tr>
              ) : isError ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '50px', color: '#f44336' }}>
                    Failed to load feeds. Please try again.
                  </td>
                </tr>
              ) : currentItems.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '50px' }}>
                    No feeds found.
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
                      <div className="action-buttons">
                        <button className="btn-edit" onClick={() => handleEdit(feed)}>Edit</button>
                        <button className="btn-delete" onClick={() => handleDelete(feed._id)}>Delete</button>
                      </div>
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

      {/* Delete Confirmation Modal */}
      {deleteFeedId && (
        <div className="modal-overlay" onClick={() => setDeleteFeedId(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Are you sure you want to delete?</h3>
            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setDeleteFeedId(null)}>Cancel</button>
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
    </div>
  );
};

export default ViewFeed;