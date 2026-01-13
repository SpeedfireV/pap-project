import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

interface User {
  name: string;
  email: string;
  picture?: string;
  sub?: string; // Google user ID
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
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
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = () => {
      const storedToken = localStorage.getItem('auth_token');
      
      if (storedToken) {
        try {
          const decoded = jwtDecode(storedToken) as any;
          const userData: User = {
            name: decoded.name || '',
            email: decoded.email || '',
            picture: decoded.picture,
            sub: decoded.sub,
          };
          
          // Verify token is not expired
          const currentTime = Date.now() / 1000;
          if (decoded.exp && decoded.exp < currentTime) {
            console.log('Token expired');
            localStorage.removeItem('auth_token');
          } else {
            setUser(userData);
            setToken(storedToken);
          }
        } catch (error) {
          console.error('Failed to decode token:', error);
          localStorage.removeItem('auth_token');
        }
      }
      
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const login = (newToken: string) => {
    try {
      const decoded = jwtDecode(newToken) as any;
      const userData: User = {
        name: decoded.name || '',
        email: decoded.email || '',
        picture: decoded.picture,
        sub: decoded.sub,
      };
      
      setUser(userData);
      setToken(newToken);
      localStorage.setItem('auth_token', newToken);
    } catch (error) {
      console.error('Failed to decode token on login:', error);
      throw new Error('Invalid token');
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('auth_token');
    // Optional: Revoke Google token
    if (window.google?.accounts?.id) {
      window.google.accounts.id.revoke();
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      login,
      logout,
      isAuthenticated: !!user && !!token,
      isLoading,
    }}>
      {children}
    </AuthContext.Provider>
  );
};