import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import api from '../services/api';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        // Try credentials-based cookie authentication first
        const res = await api.get('/auth/profile');
        setUser(res.data);
      } catch (err) {
        // Fallback to localStorage bearer token if cookie check fails
        const token = localStorage.getItem('access_token');
        if (token) {
          try {
            const res = await axios.get(`${API_URL}/auth/profile`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            setUser(res.data);
          } catch {
            localStorage.removeItem('access_token');
          }
        }
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.data.access_token) {
      localStorage.setItem('access_token', res.data.access_token);
    }
    setUser(res.data.user);
    return res.data.user;
  };

  const register = async (userData) => {
    await api.post('/auth/register', userData);
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (err) {
      console.warn('Backend cookie clear failed:', err);
    } finally {
      localStorage.removeItem('access_token');
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
