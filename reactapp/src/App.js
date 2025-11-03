import { Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import PrivateRoute from './Components/PrivateRoute';

// Common Components
import Login from './Components/Login';
import Signup from './Components/Signup';
import HomePage from './Components/HomePage';
import ErrorPage from './Components/ErrorPage';

// Owner Components
import LivestockForm from './OwnerComponents/LivestockForm';
import ViewLivestock from './OwnerComponents/ViewLivestock';
import OwnerViewFeed from './OwnerComponents/OwnerViewFeed';
import OwnerViewMedicine from './OwnerComponents/OwnerViewMedicine';
import MyRequest from './OwnerComponents/MyRequest';
import OwnerFeedback from './OwnerComponents/OwnerFeedback';

// Supplier Components
import AddFeed from './SupplierComponents/AddFeed';
import ViewFeed from './SupplierComponents/ViewFeed';
import ViewRequest from './SupplierComponents/ViewRequest';
import AddMedicine from './SupplierComponents/AddMedicine';
import ViewMedicine from './SupplierComponents/ViewMedicine';
import SupplierFeedback from './SupplierComponents/SupplierFeedback';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Protected Home Route - Both roles */}
        <Route
          path="/home"
          element={
            <PrivateRoute allowedRoles={['Owner', 'Supplier']}>
              <HomePage />
            </PrivateRoute>
          }
        />

        {/* Owner Routes */}
        <Route
          path="/owner/add-livestock"
          element={
            <PrivateRoute allowedRoles={['Owner']}>
              <LivestockForm />
            </PrivateRoute>
          }
        />
        <Route
          path="/owner/edit-livestock/:id"
          element={
            <PrivateRoute allowedRoles={['Owner']}>
              <LivestockForm />
            </PrivateRoute>
          }
        />
        <Route
          path="/owner/view-livestock"
          element={
            <PrivateRoute allowedRoles={['Owner']}>
              <ViewLivestock />
            </PrivateRoute>
          }
        />
        <Route
          path="/owner/view-feeds"
          element={
            <PrivateRoute allowedRoles={['Owner']}>
              <OwnerViewFeed />
            </PrivateRoute>
          }
        />
        <Route
          path="/owner/view-medicines"
          element={
            <PrivateRoute allowedRoles={['Owner']}>
              <OwnerViewMedicine />
            </PrivateRoute>
          }
        />
        <Route
          path="/owner/my-requests"
          element={
            <PrivateRoute allowedRoles={['Owner']}>
              <MyRequest />
            </PrivateRoute>
          }
        />
        <Route
          path="/owner/feedback"
          element={
            <PrivateRoute allowedRoles={['Owner']}>
              <OwnerFeedback />
            </PrivateRoute>
          }
        />

        {/* Supplier Routes */}
        <Route
          path="/supplier/add-feed"
          element={
            <PrivateRoute allowedRoles={['Supplier']}>
              <AddFeed />
            </PrivateRoute>
          }
        />
        <Route
          path="/supplier/view-feeds"
          element={
            <PrivateRoute allowedRoles={['Supplier']}>
              <ViewFeed />
            </PrivateRoute>
          }
        />
        <Route
          path="/supplier/view-requests"
          element={
            <PrivateRoute allowedRoles={['Supplier']}>
              <ViewRequest />
            </PrivateRoute>
          }
        />
        <Route
          path="/supplier/add-medicine"
          element={
            <PrivateRoute allowedRoles={['Supplier']}>
              <AddMedicine />
            </PrivateRoute>
          }
        />
        <Route
          path="/supplier/view-medicines"
          element={
            <PrivateRoute allowedRoles={['Supplier']}>
              <ViewMedicine />
            </PrivateRoute>
          }
        />
        <Route
          path="/supplier/feedback"
          element={
            <PrivateRoute allowedRoles={['Supplier']}>
              <SupplierFeedback />
            </PrivateRoute>
          }
        />

        {/* Error Routes */}
        <Route path="/error" element={<ErrorPage />} />
        <Route path="*" element={<ErrorPage />} />
      </Routes>
    </QueryClientProvider>
  );
}

export default App;