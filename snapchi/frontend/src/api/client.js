import axios from 'axios';

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/api`,
  withCredentials: true, // gửi refresh cookie cross-domain
});

// Access token chỉ nằm trong memory (không dùng localStorage)
let accessToken = null;
let onAuthLost = () => {};

export const setAccessToken = (t) => {
  accessToken = t;
};
export const setOnAuthLost = (fn) => {
  onAuthLost = fn;
};

api.interceptors.request.use((config) => {
  if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`;
  return config;
});

// Khi 401: thử refresh 1 lần (dùng chung 1 promise nếu nhiều request cùng lỗi), rồi gọi lại
let refreshing = null;
api.interceptors.response.use(
  (r) => r,
  async (error) => {
    const original = error.config;
    const isAuthRoute = original?.url?.startsWith('/auth/');
    if (error.response?.status !== 401 || original._retried || isAuthRoute) throw error;
    original._retried = true;
    try {
      refreshing ??= api.post('/auth/refresh').finally(() => (refreshing = null));
      const { data } = await refreshing;
      accessToken = data.accessToken;
      return api(original);
    } catch {
      accessToken = null;
      onAuthLost();
      throw error;
    }
  }
);

export default api;
