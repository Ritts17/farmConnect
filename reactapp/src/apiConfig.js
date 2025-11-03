import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';
const BASE_URL = 'http://localhost:8080';

// Helper function to get full image URL
export const getImageUrl = (imagePath) => {
  if (!imagePath) return '';
  if (imagePath.startsWith('http')) return imagePath;
  return `${BASE_URL}${imagePath}`;
};

// Helper to get cookie
const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    const cookieValue = parts.pop().split(';').shift();
    // Decode the value when retrieving
    return decodeURIComponent(cookieValue);
  }
  return null;
};

// Helper to set cookie
const setCookie = (name, value, days = 1) => {
  const maxAge = days * 24 * 60 * 60; // Convert days to seconds
  
  // For token, use sessionStorage instead of cookies due to size limits
  if (name === 'token') {
    try {
      sessionStorage.setItem('token', value);
      console.log(`🍪 Set token in sessionStorage`);
      return;
    } catch (e) {
      console.error(`❌ Failed to set token in sessionStorage:`, e);
      return;
    }
  }
  
  // For other values, use cookies
  const encodedValue = encodeURIComponent(value);
  document.cookie = `${name}=${encodedValue}; path=/; max-age=${maxAge}; SameSite=Strict`;
  console.log(`🍪 Set cookie: ${name}=${value.substring(0, 50)}...`);
  
  // Immediately verify it was set
  const wasSet = getCookie(name);
  if (!wasSet) {
    console.error(`❌ Failed to set cookie: ${name}`);
  } else {
    console.log(`✅ Cookie verified: ${name}`);
  }
};

const api = typeof axios.create === 'function' 
  ? axios.create({
      baseURL: API_BASE_URL,
      withCredentials: true,
    })
  : axios;

// Request interceptor
if (api.interceptors) {
  api.interceptors.request.use(
    (config) => {
      const token = getCookie('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Response interceptor
  api.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        const errorMessage = error.response?.data?.message || '';
        
        if (
          errorMessage.toLowerCase().includes('token') ||
          errorMessage.toLowerCase().includes('expired') ||
          errorMessage.toLowerCase().includes('invalid')
        ) {
          // Clear cookies
          document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
          document.cookie = 'userId=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
          document.cookie = 'userName=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
          document.cookie = 'userRole=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
          
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
        }
      }
      return Promise.reject(error);
    }
  );
}

// ==================== USER APIs ====================
export const userAPI = {
  signup: (userData) => api.post('/users/signup', userData),
  
  login: async (credentials) => {
    console.log('🔵 API: Making login request...');
    const response = await api.post('/users/login', credentials);
    
    console.log('🔵 API: Login response received:', response.data);
    
    if (response.data) {
      const { token, userId, userName, role } = response.data;
      
      console.log('🔵 API: Extracted from response:', { token, userId, userName, role });
      
      // ALWAYS set cookies even if token seems missing
      // The backend sets an HttpOnly cookie, but we also need a client-accessible one
      console.log('🟢 API: Setting cookies...');
      
      if (token) {
        setCookie('token', token, 1);
      }
      
      if (userId) setCookie('userId', userId, 1);
      if (userName) setCookie('userName', userName, 1);
      if (role) setCookie('userRole', role, 1);
      
      // Verify cookies were set
      console.log('🟢 API: Verifying cookies...');
      console.log('Token cookie:', getCookie('token') ? '✅ EXISTS' : '❌ MISSING');
      console.log('UserId cookie:', getCookie('userId') ? '✅ EXISTS' : '❌ MISSING');
      console.log('UserRole cookie:', getCookie('userRole') ? '✅ EXISTS' : '❌ MISSING');
      console.log('All cookies:', document.cookie);
    }
    
    return response;
  },
  
  logout: async () => {
    try {
      await api.post('/users/logout');
    } catch (error) {
      console.error('Logout API error:', error);
    } finally {
      // Clear all cookies
      document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      document.cookie = 'userId=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      document.cookie = 'userName=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      document.cookie = 'userRole=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    }
  },
  
  getCurrentUser: () => {
    return {
      userId: getCookie('userId'),
      userName: getCookie('userName'),
      userRole: getCookie('userRole'),
      token: getCookie('token')
    };
  }
};

// ==================== FEED APIs ====================
export const feedAPI = {
  getAllFeeds: () => api.get('/feed/getAllFeeds'),
  getSupplierFeeds: () => api.get('/feed/supplier/my-feeds'),
  getFeedById: (id) => api.get(`/feed/getFeedById/${id}`),
  addFeed: (feedData) => api.post('/feed/addFeed', feedData),
  updateFeed: (id, feedData) => api.put(`/feed/updateFeed/${id}`, feedData),
  deleteFeed: (id) => api.delete(`/feed/deleteFeed/${id}`),
};

// ==================== MEDICINE APIs ====================
export const medicineAPI = {
  getAllMedicines: () => api.get('/medicine/getAllMedicines'),
  getSupplierMedicines: () => api.get('/medicine/supplier/my-medicines'),
  getMedicineById: (id) => api.get(`/medicine/getMedicineById/${id}`),
  addMedicine: (medicineData) => api.post('/medicine/addMedicine', medicineData),
  updateMedicine: (id, medicineData) => api.put(`/medicine/updateMedicine/${id}`, medicineData),
  deleteMedicine: (id) => api.delete(`/medicine/deleteMedicine/${id}`),
};

// ==================== LIVESTOCK APIs ====================
export const livestockAPI = {
  getAllLivestock: () => api.get('/livestock/getAllLivestock'),
  getLivestockByOwnerId: () => api.get('/livestock/owner/all'),
  getLivestockById: (id) => api.get(`/livestock/getLivestockById/${id}`),
  addLivestock: (livestockData) => api.post('/livestock/addLivestock', livestockData),
  updateLivestock: (id, livestockData) => api.put(`/livestock/updateLivestock/${id}`, livestockData),
  deleteLivestock: (id) => api.delete(`/livestock/deleteLivestock/${id}`),
};

// ==================== REQUEST APIs ====================
export const requestAPI = {
  getAllRequestsBySupplier: () => api.get('/request/supplier/all'),
  getRequestsByOwnerId: () => api.get('/request/owner/all'),
  addRequest: (requestData) => api.post('/request/addRequest', requestData),
  updateRequestStatus: (id, status) => api.put(`/request/updateRequestStatus/${id}`, { status }),
  deleteRequest: (id) => api.delete(`/request/deleteRequest/${id}`),
};

// ==================== FEEDBACK APIs ====================
export const feedbackAPI = {
  getAllFeedbacksBySupplier: () => api.get('/feedback/supplier/all'),
  getFeedbacksByOwnerId: () => api.get('/feedback/owner/all'),
  addFeedback: (feedbackData) => api.post('/feedback/addFeed back', feedbackData),
  deleteFeedback: (id) => api.delete(`/feedback/deleteFeedback/${id}`),
};

export default api;