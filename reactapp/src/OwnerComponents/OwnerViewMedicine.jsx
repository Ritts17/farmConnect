import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { toast } from 'react-toastify';
import { medicineAPI, livestockAPI, requestAPI } from '../apiConfig';
import OwnerNavbar from './OwnerNavbar';
import './OwnerViewMedicine.css';

const OwnerViewMedicine = () => {
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

      if (key === 'expiryDate') {
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

  const { data: medicines, isLoading: medicinesLoading } = useQuery({
    queryKey: ['medicines'],
    queryFn: async () => {
      const response = await medicineAPI.getAllMedicines();
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

  const medicinesArray = Array.isArray(medicines) ? medicines : [];
  const livestockArray = Array.isArray(livestock) ? livestock : [];

  const uniqueTypes = React.useMemo(() => {
    const types = [...new Set(medicinesArray.map(medicine => medicine.type).filter(Boolean))];
    return types.sort();
  }, [medicinesArray]);

  const filteredMedicines = medicinesArray.filter(medicine => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = medicine.medicineName.toLowerCase().includes(searchLower);
    const matchesType = typeFilter === 'All' || medicine.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const sortedMedicines = sortData(filteredMedicines, sortConfig.key);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedMedicines.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(sortedMedicines.length / itemsPerPage);

  const handleRequestClick = (medicine) => {
    setShowRequestModal(medicine);
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
      itemType: 'Medicine',
      itemId: showRequestModal._id,
      itemName : showRequestModal.medicineName,
      livestockName: selectedLivestock,
      quantity: Number(quantity)
    };

    requestMutation.mutate(requestData);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <div className="owner-medicine-container">
      <OwnerNavbar />

      <div className="medicine-content">
        <h1 className="page-title">Available Medicines</h1>

        <div className="filters-search-section">
          <input
            type="text"
            placeholder="Search by Medicine Name"
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
            disabled={medicinesLoading || uniqueTypes.length === 0}
          >
            <option value="All">All Types</option>
            {uniqueTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        <div className="table-responsive">
          <table className="medicine-table">
            <thead>
              <tr>
                <th>SNo</th>
                <th
                  onClick={() => handleSort('medicineName')}
                  style={{ cursor: 'pointer', userSelect: 'none' }}
                  title="Click to sort"
                >
                  Medicine Name{renderSortIndicator('medicineName')}
                </th>
                <th
                  onClick={() => handleSort('type')}
                  style={{ cursor: 'pointer', userSelect: 'none' }}
                  title="Click to sort"
                >
                  Type{renderSortIndicator('type')}
                </th>
                <th>Dosage</th>
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
                <th
                  onClick={() => handleSort('expiryDate')}
                  style={{ cursor: 'pointer', userSelect: 'none' }}
                  title="Click to sort"
                >
                  Expiry Date{renderSortIndicator('expiryDate')}
                </th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {medicinesLoading ? (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', padding: '50px' }}>
                    <div className="loading-spinner"></div>
                    Loading medicines...
                  </td>
                </tr>
              ) : currentItems.length === 0 ? (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', padding: '50px' }}>
                    {medicinesArray.length === 0 ? 'No medicines available.' : 'No medicines match your filters.'}
                  </td>
                </tr>
              ) : (
                currentItems.map((medicine, index) => {
                  console.log(medicine);
                  return <tr key={medicine._id}>
                    <td>{indexOfFirstItem + index + 1}</td>
                    <td>{medicine.medicineName}</td>
                    <td>{medicine.type}</td>
                    <td>{medicine.dosage}</td>
                    <td>{medicine.unit}</td>
                    <td>₹{medicine.pricePerUnit}</td>
                    <td>{medicine.availableUnits}</td>
                    <td>{formatDate(medicine.expiryDate)}</td>
                    <td>
                      <button
                        className="btn-request"
                        onClick={() => handleRequestClick(medicine)}
                        disabled={medicine.availableUnits === 0}
                      >
                        {medicine.availableUnits === 0 ? 'Out of Stock' : 'Request'}
                      </button>
                    </td>
                  </tr>
                })
              )}
            </tbody>
          </table>
        </div>

        {!medicinesLoading && totalPages > 1 && (
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
            <h3>Request Medicine</h3>
            <p className="medicine-name">{showRequestModal.medicineName}</p>
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

export default OwnerViewMedicine;