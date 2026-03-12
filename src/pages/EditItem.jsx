import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  Save, 
  X, 
  Upload, 
  Package,
  DollarSign,
  Hash,
  Tag,
  FileText,
  CheckCircle
} from 'lucide-react';
import { useInventory } from '../contexts/InventoryContext';

const EditItem = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { getItem, updateItem, getCategories } = useInventory();
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    quantity: '',
    price: '',
    category: '',
    description: '',
    image: '',
    availability: true
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const categories = getCategories();

  useEffect(() => {
    const item = getItem(id);
    if (item) {
      setFormData({
        name: item.name,
        sku: item.sku,
        quantity: item.quantity.toString(),
        price: item.price.toString(),
        category: item.category,
        description: item.description,
        image: item.image || '',
        availability: item.availability
      });
    } else {
      setNotFound(true);
    }
    setLoading(false);
  }, [id, getItem]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) newErrors.name = 'Item name is required';
    if (!formData.sku.trim()) newErrors.sku = 'SKU is required';
    if (!formData.quantity || formData.quantity < 0) newErrors.quantity = 'Valid quantity is required';
    if (!formData.price || formData.price <= 0) newErrors.price = 'Valid price is required';
    if (!formData.category) newErrors.category = 'Category is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    const itemData = {
      ...formData,
      quantity: parseInt(formData.quantity),
      price: parseFloat(formData.price)
    };
    
    const result = await updateItem(id, itemData);
    
    if (result.success) {
      setSuccess(true);
      setTimeout(() => {
        navigate('/inventory');
      }, 2000);
    }
    
    setIsSubmitting(false);
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
          <p className="text-secondary-600 mb-6">The item you're trying to edit doesn't exist.</p>
          <button
            onClick={() => navigate('/inventory')}
            className="btn btn-primary"
          >
            Back to Inventory
          </button>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-96 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-secondary-900 mb-2">Item Updated Successfully!</h2>
          <p className="text-secondary-600">Redirecting to inventory...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-secondary-900">Edit Item</h1>
        <p className="text-secondary-600 mt-2">Update item information</p>
      </div>

      <div className="max-w-2xl mx-auto">
        <div className="card">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Basic Information */}
            <div>
              <h3 className="text-lg font-semibold text-secondary-900 mb-4 flex items-center">
                <Package className="w-5 h-5 mr-2" />
                Basic Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-secondary-700 mb-2">
                    Item Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={`input-field ${errors.name ? 'border-red-500' : ''}`}
                    placeholder="Enter item name"
                  />
                  {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                </div>
                
                <div>
                  <label htmlFor="sku" className="block text-sm font-medium text-secondary-700 mb-2">
                    SKU *
                  </label>
                  <div className="relative">
                    <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400 w-4 h-4" />
                    <input
                      type="text"
                      id="sku"
                      name="sku"
                      value={formData.sku}
                      onChange={handleInputChange}
                      className={`input-field pl-10 ${errors.sku ? 'border-red-500' : ''}`}
                      placeholder="Enter SKU"
                    />
                  </div>
                  {errors.sku && <p className="text-red-500 text-sm mt-1">{errors.sku}</p>}
                </div>
              </div>
            </div>

            {/* Inventory Details */}
            <div>
              <h3 className="text-lg font-semibold text-secondary-900 mb-4 flex items-center">
                <Tag className="w-5 h-5 mr-2" />
                Inventory Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="quantity" className="block text-sm font-medium text-secondary-700 mb-2">
                    Quantity *
                  </label>
                  <input
                    type="number"
                    id="quantity"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleInputChange}
                    min="0"
                    className={`input-field ${errors.quantity ? 'border-red-500' : ''}`}
                    placeholder="0"
                  />
                  {errors.quantity && <p className="text-red-500 text-sm mt-1">{errors.quantity}</p>}
                </div>
                
                <div>
                  <label htmlFor="price" className="block text-sm font-medium text-secondary-700 mb-2">
                    Price ($) *
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400 w-4 h-4" />
                    <input
                      type="number"
                      id="price"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      min="0"
                      step="0.01"
                      className={`input-field pl-10 ${errors.price ? 'border-red-500' : ''}`}
                      placeholder="0.00"
                    />
                  </div>
                  {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price}</p>}
                </div>
                
                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-secondary-700 mb-2">
                    Category *
                  </label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className={`input-field ${errors.category ? 'border-red-500' : ''}`}
                  >
                    <option value="">Select category</option>
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                    <option value="new">+ Add New Category</option>
                  </select>
                  {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category}</p>}
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <h3 className="text-lg font-semibold text-secondary-900 mb-4 flex items-center">
                <FileText className="w-5 h-5 mr-2" />
                Description
              </h3>
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-secondary-700 mb-2">
                  Item Description *
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  className={`input-field ${errors.description ? 'border-red-500' : ''}`}
                  placeholder="Enter detailed description of the item"
                />
                {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
              </div>
            </div>

            {/* Image */}
            <div>
              <h3 className="text-lg font-semibold text-secondary-900 mb-4 flex items-center">
                <Upload className="w-5 h-5 mr-2" />
                Image URL
              </h3>
              <div>
                <label htmlFor="image" className="block text-sm font-medium text-secondary-700 mb-2">
                  Image URL
                </label>
                <input
                  type="url"
                  id="image"
                  name="image"
                  value={formData.image}
                  onChange={handleInputChange}
                  className="input-field"
                  placeholder="https://example.com/image.jpg"
                />
                <p className="text-sm text-secondary-500 mt-1">
                  Enter a URL for the item image. Leave empty for a placeholder image.
                </p>
              </div>
            </div>

            {/* Availability */}
            <div>
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  name="availability"
                  checked={formData.availability}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-primary-600 border-secondary-300 rounded focus:ring-primary-500"
                />
                <span className="text-sm font-medium text-secondary-700">Item is available for sale</span>
              </label>
            </div>

            {/* Actions */}
            <div className="flex space-x-4 pt-6 border-t border-secondary-200">
              <button
                type="button"
                onClick={() => navigate('/inventory')}
                className="btn btn-secondary flex-1"
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn btn-primary flex-1 flex items-center justify-center"
              >
                <Save className="w-4 h-4 mr-2" />
                {isSubmitting ? 'Updating...' : 'Update Item'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditItem;
