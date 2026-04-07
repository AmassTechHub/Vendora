import { createContext, useContext, useState } from 'react';
import api from '../api/axios';
import { clearAuthSession, getAccessToken, getRefreshToken, getStoredUser, setAuthSession } from '../lib/authStorage';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => getStoredUser());

  const login = (userData, token, refreshToken) => {
    setAuthSession({ token, refreshToken, user: userData });
    setUser(userData);
  };

  const logout = async () => {
    const refreshToken = getRefreshToken();
    clearAuthSession();
    setUser(null);

    if (refreshToken) {
      try {
        await api.post('/auth/logout', { refreshToken });
      } catch {
        // Proceed with local logout even if API call fails.
      }
    }
  };

  const updateUser = (nextUser) => {
    const refreshToken = getRefreshToken();
    const token = getAccessToken();
    if (token && refreshToken) {
      setAuthSession({ token, refreshToken, user: nextUser });
    } else {
      localStorage.setItem('user', JSON.stringify(nextUser));
    }
    setUser(nextUser);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
