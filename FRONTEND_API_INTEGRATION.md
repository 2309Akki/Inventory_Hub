# Frontend API Integration - File by File Guide

This guide shows exactly where to make changes in each frontend file to connect the backend.

---

## 📁 File 1: `src/contexts/AuthContext.js`

### 🎯 Changes Required: Replace ALL localStorage-based functions

#### 🔍 Find these lines (around line 40-100):

```javascript
// REMOVE ALL OF THIS:
useEffect(() => {
  const token = localStorage.getItem('token');
  const storedUser = localStorage.getItem('currentUser');
  if (storedUser) {
    setCurrentUser(JSON.parse(storedUser));
  }
  setLoading(false);
}, []);

const login = (username, password) => {
  const users = JSON.parse(localStorage.getItem('users') || '[]');
  const user = users.find(u => u.username === username && u.password === password);
  
  if (user) {
    setCurrentUser(user);
    localStorage.setItem('currentUser', JSON.stringify(user));
    return { success: true };
  } else {
    return { success: false, error: 'Invalid credentials' };
  }
};

const logout = () => {
  setCurrentUser(null);
  localStorage.removeItem('currentUser');
};

const register = (userData) => {
  const users = JSON.parse(localStorage.getItem('users') || '[]');
  
  if (users.find(u => u.username === userData.username)) {
    return { success: false, error: 'Username already exists' };
  }
  
  const newUser = {
    ...userData,
    id: Date.now().toString(),
    createdAt: new Date().toISOString()
  };
  
  users.push(newUser);
  localStorage.setItem('users', JSON.stringify(users));
  
  return { success: true, user: newUser };
};
```

#### ✅ REPLACE WITH THIS:

```javascript
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
```

---

## 📁 File 2: `src/contexts/InventoryContext.js`

### 🎯 Changes Required: Replace ALL localStorage-based functions

#### 🔍 Find these lines (around line 35-45):

```javascript
// REMOVE THIS useEffect:
useEffect(() => {
  const storedItems = localStorage.getItem('inventoryItems');
  if (storedItems) {
    setItems(JSON.parse(storedItems));
  } else {
    const sampleItems = [
      // ... all the sample items
    ];
    setItems(sampleItems);
    localStorage.setItem('inventoryItems', JSON.stringify(sampleItems));
  }
  setLoading(false);
}, []);
```

#### ✅ REPLACE WITH THIS:

```javascript
useEffect(() => {
  fetchItems();
}, []);

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
```

#### 🔍 Find these lines (around line 700+):

```javascript
// REMOVE ALL THESE FUNCTIONS:
const addItem = (itemData) => {
  const newItem = {
    ...itemData,
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  setItems(prev => [...prev, newItem]);
  localStorage.setItem('inventoryItems', JSON.stringify([...items, newItem]));
  
  return { success: true, item: newItem };
};

const updateItem = (id, itemData) => {
  const updatedItems = items.map(item => 
    item.id === id 
      ? { ...item, ...itemData, updatedAt: new Date().toISOString() }
      : item
  );
  setItems(updatedItems);
  localStorage.setItem('inventoryItems', JSON.stringify(updatedItems));
  
  return { success: true, item: updatedItems.find(item => item.id === id) };
};

const deleteItem = (id) => {
  const updatedItems = items.filter(item => item.id !== id);
  setItems(updatedItems);
  localStorage.setItem('inventoryItems', JSON.stringify(updatedItems));
  
  return { success: true };
};
```

#### ✅ REPLACE WITH THIS:

```javascript
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
```

#### 🔍 Find these lines (around line 750+):

```javascript
// REPLACE THESE FUNCTIONS:
const searchItems = (query) => {
  if (!query) return items;
  
  const lowercaseQuery = query.toLowerCase();
  return items.filter(item => 
    item.name.toLowerCase().includes(lowercaseQuery) ||
    item.sku.toLowerCase().includes(lowercaseQuery) ||
    item.category.toLowerCase().includes(lowercaseQuery) ||
    item.description.toLowerCase().includes(lowercaseQuery)
  );
};

const filterByCategory = (category) => {
  if (!category || category === 'all') return items;
  return items.filter(item => item.category === category);
};
```

