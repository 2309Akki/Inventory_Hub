import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { InventoryProvider } from './contexts/InventoryContext';
import PrivateRoute from './components/PrivateRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import InventoryList from './pages/InventoryList';
import AddItem from './pages/AddItem';
import EditItem from './pages/EditItem';
import ItemDetails from './pages/ItemDetails';
import UserManagement from './pages/UserManagement';
import './App.css';

const AdminRoute = ({ children }) => {
  const { currentUser } = useAuth();
  return currentUser?.role === 'admin' ? children : <Navigate to="/dashboard" replace />;
};

function App() {
  return (
    <AuthProvider>
      <InventoryProvider>
        <Router>
          <div className="App">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/" element={
                <PrivateRoute>
                  <Layout />
                </PrivateRoute>
              }>
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="inventory" element={<InventoryList />} />
                <Route path="inventory/add" element={
                  <AdminRoute>
                    <AddItem />
                  </AdminRoute>
                } />
                <Route path="inventory/edit/:id" element={
                  <AdminRoute>
                    <EditItem />
                  </AdminRoute>
                } />
                <Route path="inventory/:id" element={<ItemDetails />} />
                <Route path="users" element={
                  <PrivateRoute requiredRole="admin">
                    <UserManagement />
                  </PrivateRoute>
                } />
              </Route>
            </Routes>
          </div>
        </Router>
      </InventoryProvider>
    </AuthProvider>
  );
}

export default App;
