import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  // const login = (username, password) => {
  //   const users = JSON.parse(localStorage.getItem('users') || '[]');
  //   const user = users.find(u => u.username === username && u.password === password);
    
  //   if (user) {
  //     setCurrentUser(user);
  //     localStorage.setItem('currentUser', JSON.stringify(user));
  //     return { success: true };
  //   } else {
  //     return { success: false, error: 'Invalid credentials' };
  //   }
  // };


  const login = async (username, password) => {
  setLoading(true);
  try {
    const response = await fetch('http://localhost:8080/api/user/login', {
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

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
  };

  // const register = (userData) => {
  //   const users = JSON.parse(localStorage.getItem('users') || '[]');
    
  //   if (users.find(u => u.username === userData.username)) {
  //     return { success: false, error: 'Username already exists' };
  //   }
    
  //   const newUser = {
  //     ...userData,
  //     id: Date.now().toString(),
  //     createdAt: new Date().toISOString()
  //   };
    
  //   users.push(newUser);
  //   localStorage.setItem('users', JSON.stringify(users));
    
  //   return { success: true, user: newUser };
  // };

  const register = async (userData) => {
  setLoading(true);
  try {
    const response = await fetch('http://localhost:8080/api/user/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    const data = await response.json();
    // console(data);
    
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
  const hasRole = (role) => {
    return currentUser?.role === role;
  };

  const value = {
    currentUser,
    login,
    logout,
    register,
    hasRole,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
