import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  Package,
  DollarSign,
  Hash,
  Tag,
  FileText,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Calendar,
  User,
  Lock
} from 'lucide-react';
import { useInventory } from '../contexts/InventoryContext';
import { useAuth } from '../contexts/AuthContext';

const ItemDetails = () => {
  const { id } = useParams();
  const { getItem, deleteItem } = useInventory();
  const { currentUser } = useAuth();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const isAdmin = currentUser?.role === 'admin';

  useEffect(() => {
    const itemData = getItem(id);
    if (itemData) {
      setItem(itemData);
    } else {
      setNotFound(true);
    }
    setLoading(false);
  }, [id, getItem]);

  const handleDelete = async () => {
    if (!isAdmin) {
      alert('Only administrators can delete items');
      return;
    }
    
    if (window.confirm('Are you sure you want to delete this item?')) {
      const result = await deleteItem(id);
      if (result.success) {
        window.location.href = '/inventory';
      }
    }
  };

  const getStatusBadge = (item) => {
    if (item.quantity === 0) {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
          <XCircle className="w-4 h-4 mr-2" />
          Out of Stock
        </span>
      );
    } else if (item.quantity <= 5) {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
          <AlertTriangle className="w-4 h-4 mr-2" />
          Low Stock
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
          <CheckCircle className="w-4 h-4 mr-2" />
          In Stock
        </span>
      );
    }
  };

  if (loading) {
    return (
      <div className="min-h-96 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-secondary-600">Loading item details...</p>
        </div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-96 flex items-center justify-center">
        <div className="text-center">
          <Package className="w-16 h-16 text-secondary-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-secondary-900 mb-2">Item Not Found</h2>
          <p className="text-secondary-600 mb-6">The item you're looking for doesn't exist.</p>
          <Link to="/inventory" className="btn btn-primary">
            Back to Inventory
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link
              to="/inventory"
              className="p-2 rounded-lg hover:bg-secondary-100 transition-colors duration-200"
            >
              <ArrowLeft className="w-5 h-5 text-secondary-600" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-secondary-900">{item.name}</h1>
              <p className="text-secondary-600 mt-1">Item Details</p>
            </div>
          </div>
          <div className="flex space-x-3">
            {isAdmin && (
              <>
                <Link
                  to={`/inventory/edit/${item.id}`}
                  className="btn btn-primary flex items-center"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Link>
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="btn btn-danger flex items-center"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Image Card */}
          <div className="card">
            <div className="relative">
              <img
                src={item.image || 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800'}
                alt={item.name}
                className="w-full h-96 object-cover rounded-t-xl"
              />
              <div className="absolute top-4 right-4">
                {getStatusBadge(item)}
              </div>
            </div>
          </div>

          {/* Description Card */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-secondary-900 mb-4 flex items-center">
              <FileText className="w-5 h-5 mr-2" />
              Description
            </h3>
            <p className="text-secondary-600 leading-relaxed">{item.description}</p>
          </div>

          {/* Additional Information */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-secondary-900 mb-4">Additional Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-secondary-50 rounded-lg">
                <p className="text-sm text-secondary-500 mb-1">Availability</p>
                <p className="font-medium text-secondary-900">
                  {item.availability ? 'Available for Sale' : 'Not Available'}
                </p>
              </div>
              <div className="p-4 bg-secondary-50 rounded-lg">
                <p className="text-sm text-secondary-500 mb-1">Total Value</p>
                <p className="font-medium text-secondary-900">
                  ${(item.price * item.quantity).toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Info Card */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-secondary-900 mb-4">Quick Info</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center text-secondary-600">
                  <Hash className="w-4 h-4 mr-2" />
                  <span className="text-sm">SKU</span>
                </div>
                <span className="font-medium text-secondary-900">{item.sku}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center text-secondary-600">
                  <Package className="w-4 h-4 mr-2" />
                  <span className="text-sm">Quantity</span>
                </div>
                <span className="font-medium text-secondary-900">{item.quantity} units</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center text-secondary-600">
                  <DollarSign className="w-4 h-4 mr-2" />
                  <span className="text-sm">Price</span>
                </div>
                <span className="font-medium text-secondary-900">${item.price}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center text-secondary-600">
                  <Tag className="w-4 h-4 mr-2" />
                  <span className="text-sm">Category</span>
                </div>
                <span className="font-medium text-secondary-900">{item.category}</span>
              </div>
            </div>
          </div>

          {/* Status Card */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-secondary-900 mb-4">Stock Status</h3>
            <div className="text-center">
              {getStatusBadge(item)}
              <div className="mt-4">
                <p className="text-2xl font-bold text-secondary-900">{item.quantity}</p>
                <p className="text-sm text-secondary-600">units available</p>
              </div>
              {item.quantity <= 5 && item.quantity > 0 && (
                <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    ⚠️ Low stock alert. Consider restocking soon.
                  </p>
                </div>
              )}
              {item.quantity === 0 && (
                <div className="mt-4 p-3 bg-red-50 rounded-lg">
                  <p className="text-sm text-red-800">
                    🚨 Out of stock. Restock immediately.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Timestamps */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-secondary-900 mb-4">Timestamps</h3>
            <div className="space-y-3">
              <div className="flex items-start">
                <Calendar className="w-4 h-4 text-secondary-400 mr-2 mt-0.5" />
                <div>
                  <p className="text-sm text-secondary-500">Created</p>
                  <p className="text-sm text-secondary-900">
                    {new Date(item.createdAt).toLocaleDateString()} at {new Date(item.createdAt).toLocaleTimeString()}
                  </p>
                </div>
              </div>
              <div className="flex items-start">
                <Calendar className="w-4 h-4 text-secondary-400 mr-2 mt-0.5" />
                <div>
                  <p className="text-sm text-secondary-500">Last Updated</p>
                  <p className="text-sm text-secondary-900">
                    {new Date(item.updatedAt).toLocaleDateString()} at {new Date(item.updatedAt).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-semibold text-secondary-900 mb-4">Confirm Delete</h3>
            <p className="text-secondary-600 mb-6">
              Are you sure you want to delete "{item.name}"? This action cannot be undone.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 btn btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 btn btn-danger"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ItemDetails;
