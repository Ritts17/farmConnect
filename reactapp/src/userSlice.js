import { createSlice } from "@reduxjs/toolkit";

// Helper functions to get cookies
const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return decodeURIComponent(parts.pop().split(';').shift());
  return null;
};

// Helper to get token from sessionStorage
const getToken = () => {
  try {
    return sessionStorage.getItem('token');
  } catch (e) {
    return null;
  }
};

const userSlice = createSlice({
  name: 'user',
  initialState: {
    userId: getCookie('userId') || null,
    userName: getCookie('userName') || null,
    userRole: getCookie('userRole') || null,
    isAuthenticated: !!getToken(),
  },
  reducers: {
    setUserInfo: (state, action) => {
      state.userId = action.payload.userId;
      state.userName = action.payload.userName;
      state.userRole = action.payload.userRole;
      state.isAuthenticated = true;
      
      // Store in cookies
      document.cookie = `userId=${action.payload.userId}; path=/; max-age=86400; SameSite=Strict`;
      document.cookie = `userName=${action.payload.userName}; path=/; max-age=86400; SameSite=Strict`;
      document.cookie = `userRole=${action.payload.userRole}; path=/; max-age=86400; SameSite=Strict`;
    },
    clearUserInfo: (state) => {
      state.userId = null;
      state.userName = null;
      state.userRole = null;
      state.isAuthenticated = false;
      
      // Clear cookies
      document.cookie = 'userId=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      document.cookie = 'userName=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      document.cookie = 'userRole=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      
      // Clear sessionStorage
      try {
        sessionStorage.removeItem('token');
      } catch (e) {
        console.error('Error clearing sessionStorage:', e);
      }
    },
  },
});
export const { setUserInfo, clearUserInfo } = userSlice.actions;
export default userSlice.reducer;