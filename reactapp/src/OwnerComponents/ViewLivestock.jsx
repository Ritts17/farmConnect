import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { livestockAPI, getImageUrl } from '../apiConfig';
import OwnerNavbar from './OwnerNavbar';
import './ViewLivestock.css';

const ViewLivestock = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteLivestockId, setDeleteLivestockId] = useState(null);
  const [showAttachmentModal, setShowAttachmentModal] = useState(null);
  const [speciesFilter, setSpeciesFilter] = useState('All');
  const [healthFilter, setHealthFilter] = useState('All');
  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' });
  const itemsPerPage = 3;

  const { data: livestock, isLoading, isError } = useQuery({
    queryKey: ['myLivestock'],
    queryFn: async () => {
      const response = await livestockAPI.getLivestockByOwnerId();
      return response.data;
    },
    retry: 1,         
    retryDelay: 5000,  
    refetchInterval: 5000, 
    refetchOnWindowFocus: false
  });

  const deleteMutation = useMutation({
    mutationFn: async (livestockId) => {
      const response = await livestockAPI.deleteLivestock(livestockId);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['myLivestock']);
      toast.success('Livestock deleted successfully');
      setDeleteLivestockId(null);
    },
    onError: (error) => {
      const errorMessage = error.response?.data?.message || 'Failed to delete livestock';
      toast.error(errorMessage);
    }
  });

  const livestockArray = Array.isArray(livestock) ? livestock : [];

  // Get unique species and health conditions for filters
  const uniqueSpecies = [...new Set(livestockArray.map(item => item.species))];
  const uniqueHealthConditions = [...new Set(livestockArray.map(item => item.healthCondition))];

  const sortData = (data, key) => {
    if (!key) return data;

    const sorted = [...data].sort((a, b) => {
      let aVal = a[key];
      let bVal = b[key];

      if (key === 'age') {
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

  const filteredLivestock = livestockArray.filter(item => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = 
      item.name.toLowerCase().includes(searchLower) ||
      item.species.toLowerCase().includes(searchLower) ||
      item.breed.toLowerCase().includes(searchLower);
    
    const matchesSpecies = speciesFilter === 'All' || item.species === speciesFilter;
    const matchesHealth = healthFilter === 'All' || item.healthCondition === healthFilter;

    return matchesSearch && matchesSpecies && matchesHealth;
  });

  const sortedLivestock = sortData(filteredLivestock, sortConfig.key);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedLivestock.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(sortedLivestock.length / itemsPerPage);

  const handleEdit = (item) => {
    navigate(`/owner/edit-livestock/${item._id}`, { state: { livestock: item } });
  };

  const handleDelete = (livestockId) => {
    setDeleteLivestockId(livestockId);
  };

  const confirmDelete = () => {
    deleteMutation.mutate(deleteLivestockId);
  };

  if (isError) {
    return (
      <div className="view-livestock-container">
        <OwnerNavbar />
        <div className="livestock-content">
          <h1 className="page-title">My Livestock</h1>
          <div className="error-message">Failed to load livestock. Please try again later.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="view-livestock-container">
      <OwnerNavbar />
      
      <div className="livestock-content">
        <h1 className="page-title">Livestocks</h1>

        <div className="filters-search-section">
          <input
            type="text"
            placeholder="Search by Name, Species, or Breed"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="search-input"
          />

          <select
            value={speciesFilter}
            onChange={(e) => {
              setSpeciesFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="filter-select"
          >
            <option value="All">All Species</option>
            {uniqueSpecies.map(species => (
              <option key={species} value={species}>{species}</option>
            ))}
          </select>

          <select
            value={healthFilter}
            onChange={(e) => {
              setHealthFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="filter-select"
          >
            <option value="All">All Health Conditions</option>
            {uniqueHealthConditions.map(health => (
              <option key={health} value={health}>{health}</option>
            ))}
          </select>
        </div>

        <div className="table-responsive">
          <table className="livestock-table" role="table">
            <thead>
              <tr>
                <th>SNo</th>
                <th
                  onClick={() => handleSort('name')}
                  style={{ cursor: 'pointer', userSelect: 'none' }}
                  title="Click to sort"
                >
                  Name{renderSortIndicator('name')}
                </th>
                <th
                  onClick={() => handleSort('species')}
                  style={{ cursor: 'pointer', userSelect: 'none' }}
                  title="Click to sort"
                >
                  Species{renderSortIndicator('species')}
                </th>
                <th
                  onClick={() => handleSort('age')}
                  style={{ cursor: 'pointer', userSelect: 'none' }}
                  title="Click to sort"
                >
                  Age{renderSortIndicator('age')}
                </th>
                <th>Breed</th>
                <th>Health Condition</th>
                <th>Location</th>
                <th>Vaccination Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', padding: '50px' }}>
                    <div className="loading-spinner"></div>
                    Loading livestock...
                  </td>
                </tr>
              ) : currentItems.length === 0 ? (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', padding: '50px' }}>
                    {livestockArray.length === 0 ? 'No livestock found.' : 'No livestock match your filters.'}
                  </td>
                </tr>
              ) : (
                currentItems.map((item, index) => (
                  <tr key={item._id}>
                    <td>{indexOfFirstItem + index + 1}</td>
                    <td>{item.name}</td>
                    <td>{item.species}</td>
                    <td>{item.age}</td>
                    <td>{item.breed}</td>
                    <td>{item.healthCondition}</td>
                    <td>{item.location}</td>
                    <td>{item.vaccinationStatus}</td>
                    <td>
                      <div className="action-buttons">
                        <button className="btn-edit" onClick={() => handleEdit(item)}>Edit</button>
                        <button className="btn-delete" onClick={() => handleDelete(item._id)}>Delete</button>
                        {item.attachment && (
                          <button className="btn-view" onClick={() => setShowAttachmentModal(item)}>
                            View Attachment
                          </button>
                        )}
                      </div>
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
      {deleteLivestockId && (
        <div className="modal-overlay" onClick={() => setDeleteLivestockId(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Are you sure you want to delete?</h3>
            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setDeleteLivestockId(null)}>Cancel</button>
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

      {/* Attachment Modal */}
      {showAttachmentModal && (
        <div className="modal-overlay" onClick={() => setShowAttachmentModal(null)}>
          <div className="modal-content attachment-modal" onClick={(e) => e.stopPropagation()}>
            <img 
              src={getImageUrl(showAttachmentModal.attachment)} 
              alt={showAttachmentModal.name}
              onError={(e) => {
                e.target.src = 'https://via.placeholder.com/400x300?text=No+Image';
              }}
            />
            <button className="modal-button" onClick={() => setShowAttachmentModal(null)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewLivestock;