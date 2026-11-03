import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // Check localStorage for persisted authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const saved = localStorage.getItem('baton_auth');
    return saved === 'true';
  });

  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('baton_user');
    return savedUser
      ? JSON.parse(savedUser)
      : {
          name: 'Aniruddha Bhandare',
          email: 'aniruddha@example.com',
          role: 'Project Lead',
          initials: 'A',
        };
  });

  const login = (credentials = {}) => {
    setIsAuthenticated(true);
    localStorage.setItem('baton_auth', 'true');
    const updatedUser = {
      name: credentials.email ? credentials.email.split('@')[0] : 'Aniruddha Bhandare',
      email: credentials.email || 'aniruddha@example.com',
      role: 'Project Lead',
      initials: credentials.email ? credentials.email[0].toUpperCase() : 'A',
    };
    setUser(updatedUser);
    localStorage.setItem('baton_user', JSON.stringify(updatedUser));
  };

  const signup = (details = {}) => {
    setIsAuthenticated(true);
    localStorage.setItem('baton_auth', 'true');
    const newUser = {
      name: details.fullName || 'Aniruddha Bhandare',
      email: details.email || 'aniruddha@example.com',
      role: 'Project Lead',
      initials: (details.fullName || 'A')[0].toUpperCase(),
    };
    setUser(newUser);
    localStorage.setItem('baton_user', JSON.stringify(newUser));
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('baton_auth');
    localStorage.removeItem('baton_user');
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        login,
        signup,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

