import { createContext, useCallback, useContext, useRef, useState } from 'react';

const ToastContext = createContext(() => {});
export const useToast = () => useContext(ToastContext).showToast;

// Toast nằm trong khung .device, dùng chung cho mọi màn hình
export function ToastProvider({ children }) {
  const [toast, setToast] = useState({ text: '', error: false, show: false });
  const timer = useRef();

  const showToast = useCallback((text, { error = false } = {}) => {
    setToast({ text, error, show: true });
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setToast((t) => ({ ...t, show: false })), error ? 2400 : 1800);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div
        className={`save-toast ${toast.show ? 'show' : ''} ${toast.error ? 'error' : ''}`}
        role="status"
        aria-live="polite"
      >
        {toast.text}
      </div>
    </ToastContext.Provider>
  );
}
