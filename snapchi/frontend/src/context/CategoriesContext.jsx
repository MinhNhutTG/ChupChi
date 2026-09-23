import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import api from '../api/client';

const CategoriesContext = createContext(null);
export const useCategories = () => useContext(CategoriesContext);

export function CategoriesProvider({ children }) {
  const [categories, setCategories] = useState([]);
  const [loaded, setLoaded] = useState(false);

  const reload = useCallback(async () => {
    const { data } = await api.get('/categories');
    setCategories(data);
    setLoaded(true);
    return data;
  }, []);

  useEffect(() => {
    reload().catch(() => setLoaded(true));
  }, [reload]);

  const byId = useMemo(() => Object.fromEntries(categories.map((c) => [c._id, c])), [categories]);

  return (
    <CategoriesContext.Provider value={{ categories, byId, loaded, reload }}>
      {children}
    </CategoriesContext.Provider>
  );
}
