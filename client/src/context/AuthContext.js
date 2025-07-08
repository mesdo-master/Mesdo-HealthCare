import React, { createContext, useState, useContext, useEffect } from 'react';
import axiosInstance from '../lib/axio.js';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState({});


  useEffect(() => {
    const checkStatus = async () => {
      try {
        const response = await axiosInstance.get('/me');
        if (response.data) {
          setIsAuthenticated(true); 
          setCurrentUser(response.data);
        } else {
          setIsAuthenticated(false);
          setCurrentUser({});
        }
      } catch (error) {
        console.error('Error checking authentication status:', error);
      }
    };


    checkStatus();
  }, [isAuthenticated]);

  const login = () => {
    setIsAuthenticated(true);
  };

  const logout = () => {
    setIsAuthenticated(false);
    setCurrentUser({});
  };

  return (
    <AuthContext.Provider value={{  setIsAuthenticated, isAuthenticated, login, logout, currentUser,setCurrentUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);