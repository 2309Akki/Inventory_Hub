# Backend Integration Guide

This guide provides complete instructions for implementing a backend for the Inventory Management System.

## 📋 Table of Contents

1. [System Overview](#system-overview)
2. [Data Models](#data-models)
3. [API Endpoints](#api-endpoints)
4. [Authentication](#authentication)
5. [Step-by-Step Implementation](#step-by-step-implementation)
6. [File Modifications](#file-modifications)
7. [Database Schema](#database-schema)
8. [Testing](#testing)

---

## 🎯 System Overview

The Inventory Management System consists of:
- **Authentication System** - User login/logout/registration
- **Inventory Management** - CRUD operations for products
- **Role-based Access** - Admin vs User permissions
- **Data Analytics** - Stats and reporting

---

## 📊 Data Models

### User Model
```javascript
{
  id: string,           // Unique identifier
  username: string,     // Login username
  password: string,     // Hashed password
  name: string,         // Display name
  role: string,         // "admin" or "user"
  createdAt: string,    // ISO timestamp
  updatedAt: string     // ISO timestamp
}
```

### Product Model
```javascript
{
  id: string,           // Unique identifier
  name: string,         // Product name
  sku: string,          // Stock Keeping Unit
  quantity: number,     // Available quantity
  price: number,        // Unit price
  category: string,     // Product category
  description: string,  // Product description
  image: string,        // Image URL (optional)
  availability: boolean, // In stock status
  createdAt: string,    // ISO timestamp
  updatedAt: string     // ISO timestamp
}
```

---

## 🔌 API Endpoints

### Authentication Endpoints

#### POST /api/auth/register
```javascript
// Request Body
{
  username: string,
  password: string,
  name: string,
  role: string (optional, defaults to "user")
}

// Response
{
  success: boolean,
  user: UserObject,
  error?: string
}
```

#### POST /api/auth/login
```javascript
// Request Body
{
  username: string,
  password: string
}

// Response
{
  success: boolean,
  user: UserObject,
  token: string,
  error?: string
}
```

#### POST /api/auth/logout
```javascript
// Headers
Authorization: Bearer <token>

// Response
{
  success: boolean,
  message: string
}
```

#### GET /api/auth/me
```javascript
// Headers
Authorization: Bearer <token>

// Response
{
  success: boolean,
  user: UserObject,
  error?: string
}
```

### Inventory Endpoints

#### GET /api/inventory
```javascript
// Headers
Authorization: Bearer <token>

// Query Parameters (optional)
?search=query&category=name

// Response
{
  success: boolean,
  items: ProductArray,
  error?: string
}
```

#### POST /api/inventory
```javascript
// Headers
Authorization: Bearer <token>
Content-Type: application/json

// Request Body
{
  name: string,
  sku: string,
  quantity: number,
  price: number,
  category: string,
  description: string,
  image: string (optional)
}

// Response
{
  success: boolean,
  item: ProductObject,
  error?: string
}
```

#### GET /api/inventory/:id
```javascript
// Headers
Authorization: Bearer <token>

// Response
{
  success: boolean,
  item: ProductObject,
  error?: string
}
```

#### PUT /api/inventory/:id
```javascript
// Headers
Authorization: Bearer <token>
Content-Type: application/json

// Request Body
{
  name?: string,
  sku?: string,
  quantity?: number,
  price?: number,
  category?: string,
  description?: string,
  image?: string
}

// Response
{
  success: boolean,
  item: ProductObject,
  error?: string
}
```

#### DELETE /api/inventory/:id
```javascript
// Headers
Authorization: Bearer <token>

// Response
{
  success: boolean,
  message: string,
  error?: string
}
```

---

## 🔐 Authentication

### JWT Token Structure
```javascript
{
  userId: string,
  username: string,
  role: string,
  iat: number,
  exp: number
}
```

### Authorization Headers
```
Authorization: Bearer <jwt_token>
```

### Role-based Access
- **Admin**: Full access to all endpoints
- **User**: Read-only access to inventory, no CRUD operations

---

## 🚀 Step-by-Step Implementation

### Step 1: Setup Backend Server

#### Choose Your Technology Stack
- **Node.js + Express** (Recommended)
- **Python + Flask/Django**
- **Java + Spring Boot**
- **PHP + Laravel**

#### Basic Server Setup (Node.js + Express Example)
```bash
mkdir inventory-backend
cd inventory-backend
npm init -y
npm install express mongoose bcryptjs jsonwebtoken cors dotenv
```

### Step 2: Database Setup

#### MongoDB Schema Example
```javascript
// User Schema
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  role: { type: String, enum: ['admin', 'user'], default: 'user' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Product Schema
const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  sku: { type: String, required: true, unique: true },
  quantity: { type: Number, required: true, min: 0 },
  price: { type: Number, required: true, min: 0 },
  category: { type: String, required: true },
  description: { type: String, required: true },
  image: { type: String },
  availability: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});
```

### Step 3: Implement Authentication

#### User Registration
```javascript
// POST /api/auth/register
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, password, name, role } = req.body;
    
    // Check if user exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        error: 'Username already exists' 
      });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create user
    const user = new User({
      username,
      password: hashedPassword,
      name,
      role: role || 'user'
    });
    
    await user.save();
    
    res.status(201).json({
      success: true,
      user: {
        id: user._id,
        username: user.username,
        name: user.name,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});
```

#### User Login
```javascript
// POST /api/auth/login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Find user
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        error: 'Invalid credentials' 
      });
    }
    
    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ 
        success: false, 
        error: 'Invalid credentials' 
      });
    }
    
    // Generate JWT
    const token = jwt.sign(
      { userId: user._id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    res.json({
      success: true,
      user: {
        id: user._id,
        username: user.username,
        name: user.name,
        role: user.role
      },
      token
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});
```

### Step 4: Implement Inventory CRUD

#### Get All Products
```javascript
// GET /api/inventory
app.get('/api/inventory', authenticateToken, async (req, res) => {
  try {
    const { search, category } = req.query;
    let query = {};
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (category && category !== 'all') {
      query.category = category;
    }
    
    const items = await Product.find(query).sort({ createdAt: -1 });
    
    res.json({
      success: true,
      items
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});
```

#### Create Product
```javascript
// POST /api/inventory
app.post('/api/inventory', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const productData = {
      ...req.body,
      id: new mongoose.Types.ObjectId().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    const product = new Product(productData);
    await product.save();
    
    res.status(201).json({
      success: true,
      item: product
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});
```

### Step 5: Middleware Implementation

#### Authentication Middleware
```javascript
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ 
      success: false, 
      error: 'Access token required' 
    });
  }
  
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ 
        success: false, 
        error: 'Invalid token' 
      });
    }
    req.user = user;
    next();
  });
}
```

#### Admin Role Middleware
```javascript
function requireAdmin(req, res, next) {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ 
      success: false, 
      error: 'Admin access required' 
    });
  }
  next();
}
```

---

## 📝 File Modifications

### 1. Update AuthContext.js

**File:** `src/contexts/AuthContext.js`

**Replace the existing functions with:**

```javascript
// Login function
const login = async (username, password) => {
  setLoading(true);
  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    
    const data = await response.json();
    
    if (data.success) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('currentUser', JSON.stringify(data.user));
      setCurrentUser(data.user);
      return { success: true };
    } else {
      return { success: false, error: data.error };
    }
  } catch (error) {
    console.error('Login failed:', error);
    return { success: false, error: error.message };
  } finally {
    setLoading(false);
  }
};

// Logout function
const logout = async () => {
  try {
    const token = localStorage.getItem('token');
    if (token) {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
    }
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
    setCurrentUser(null);
  } catch (error) {
    console.error('Logout failed:', error);
  }
};

// Register function
const register = async (userData) => {
  setLoading(true);
  try {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    
    const data = await response.json();
    
    if (data.success) {
      return { success: true, user: data.user };
    } else {
      return { success: false, error: data.error };
    }
  } catch (error) {
    console.error('Registration failed:', error);
    return { success: false, error: error.message };
  } finally {
    setLoading(false);
  }
};

// Update useEffect to check token
useEffect(() => {
  const token = localStorage.getItem('token');
  const storedUser = localStorage.getItem('currentUser');
  
  if (token && storedUser) {
    // Verify token with backend
    fetch('/api/auth/me', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        setCurrentUser(data.user);
      } else {
        localStorage.removeItem('token');
        localStorage.removeItem('currentUser');
      }
    })
    .catch(() => {
      localStorage.removeItem('token');
      localStorage.removeItem('currentUser');
    });
  }
  setLoading(false);
}, []);
```

### 2. Update InventoryContext.js

**File:** `src/contexts/InventoryContext.js`

**Replace the existing functions with:**

```javascript
// Fetch items
const fetchItems = async () => {
  setLoading(true);
  try {
    const token = localStorage.getItem('token');
    const response = await fetch('/api/inventory', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const data = await response.json();
    
    if (data.success) {
      setItems(data.items);
    } else {
      console.error('Failed to fetch items:', data.error);
    }
  } catch (error) {
    console.error('Failed to fetch items:', error);
  } finally {
    setLoading(false);
  }
};

// Add item
const addItem = async (itemData) => {
  setLoading(true);
  try {
    const token = localStorage.getItem('token');
    const response = await fetch('/api/inventory', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(itemData)
    });
    
    const data = await response.json();
    
    if (data.success) {
      setItems(prev => [...prev, data.item]);
      return { success: true, item: data.item };
    } else {
      return { success: false, error: data.error };
    }
  } catch (error) {
    console.error('Failed to add item:', error);
    return { success: false, error: error.message };
  } finally {
    setLoading(false);
  }
};

// Update item
const updateItem = async (id, itemData) => {
  setLoading(true);
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`/api/inventory/${id}`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(itemData)
    });
    
    const data = await response.json();
    
    if (data.success) {
      setItems(prev => prev.map(item => 
        item.id === id ? data.item : item
      ));
      return { success: true, item: data.item };
    } else {
      return { success: false, error: data.error };
    }
  } catch (error) {
    console.error('Failed to update item:', error);
    return { success: false, error: error.message };
  } finally {
    setLoading(false);
  }
};

// Delete item
const deleteItem = async (id) => {
  setLoading(true);
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`/api/inventory/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const data = await response.json();
    
    if (data.success) {
      setItems(prev => prev.filter(item => item.id !== id));
      return { success: true };
    } else {
      return { success: false, error: data.error };
    }
  } catch (error) {
    console.error('Failed to delete item:', error);
    return { success: false, error: error.message };
  } finally {
    setLoading(false);
  }
};

// Search items
const searchItems = async (query) => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`/api/inventory?search=${query}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const data = await response.json();
    
    if (data.success) {
      return data.items;
    } else {
      console.error('Search failed:', data.error);
      return [];
    }
  } catch (error) {
    console.error('Search failed:', error);
    return [];
  }
};

// Filter by category
const filterByCategory = async (category) => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`/api/inventory?category=${category}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const data = await response.json();
    
    if (data.success) {
      return data.items;
    } else {
      console.error('Filter failed:', data.error);
      return [];
    }
  } catch (error) {
    console.error('Filter failed:', error);
    return [];
  }
};

// Update useEffect to fetch from API
useEffect(() => {
  fetchItems();
}, []);
```

### 3. Update AddItem.js

**File:** `src/pages/AddItem.js`

**Update the handleSubmit function:**

```javascript
const handleSubmit = async (e) => {
  e.preventDefault();
  
  if (!validateForm()) {
    return;
  }

  const result = await addItem(formData);
  if (result.success) {
    setSuccess(true);
    setTimeout(() => {
      navigate('/inventory');
    }, 2000);
  } else {
    setErrors({ submit: result.error || 'Failed to add item' });
  }
};
```

### 4. Environment Variables

**Create:** `.env` file in backend root

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/inventory-management
JWT_SECRET=your-super-secret-jwt-key-here
NODE_ENV=development
```

---

## 🗄️ Database Schema

### MongoDB Collections

#### Users Collection
```javascript
{
  _id: ObjectId,
  username: String (unique),
  password: String (hashed),
  name: String,
  role: String ("admin" | "user"),
  createdAt: Date,
  updatedAt: Date
}
```

#### Products Collection
```javascript
{
  _id: ObjectId,
  name: String,
  sku: String (unique),
  quantity: Number,
  price: Number,
  category: String,
  description: String,
  image: String (optional),
  availability: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### SQL Alternative (PostgreSQL)

#### Users Table
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(100) NOT NULL,
  role VARCHAR(10) DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Products Table
```sql
CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  sku VARCHAR(50) UNIQUE NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 0,
  price DECIMAL(10,2) NOT NULL,
  category VARCHAR(50) NOT NULL,
  description TEXT NOT NULL,
  image VARCHAR(500),
  availability BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 🧪 Testing

### 1. Test Authentication

```bash
# Register admin user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123","name":"Admin User","role":"admin"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

### 2. Test Inventory API

```bash
# Get all products (requires token)
curl -X GET http://localhost:5000/api/inventory \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Add product (admin only)
curl -X POST http://localhost:5000/api/inventory \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"name":"Test Product","sku":"TEST-001","quantity":10,"price":99.99,"category":"Test","description":"Test product"}'
```

---

## 📦 Deployment Considerations

### 1. Environment Setup
- Set production environment variables
- Configure database connection
- Set up CORS for your frontend domain

### 2. Security
- Use HTTPS in production
- Implement rate limiting
- Validate all inputs
- Use environment variables for secrets

### 3. Performance
- Add database indexes
- Implement pagination for large datasets
- Add caching for frequently accessed data

---

## 🔄 Migration Steps

1. **Backup existing data** from localStorage
2. **Set up backend server** with chosen technology
3. **Create database** and tables/collections
4. **Implement authentication** endpoints
5. **Implement inventory** endpoints
6. **Update frontend** files as shown above
7. **Test all functionality**
8. **Migrate existing data** to new database
9. **Deploy to production**

---

## 🚀 Quick Start Checklist

- [ ] Choose backend technology stack
- [ ] Set up database
- [ ] Implement authentication endpoints
- [ ] Implement inventory CRUD endpoints
- [ ] Update AuthContext.js
- [ ] Update InventoryContext.js
- [ ] Update AddItem.js
- [ ] Test all API endpoints
- [ ] Update frontend API calls
- [ ] Deploy and test

---

## 📞 Support

For any issues during implementation:
1. Check API responses in browser dev tools
2. Verify database connections
3. Check CORS configuration
4. Validate JWT tokens
5. Review error logs

This guide provides everything needed to successfully implement a robust backend for your Inventory Management System! 🚀
