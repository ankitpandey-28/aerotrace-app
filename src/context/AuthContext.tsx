import React, { createContext, useContext, useState } from 'react';

interface User {
  name: string;
  email: string;
  avatar: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, name?: string) => void;
  signup: (name: string, email: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const login = (email: string, name = 'Alex Morgan') => {
    setUser({
      name,
      email,
      avatar: name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2),
    });
  };

  const signup = (name: string, email: string) => {
    setUser({
      name,
      email,
      avatar: name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2),
    });
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, isAuthenticated: !!user }}>
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
