import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Package, 
  TrendingUp, 
  AlertCircle, 
  DollarSign,
  PlusCircle,
  ShoppingCart,
  Users,
  Activity,
  Monitor,
  Smartphone,
  Volume2,
  ChevronDown,
  XCircle
} from 'lucide-react';
import { useInventory } from '../contexts/InventoryContext';
import { useAuth } from '../contexts/AuthContext';

const Dashboard = () => {
  const { getStats, items, getCategoryStats, getCategories } = useInventory();
  const { currentUser } = useAuth();
  const stats = getStats();
  const categoryStats = getCategoryStats();
  const categories = getCategories();
  const [selectedCategory, setSelectedCategory] = useState('all');

  const recentItems = items.slice(0, 5);
  const lowStockItems = items.filter(item => item.quantity <= 5 && item.quantity > 0);
  const isAdmin = currentUser?.role === 'ADMIN';

  const filteredCategories = selectedCategory === 'all' 
    ? categoryStats 
    : categoryStats.filter(stat => stat.category === selectedCategory);

  const allItems = selectedCategory === 'all' 
    ? items 
    : items.filter(item => item.category === selectedCategory);

  const CategoryCard = ({ category, icon: Icon, color, stats, isSelected }) => (
    <Link
      to={`/inventory?category=${category}`}
      className={`card p-6 hover:shadow-xl transition-all duration-300 cursor-pointer ${
        isSelected ? 'ring-2 ring-primary-500 bg-primary-50' : ''
      }`}
      onClick={() => setSelectedCategory(category)}
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <ChevronDown className={`w-5 h-5 text-secondary-400 transform transition-transform ${
          isSelected ? 'rotate-180' : ''
        }`} />
      </div>
      <h3 className="text-lg font-semibold text-secondary-900 mb-2">{category}</h3>
      <div className="space-y-1">
        <p className="text-sm text-secondary-600">
          {stats.itemCount} items • {stats.totalQuantity} units
        </p>
        <p className="text-sm font-medium text-primary-600">
          Value: ${stats.totalValue.toFixed(2)}
        </p>
      </div>
    </Link>
  );

  const SingleCategoryGraph = () => {
  const [selectedCategory, setSelectedCategory] = useState('Laptops');
  const categoryItems = selectedCategory === 'All' 
    ? items 
    : items.filter(item => item.category === selectedCategory);
  const categoryItemCount = categoryItems.length;
  const maxQuantity = Math.max(...categoryItems.map(item => item.quantity), 1);
  const getCategoryColor = (category) => {
    switch(category) {
      case 'Laptops': return 'from-blue-500 to-blue-600';
      case 'Phones': return 'from-green-500 to-green-600';
      case 'Speakers': return 'from-purple-500 to-purple-600';
      default: return 'from-primary-500 to-accent-500';
    }
  };

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-secondary-900">Category Inventory</h3>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-4 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
        >
          <option value="All">All Categories</option>
          <option value="Laptops">Laptops</option>
          <option value="Phones">Phones</option>
          <option value="Speakers">Speakers</option>
        </select>
      </div>
      
      <div className="space-y-4">
        {categoryItemCount === 0 ? (
          <div className="text-center py-8">
            <Package className="w-16 h-16 text-secondary-300 mx-auto mb-4" />
            <p className="text-secondary-600">No items found for this category</p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm text-secondary-600">
                {selectedCategory === 'All' 
                  ? `Total: ${items.length} items • ${items.reduce((sum, item) => sum + item.quantity, 0)} units`
                  : `Total: ${categoryItemCount} ${selectedCategory.toLowerCase()} • ${categoryItems.reduce((sum, item) => sum + item.quantity, 0)} units`
                }
              </div>
            </div>
            <div className="overflow-x-auto">
              <div className="min-w-max">
                <div className="flex items-end justify-start h-64 border-l border-b border-secondary-300 pb-2 px-4">
                  {categoryItems.map((item) => {
                    const percentage = (item.quantity / maxQuantity) * 100;
                    const barHeight = Math.max((item.quantity / maxQuantity) * 200, 10);
                    const isLowStock = item.quantity < 10; // Red if quantity is less than 10
                    const barColor = isLowStock 
                      ? 'from-red-500 to-red-600' 
                      : getCategoryColor(selectedCategory === 'All' ? item.category : selectedCategory);
                    return (
                      <div key={item.id} className="flex flex-col items-center space-y-2 flex-shrink-0 mr-4" style={{ minWidth: '120px' }}>
                        <div className="w-full flex flex-col items-center">
                          <div className="relative w-full bg-secondary-200 rounded-lg" style={{ height: '200px' }}>
                            <div
                              className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t ${barColor} rounded-t-lg transition-all duration-500`}
                              style={{ height: `${barHeight}px` }}
                            >
                              {barHeight > 20 && (
                                <span className="absolute top-2 left-1/2 transform -translate-x-1/2 text-xs text-white font-medium">
                                  {item.quantity}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="text-center mt-2 whitespace-nowrap">
                            <span className="text-xs font-medium text-secondary-800 truncate max-w-[120px]" title={item.name}>
                              {item.name.length > 15 ? `${item.name.substring(0, 12)}...` : item.name}
                            </span>
                            <span className="text-sm text-secondary-600">{item.quantity} units</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

const CategoryHistogram = () => {
    const maxQuantity = Math.max(...filteredCategories.map(stat => stat.totalQuantity));
    
    return (
      <div className="card p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-secondary-900">Category Analytics</h3>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white"
          >
            <option value="all">All Categories</option>
            <option value="Laptops">Laptops</option>
            <option value="Phones">Phones</option>
            <option value="Speakers">Speakers</option>
          </select>
        </div>
        
        <div className="space-y-4">
          {filteredCategories.length === 0 ? (
            <div className="text-center py-8">
              <Package className="w-16 h-16 text-secondary-300 mx-auto mb-4" />
              <p className="text-secondary-600">No items found for this category</p>
            </div>
          ) : (
            filteredCategories.map((stat) => {
              const percentage = (stat.totalQuantity / maxQuantity) * 100;
              return (
                <div key={stat.category} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-secondary-700">{stat.category}</span>
                    <span className="text-sm text-secondary-600">{stat.totalQuantity} units</span>
                  </div>
                  <div className="w-full bg-secondary-200 rounded-full h-8 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-primary-500 to-accent-500 rounded-full flex items-center justify-end pr-3 transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    >
                      {percentage > 10 && (
                        <span className="text-xs text-white font-medium">
                          {stat.totalQuantity}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {allItems
                      .filter(item => item.category === stat.category)
                      .slice(0, 5)
                      .map(item => (
                        <span key={item.id} className="inline-block px-2 py-1 bg-primary-100 text-primary-700 text-xs rounded">
                          {item.name}
                        </span>
                      ))}
                    {allItems.filter(item => item.category === stat.category).length > 5 && (
                      <span className="inline-block px-2 py-1 bg-secondary-100 text-secondary-700 text-xs rounded">
                        +{allItems.filter(item => item.category === stat.category).length - 5} more
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    );
  };

  const StatCard = ({ title, value, icon: Icon, color, trend }) => (
    <div className="card p-6 hover:shadow-xl transition-shadow duration-300">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-secondary-600">{title}</p>
          <p className="text-2xl font-bold text-secondary-900 mt-1">{value}</p>
          {trend && (
            <p className={`text-xs mt-2 ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {trend > 0 ? '+' : ''}{trend}% from last month
            </p>
          )}
        </div>
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-secondary-900">Dashboard</h1>
        <p className="text-secondary-600 mt-2">
          Welcome back, {currentUser?.name}! Here's your inventory overview.
        </p>
      </div>

      {/* Stats Cards - Only for Admins */}
      {isAdmin && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Items"
            value={stats.totalItems}
            icon={Package}
            color="text-blue-600"
            trend={12}
          />
          <StatCard
            title="Total Value"
            value={`$${stats.totalValue.toFixed(2)}`}
            icon={DollarSign}
            color="text-green-600"
            trend={8}
          />
          <StatCard
            title="Available Items"
            value={stats.availableItems}
            icon={Package}
            color="text-green-600"
            trend={15}
          />
          <StatCard
            title="Categories"
            value={categories.length}
            icon={Monitor}
            color="text-purple-600"
            trend={0}
          />
        </div>
      )}

      {/* Low Stock Alert - Only for Admins */}
      {isAdmin && (stats.outOfStock > 0 || lowStockItems.length > 0) && (
        <div className="card bg-red-50 border-red-200 p-6 mb-8">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-600 mr-3" />
            <div>
              <h3 className="text-lg font-semibold text-red-800">Low Stock Alert</h3>
              <p className="text-red-600">
                {stats.outOfStock} item{stats.outOfStock !== 1 ? 's' : ''} out of stock. 
                {lowStockItems.length > 0 && ` ${lowStockItems.length} item${lowStockItems.length !== 1 ? 's' : ''} running low.`}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Category Cards */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-secondary-900 mb-4">Product Categories</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <CategoryCard
            category="Laptops"
            icon={Monitor}
            color="bg-blue-500"
            stats={categoryStats.find(stat => stat.category === 'Laptops')}
            isSelected={selectedCategory === 'Laptops'}
          />
          <CategoryCard
            category="Phones"
            icon={Smartphone}
            color="bg-green-500"
            stats={categoryStats.find(stat => stat.category === 'Phones')}
            isSelected={selectedCategory === 'Phones'}
          />
          <CategoryCard
            category="Speakers"
            icon={Volume2}
            color="bg-purple-500"
            stats={categoryStats.find(stat => stat.category === 'Speakers')}
            isSelected={selectedCategory === 'Speakers'}
          />
        </div>
      </div>

      {/* Single Category Graph with Dropdown */}
      <SingleCategoryGraph />

      {/* Recent Items */}
      <div className="card mt-8">
        <div className="p-6 border-b border-secondary-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-secondary-900">Recent Items</h2>
            <Link
              to="/inventory"
              className="text-primary-600 hover:text-primary-700 text-sm font-medium"
            >
              View All
            </Link>
          </div>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {recentItems.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-3 bg-secondary-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-10 h-10 rounded-lg object-cover"
                  />
                  <div>
                    <p className="font-medium text-secondary-900">{item.name}</p>
                    <p className="text-sm text-secondary-500">{item.sku}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-secondary-900">{item.quantity}</p>
                  <p className={`text-sm ${item.availability ? 'text-green-600' : 'text-red-600'}`}>
                    {item.availability ? 'Available' : 'Out of Stock'}
                  </p>
                  <div className="flex space-x-2">
                    <Link
                      to={`/inventory/${item.id}`}
                      className="flex-1 btn btn-secondary flex items-center justify-center"
                    >
                      View
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
