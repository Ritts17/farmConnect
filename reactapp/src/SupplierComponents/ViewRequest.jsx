import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { toast } from 'react-toastify';
import { requestAPI } from '../apiConfig';
import SupplierNavbar from './SupplierNavbar';
import './ViewRequest.css';

const ViewRequest = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [sortConfig, setSortConfig] = useState({ key: 'requestDate', direction: 'desc' });
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

  const { data: requests, isLoading, isError, error } = useQuery({
    queryKey: ['allRequests'],
    queryFn: async () => {
      const response = await requestAPI.getAllRequestsBySupplier();
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
      toast.error('Failed to fetch requests');
    }
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ requestId, status }) => {
      const response = await requestAPI.updateRequestStatus(requestId, status);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['allRequests']);
      toast.success('Request status updated successfully');
    },
    onError: (error) => {
      const errorMessage = error.response?.data?.message || 'Failed to update status';
      toast.error(errorMessage);
    }
  });

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

  const handleStatusChange = (requestId, newStatus) => {
    updateStatusMutation.mutate({ requestId, status: newStatus });
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
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
    <div className="view-request-container">
      <SupplierNavbar />

      <div className="request-content">
        <h1 className="page-title">Requests</h1>

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
                <th>User Name</th>
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
                  <td colSpan="9" style={{ textAlign: 'center', padding: '50px' }}>
                    <div className="loading-spinner"></div>
                    Loading requests...
                  </td>
                </tr>
              ) : isError ? (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', padding: '50px' }}>
                    <div style={{ color: '#f44336' }}>
                      <p>Error loading requests: {error?.message || 'Unknown error'}</p>
                      <button
                        onClick={() => queryClient.invalidateQueries(['allRequests'])}
                        style={{ marginTop: '10px', padding: '8px 16px', cursor: 'pointer' }}
                      >
                        Retry
                      </button>
                    </div>
                  </td>
                </tr>
              ) : currentItems.length === 0 ? (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', padding: '50px' }}>
                    {requestsArray.length === 0 ? 'No requests found.' : 'No requests match your filters.'}
                  </td>
                </tr>
              ) : (
                currentItems.map((request, index) => (
                  <tr key={request._id}>
                    <td>{indexOfFirstItem + index + 1}</td>
                    <td>
                      <span className={`type-badge ${request.itemType?.toLowerCase() || ''}`}>
                        {request.itemType || 'N/A'}
                      </span>
                    </td>
                    <td>{request.itemName}</td>
                    <td>{request.ownerId?.userName || 'N/A'}</td>
                    <td>{request.livestockName || 'N/A'}</td>
                    <td>{request.quantity || 'N/A'}</td>
                    <td>
                      <span className={`status-badge ${request.status?.toLowerCase() || ''}`}>
                        {request.status || 'N/A'}
                      </span>
                    </td>
                    <td>{formatDate(request.requestDate || request.createdAt)}</td>
                    <td>
                      {request.status === 'Pending' && (
                        <div className="action-buttons">
                          <button
                            className="btn-approve"
                            onClick={() => handleStatusChange(request._id, 'Approved')}
                            disabled={updateStatusMutation.isLoading}
                          >
                            Approve
                          </button>
                          <button
                            className="btn-reject"
                            onClick={() => handleStatusChange(request._id, 'Rejected')}
                            disabled={updateStatusMutation.isLoading}
                          >
                            Reject
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {!isLoading && !isError && sortedRequests.length > 0 && totalPages > 1 && (
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
    </div>
  );
};

export default ViewRequest;