#### ✅ REPLACE WITH THIS:

```javascript
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
```

---

## 📁 File 3: `src/pages/AddItem.js`

### 🎯 Changes Required: Make handleSubmit async

#### 🔍 Find these lines (around line 100-120):

```javascript
// FIND THIS FUNCTION:
const handleSubmit = (e) => {
  e.preventDefault();
  
  if (!validateForm()) {
    return;
  }

  const result = addItem(formData);
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

#### ✅ REPLACE WITH THIS:

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

---

## 📁 File 4: `src/pages/EditItem.js`

### 🎯 Changes Required: Make handleSubmit async

#### 🔍 Find these lines (around line 100-120):

```javascript
// FIND THIS FUNCTION:
const handleSubmit = (e) => {
  e.preventDefault();
  
  if (!validateForm()) {
    return;
  }

  const result = updateItem(id, formData);
  if (result.success) {
    setSuccess(true);
    setTimeout(() => {
      navigate('/inventory');
    }, 2000);
  } else {
    setErrors({ submit: result.error || 'Failed to update item' });
  }
};
```

#### ✅ REPLACE WITH THIS:

```javascript
const handleSubmit = async (e) => {
  e.preventDefault();
  
  if (!validateForm()) {
    return;
  }

  const result = await updateItem(id, formData);
  if (result.success) {
    setSuccess(true);
    setTimeout(() => {
      navigate('/inventory');
    }, 2000);
  } else {
    setErrors({ submit: result.error || 'Failed to update item' });
  }
};
```

---

## 📁 File 5: `src/pages/Login.js`

### 🎯 Changes Required: Make handleSubmit async

#### 🔍 Find these lines (around line 60-80):

```javascript
// FIND THIS FUNCTION:
const handleSubmit = (e) => {
  e.preventDefault();
  
  const result = login(formData.username, formData.password);
  if (result.success) {
    navigate('/dashboard');
  } else {
    setError(result.error || 'Login failed');
  }
};
```

#### ✅ REPLACE WITH THIS:

```javascript
const handleSubmit = async (e) => {
  e.preventDefault();
  
  const result = await login(formData.username, formData.password);
  if (result.success) {
    navigate('/dashboard');
  } else {
    setError(result.error || 'Login failed');
  }
};
```

---

## 📁 File 6: `src/pages/Register.js`

### 🎯 Changes Required: Make handleSubmit async

#### 🔍 Find these lines (around line 60-80):

```javascript
// FIND THIS FUNCTION:
const handleSubmit = (e) => {
  e.preventDefault();
  
  const result = register(formData);
  if (result.success) {
    navigate('/login');
  } else {
    setError(result.error || 'Registration failed');
  }
};
```

#### ✅ REPLACE WITH THIS:

```javascript
const handleSubmit = async (e) => {
  e.preventDefault();
  
  const result = await register(formData);
  if (result.success) {
    navigate('/login');
  } else {
    setError(result.error || 'Registration failed');
  }
};
```

---

## 📁 File 7: `src/pages/InventoryList.js`

### 🎯 Changes Required: Make handleDelete async

#### 🔍 Find these lines (around line 180-200):

```javascript
// FIND THIS FUNCTION:
const handleDelete = (id) => {
  if (window.confirm('Are you sure you want to delete this item?')) {
    const result = deleteItem(id);
    if (result.success) {
      // Item will be automatically removed from the list
    } else {
      alert('Failed to delete item');
    }
  }
};
```

#### ✅ REPLACE WITH THIS:

```javascript
const handleDelete = async (id) => {
  if (window.confirm('Are you sure you want to delete this item?')) {
    const result = await deleteItem(id);
    if (result.success) {
      // Item will be automatically removed from the list
    } else {
      alert('Failed to delete item: ' + result.error);
    }
  }
};
```

---

## 📁 File 8: `src/pages/ItemDetails.js`

### 🎯 Changes Required: Make handleDelete async

#### 🔍 Find these lines (around line 40-60):

```javascript
// FIND THIS FUNCTION:
const handleDelete = () => {
  if (window.confirm('Are you sure you want to delete this item?')) {
    const result = deleteItem(id);
    if (result.success) {
      navigate('/inventory');
    } else {
      alert('Failed to delete item');
    }
  }
};
```

#### ✅ REPLACE WITH THIS:

```javascript
const handleDelete = async () => {
  if (window.confirm('Are you sure you want to delete this item?')) {
    const result = await deleteItem(id);
    if (result.success) {
      navigate('/inventory');
    } else {
      alert('Failed to delete item: ' + result.error);
    }
  }
};
```

---

## 📁 File 9: `package.json`

### 🎯 Add Proxy Configuration

#### 🔍 Find the `"scripts"` section and add this above it:

```json
{
  "name": "inventory-management",
  "version": "0.1.0",
  "private": true,
  "proxy": "http://localhost:5000",
  "dependencies": {
    // ... existing dependencies
  },
  "scripts": {
    // ... existing scripts
  }
}
```

---

## 🚀 Quick Implementation Steps

### Step 1: Update package.json
```bash
# Add proxy to package.json
"proxy": "http://localhost:5000"
```

### Step 2: Update AuthContext.js
- Replace useEffect and all auth functions
- Add async/await to login, logout, register

### Step 3: Update InventoryContext.js
- Replace useEffect with fetchItems()
- Replace all CRUD functions with API calls
- Add async/await to all functions

### Step 4: Update Form Pages
- Add async/await to handleSubmit in:
  - AddItem.js
  - EditItem.js
  - Login.js
  - Register.js

### Step 5: Update Delete Functions
- Add async/await to handleDelete in:
  - InventoryList.js
  - ItemDetails.js

---

## 🔍 Testing Checklist

### ✅ Authentication Testing
- [ ] User registration works
- [ ] User login works
- [ ] Token is stored in localStorage
- [ ] Logout clears token
- [ ] Protected routes work

### ✅ Inventory Testing
- [ ] Items load from API
- [ ] Add new item works
- [ ] Edit existing item works
- [ ] Delete item works
- [ ] Search functionality works
- [ ] Category filter works

### ✅ Error Handling
- [ ] Network errors show user-friendly messages
- [ ] Validation errors display properly
- [ ] Loading states work correctly

---

## 🐛 Common Issues & Solutions

### Issue 1: CORS Errors
**Solution:** Add CORS middleware to your backend
```javascript
const cors = require('cors');
app.use(cors({ origin: 'http://localhost:3000' }));
```

### Issue 2: 401 Unauthorized
**Solution:** Check if token is being sent in headers
```javascript
headers: { 'Authorization': `Bearer ${token}` }
```

### Issue 3: 403 Forbidden
**Solution:** Check user role in backend middleware
```javascript
if (req.user.role !== 'admin') {
  return res.status(403).json({ error: 'Admin access required' });
}
```

### Issue 4: Network Errors
**Solution:** Ensure backend is running on correct port
- Backend: http://localhost:5000
- Frontend: http://localhost:3000
- Proxy configured in package.json

---

## 📞 Final Notes

1. **Test one file at a time** - Start with AuthContext, then InventoryContext
2. **Check browser console** for any API errors
3. **Use browser Network tab** to see API requests/responses
4. **Keep localStorage** for token storage (it's secure for JWT)
5. **Remove sample data** once backend is working

This guide provides exact line numbers and code replacements for each file. Follow it step by step and your frontend will be fully connected to the backend! 🚀
