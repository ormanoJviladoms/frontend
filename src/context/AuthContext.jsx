/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useState, useContext } from 'react';
import * as authService from '../api/auth';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

const getStoredUser = () => {
  const storedUser = localStorage.getItem('user');
  const accessToken = localStorage.getItem('accessToken');

  if (!storedUser || !accessToken) return null;

  try {
    return JSON.parse(storedUser);
  } catch {
    localStorage.removeItem('user');
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(getStoredUser);
  const [loading] = useState(false);

  const login = async (email, password) => {
    try {
      const response = await authService.login(email, password);
      if (response.status === 'success') {
        const { user, accessToken, refreshToken } = response.data;
        setUser(user);
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        return { success: true, user };
      }
      return { success: false, message: response.message };
    } catch {
      return { success: false, message: 'Error de connexió amb el servidor' };
    }
  };

  const register = async (userData) => {
    try {
      const response = await authService.register(userData);
      if (response.status === 'success') {
        const { user, accessToken, refreshToken } = response.data;
        setUser(user);
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        return { success: true, user };
      }
      return { success: false, message: response.message };
    } catch {
      return { success: false, message: 'Error de connexió amb el servidor' };
    }
  };

  const logout = async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    if (refreshToken) {
      await authService.logout(refreshToken);
    }
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userId'); // Neteja de rastro de l'antic mock
    localStorage.removeItem('userEmail');
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};
