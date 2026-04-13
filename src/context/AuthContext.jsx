import React, { createContext, useState, useContext, useEffect } from 'react';
import * as authService from '../api/auth';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Intentem recuperar la sessió al carregar la pàgina
    const storedUser = localStorage.getItem('user');
    const accessToken = localStorage.getItem('accessToken');
    
    if (storedUser && accessToken) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await authService.login(email, password);
      if (response.status === 'success') {
        const { user, accessToken, refreshToken } = response.data;
        setUser(user);
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        return { success: true };
      }
      return { success: false, message: response.message };
    } catch (error) {
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
        return { success: true };
      }
      return { success: false, message: response.message };
    } catch (error) {
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

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
