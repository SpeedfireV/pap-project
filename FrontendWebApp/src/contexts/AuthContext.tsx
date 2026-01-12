import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

interface User {
  name: string;
  email: string;
  picture?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean; // Add loading state
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Track loading state

  // Use useEffect to run client-side only
  useEffect(() => {
    // Check localStorage on client-side only
    const storedToken = localStorage.getItem('auth_token');
    
    if (storedToken) {
      try {
        const decoded = jwtDecode(storedToken) as any;
        const userData: User = {
          name: decoded.name || '',
          email: decoded.email || '',
          picture: decoded.picture,
        };
        
        setUser(userData);
        setToken(storedToken);
      } catch (error) {
        console.error('Failed to decode token:', error);
        localStorage.removeItem('auth_token');
      }
    }
    
    setIsLoading(false);
  }, []); // Empty dependency array means run once on mount

  const login = (token: string) => {
    // Check if we're on client-side
    if (typeof window !== 'undefined') {
      const decoded = jwtDecode(token) as any;
      const userData: User = {
        name: decoded.name || '',
        email: decoded.email || '',
        picture: decoded.picture,
      };
      
      setUser(userData);
      setToken(token);
      localStorage.setItem('auth_token', token);
    }
  };

  const logout = () => {
    // Check if we're on client-side
    if (typeof window !== 'undefined') {
      setUser(null);
      setToken(null);
      localStorage.removeItem('auth_token');
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      login,
      logout,
      isAuthenticated: !!user,
      isLoading,
    }}>
      {children}
    </AuthContext.Provider>
  );
};