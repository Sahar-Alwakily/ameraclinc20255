import React, { useState } from 'react';
import { Route, Routes, Navigate, useLocation } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Admin/Dashboard';
import Login from './pages/Login';

import AllAppointments from './pages/Admin/AllAppointments';
import AddProduct from './pages/Admin/AddProduct';
import ProductList from './pages/Admin/ProductList';
import EditProductModal from './pages/Admin/EditProductModal';
import AddBlog from './pages/Admin/AddBlog';
import BlogList from './pages/Admin/BlogList';
import AdminOrders from './pages/Admin/AdminOrders';
import AddService from './pages/Admin/AddService';
import ServiceList from './pages/Admin/ServiceList';
import EditBlogModal from './pages/Admin/EditBlogModal';
import DoctorQuestions from './pages/Admin/DoctorQuestions';

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const location = useLocation();

  const ProtectedRoute = ({ children }) => {
    return isAuthenticated ? (
      children
    ) : (
      <Navigate to="/login" state={{ from: location }} replace />
    );
  };

  return (
    <div className='bg-[#F8F9FD] min-h-screen' dir="rtl">
      <ToastContainer
        position="top-left"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
        style={{ width: "400px" }}
      />

      {isAuthenticated && <Navbar />}
      <div className='flex flex-col md:flex-row items-start pt-16'>
        {isAuthenticated && <Sidebar />}

        <div className="flex-1 w-full md:mr-64 transition-all duration-300">
          <Routes>
            <Route
              path="/login"
              element={
                !isAuthenticated ? (
                  <Login setIsAuthenticated={setIsAuthenticated} />
                ) : (
                  <Navigate to="/admin-dashboard" replace />
                )
              }
            />
            <Route
              path="/"
              element={
                !isAuthenticated ? (
                  <Login setIsAuthenticated={setIsAuthenticated} />
                ) : (
                  <Navigate to="/admin-dashboard" replace />
                )
              }
            />
            <Route
              path="/admin-dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/DoctorQuestions"
              element={
                <ProtectedRoute>
                  <DoctorQuestions />
                </ProtectedRoute>
              }
            />
            <Route
              path="/all-appointments"
              element={
                <ProtectedRoute>
                  <AllAppointments />
                </ProtectedRoute>
              }
            />
            <Route
              path="/AddProduct"
              element={
                <ProtectedRoute>
                  <AddProduct />
                </ProtectedRoute>
              }
            />
            <Route
              path="/ProductList"
              element={
                <ProtectedRoute>
                  <ProductList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/EditProductModal"
              element={
                <ProtectedRoute>
                  <EditProductModal />
                </ProtectedRoute>
              }
            />
            <Route
              path="/AddBlog"
              element={
                <ProtectedRoute>
                  <AddBlog />
                </ProtectedRoute>
              }
            />
            <Route
              path="/BlogList"
              element={
                <ProtectedRoute>
                  <BlogList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/Orders"
              element={
                <ProtectedRoute>
                  <AdminOrders />
                </ProtectedRoute>
              }
            />
            <Route
              path="/AddService"
              element={
                <ProtectedRoute>
                  <AddService />
                </ProtectedRoute>
              }
            />
            <Route
              path="/ServiceList"
              element={
                <ProtectedRoute>
                  <ServiceList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/EditBlogModal"
              element={
                <ProtectedRoute>
                  <EditBlogModal />
                </ProtectedRoute>
              }
            />
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default App;
