import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import Icon from "./Icon";

const ToastContext = createContext(null);
export function ToastProvider({ children }) {
  const [items, setItems] = useState([]);
  const remove = useCallback((id) => setItems((current) => current.filter((item) => item.id !== id)), []);
  const push = useCallback((toast) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const item = typeof toast === "string" ? { message: toast } : toast;
    setItems((current) => [...current, { id, type: "info", duration: 4000, ...item }]);
    if (item.duration !== 0) window.setTimeout(() => remove(id), item.duration || 4000);
    return id;
  }, [remove]);
  const value = useMemo(() => ({ toast: push, dismiss: remove }), [push, remove]);
  return <ToastContext.Provider value={value}>{children}<div className="ui-toast-region" aria-live="polite" aria-atomic="false">{items.map((item) => <div className={`ui-toast ui-toast--${item.type}`} key={item.id}><Icon name={item.type === "success" ? "check" : item.type === "danger" ? "close" : item.type === "warning" ? "warning" : "info"} size={18} /><div>{item.title && <strong>{item.title}</strong>}<span>{item.message}</span></div><button type="button" onClick={() => remove(item.id)} aria-label="Close">×</button></div>)}</div></ToastContext.Provider>;
}
export function useToast() { const context = useContext(ToastContext); if (!context) throw new Error("useToast must be used inside ToastProvider"); return context; }
export default ToastProvider;
