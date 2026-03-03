import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { 
  Search, 
  Filter, 
  Plus, 
  Edit, 
  Trash2, 
  Eye,
  Package,
  DollarSign,
  AlertCircle,
  Lock
} from 'lucide-react';
import { useInventory } from '../contexts/InventoryContext';
import { useAuth } from '../contexts/AuthContext';

const InventoryList = () => {
  const { items, searchItems, filterByCategory, getCategories, deleteItem } = useInventory();
  const { currentUser } = useAuth();
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all');
  const [filteredItems, setFilteredItems] = useState(items);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const categories = ['all', ...getCategories()];
  const isAdmin = currentUser?.role === 'admin';

  useEffect(() => {
    let result = items;
    
    if (searchQuery) {
      result = searchItems(searchQuery);
    }
    
    if (selectedCategory !== 'all') {
      result = result.filter(item => item.category === selectedCategory);
    }
    
    setFilteredItems(result);
  }, [searchQuery, selectedCategory, items, searchItems]);

  const handleDelete = async (id) => {
    const result = await deleteItem(id);
    if (result.success) {
      setShowDeleteConfirm(null);
    }
  };

  const getStatusBadge = (item) => {
    if (item.quantity === 0) {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
          <AlertCircle className="w-3 h-3 mr-1" />
          Out of Stock
        </span>
      );
    } else if (item.quantity <= 5) {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          <AlertCircle className="w-3 h-3 mr-1" />
          Low Stock
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
          In Stock
        </span>
      );
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-secondary-900">Inventory</h1>
            <p className="text-secondary-600 mt-2">Manage your inventory items</p>
          </div>
          {isAdmin && (
            <Link
              to="/inventory/add"
              className="btn btn-primary mt-4 sm:mt-0 flex items-center justify-center"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add New Item
            </Link>
          )}
        </div>
      </div>

      {/* Search and Filter */}
      <div className="card p-6 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by name, SKU, or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-field pl-10"
              />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-secondary-600" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="input-field"
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category === 'all' ? 'All Categories' : category}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Items Grid */}
      {filteredItems.length === 0 ? (
        <div className="card p-12 text-center">
          <Package className="w-16 h-16 text-secondary-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-secondary-900 mb-2">No items found</h3>
          <p className="text-secondary-600 mb-6">
            {searchQuery || selectedCategory !== 'all' 
              ? 'Try adjusting your search or filter criteria' 
              : 'Get started by adding your first inventory item'}
          </p>
          {!searchQuery && selectedCategory === 'all' && isAdmin && (
                <Link to="/inventory/add" className="btn btn-primary">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your First Item
                </Link>
              )}
              {!searchQuery && selectedCategory === 'all' && !isAdmin && (
                <div className="text-center">
                  <Lock className="w-16 h-16 text-secondary-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-secondary-900 mb-2">Admin Access Required</h3>
                  <p className="text-secondary-600">Only administrators can add new items.</p>
                </div>
              )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <div key={item.id} className="card hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="relative">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute top-2 right-2">
                  {getStatusBadge(item)}
                </div>
              </div>
              
              <div className="p-6">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-secondary-900 mb-1">{item.name}</h3>
                    <p className="text-sm text-secondary-500">SKU: {item.sku}</p>
                  </div>
                </div>
                
                <p className="text-sm text-secondary-600 mb-4 line-clamp-2">{item.description}</p>
                
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm text-secondary-500">Category</p>
                    <p className="font-medium text-secondary-900">{item.category}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-secondary-500">Price</p>
                    <p className="font-semibold text-primary-600">${item.price}</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm text-secondary-500">Quantity</p>
                    <p className="font-medium text-secondary-900">{item.quantity} units</p>
                  </div>
                  <div>
                    <p className="text-sm text-secondary-500">Total Value</p>
                    <p className="font-medium text-secondary-900">${(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <Link
                    to={`/inventory/${item.id}`}
                    className="flex-1 btn btn-secondary flex items-center justify-center"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View
                  </Link>
                  {isAdmin && (
                    <>
                      <Link
                        to={`/inventory/edit/${item.id}`}
                        className="flex-1 btn btn-primary flex items-center justify-center"
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </Link>
                      <button
                        onClick={() => setShowDeleteConfirm(item.id)}
                        className="btn btn-danger px-3"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-semibold text-secondary-900 mb-4">Confirm Delete</h3>
            <p className="text-secondary-600 mb-6">
              Are you sure you want to delete this item? This action cannot be undone.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="flex-1 btn btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(showDeleteConfirm)}
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

export default InventoryList;
