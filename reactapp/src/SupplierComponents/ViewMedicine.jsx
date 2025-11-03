// SupplierComponents/ViewMedicine.jsx
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { medicineAPI } from '../apiConfig';
import SupplierNavbar from './SupplierNavbar';
import './ViewMedicine.css';

const ViewMedicine = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteMedicineId, setDeleteMedicineId] = useState(null);
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

  const { data: medicines, isLoading, isError, error } = useQuery({
    queryKey: ['medicines'],
    queryFn: async () => {
      const response = await medicineAPI.getSupplierMedicines();
      return response.data;
    },
    retry: 1,         
    retryDelay: 5000,  
    refetchInterval: 5000, 
    refetchOnWindowFocus: false,
    onSuccess: (data) => {
      console.log('Query successful, data:', data);
    },
    onError: (err) => {
      console.error('Query error:', err);
      toast.error('Failed to fetch medicines');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (medicineId) => {
      const response = await medicineAPI.deleteMedicine(medicineId);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['medicines']);
      toast.success('Medicine deleted successfully');
      setDeleteMedicineId(null);
    },
    onError: (error) => {
      const errorMessage = error.response?.data?.message || 'Failed to delete medicine';
      toast.error(errorMessage);
    }
  });

  const medicinesArray = Array.isArray(medicines) ? medicines : [];

  const filteredMedicines = medicinesArray.filter(medicine => {
    const searchLower = searchTerm.toLowerCase();
    return medicine.medicineName.toLowerCase().includes(searchLower);
  });

  const sortedMedicines = sortData(filteredMedicines, sortConfig.key);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedMedicines.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(sortedMedicines.length / itemsPerPage);

  const handleEdit = (medicine) => {
    navigate('/supplier/add-medicine', { state: { medicine } });
  };

  const handleDelete = (medicineId) => {
    setDeleteMedicineId(medicineId);
  };

  const confirmDelete = () => {
    deleteMutation.mutate(deleteMedicineId);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <div className="view-medicine-container">
      <SupplierNavbar />

      <div className="medicine-content">
        <h1 className="page-title">Medicines</h1>

        <div className="search-section">
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
        </div>

        <div className='table-responsive'>
          <table className="medicine-table" role='table'>
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
                  onClick={() => handleSort('manufacturer')}
                  style={{ cursor: 'pointer', userSelect: 'none' }}
                  title="Click to sort"
                >
                  Manufacturer{renderSortIndicator('manufacturer')}
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
              {isLoading ? (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', padding: '50px' }}>
                    <div className="loading-spinner"></div>
                    Loading medicines...
                  </td>
                </tr>
              ) : isError ? (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', padding: '50px' }}>
                    <div style={{ color: '#f44336' }}>
                      <p>Error loading medicines: {error?.message || 'Unknown error'}</p>
                      <button
                        onClick={() => queryClient.invalidateQueries(['medicines'])}
                        style={{ 
                          marginTop: '10px', 
                          padding: '8px 16px', 
                          cursor: 'pointer',
                          background: '#4caf50',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px'
                        }}
                      >
                        Retry
                      </button>
                    </div>
                  </td>
                </tr>
              ) : currentItems.length === 0 ? (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', padding: '50px' }}>
                    {medicinesArray.length === 0 ? 'No medicines found.' : 'No medicines match your search.'}
                  </td>
                </tr>
              ) : (
                currentItems.map((medicine, index) => (
                  <tr key={medicine._id}>
                    <td>{indexOfFirstItem + index + 1}</td>
                    <td>{medicine.medicineName}</td>
                    <td>{medicine.type}</td>
                    <td>{medicine.dosage}</td>
                    <td>{medicine.unit}</td>
                    <td>₹{medicine.pricePerUnit}</td>
                    <td>{medicine.manufacturer}</td>
                    <td>{formatDate(medicine.expiryDate)}</td>
                    <td>
                      <div className="action-buttons">
                        <button className="btn-edit" onClick={() => handleEdit(medicine)}>Edit</button>
                        <button className="btn-delete" onClick={() => handleDelete(medicine._id)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {!isLoading && !isError && sortedMedicines.length > 0 && totalPages > 1 && (
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
      {deleteMedicineId && (
        <div className="modal-overlay" onClick={() => setDeleteMedicineId(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Are you sure you want to delete?</h3>
            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setDeleteMedicineId(null)}>Cancel</button>
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

export default ViewMedicine;
