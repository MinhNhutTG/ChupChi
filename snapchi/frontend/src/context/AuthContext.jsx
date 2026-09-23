import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import api, { setAccessToken, setOnAuthLost } from '../api/client';

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // đang silent refresh lúc khởi động

  const applySession = useCallback((data) => {
    setAccessToken(data.accessToken);
    setUser(data.user);
  }, []);

  useEffect(() => {
    setOnAuthLost(() => setUser(null));
    // Silent refresh: lấy lại access token từ refresh cookie sau F5.
    // Render free có thể đang sleep nên request đầu có thể mất 30-50s.
    api
      .post('/auth/refresh')
      .then(({ data }) => applySession(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [applySession]);

  const login = async (email, password) =>
    applySession((await api.post('/auth/login', { email, password })).data);

  // Khi bật xác thực email, server không cấp phiên mà trả { needsVerification: true }
  const register = async (name, email, password) => {
    const { data } = await api.post('/auth/register', { name, email, password });
    if (data.accessToken) applySession(data);
    return data;
  };

  const loginWithGoogle = async (idToken) =>
    applySession((await api.post('/auth/google', { idToken })).data);

  const logout = async () => {
    await api.post('/auth/logout').catch(() => {});
    setAccessToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, loginWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
