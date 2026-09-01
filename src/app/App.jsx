import React from "react";
import { BrowserRouter } from "react-router-dom";
import AppRouter from "./AppRouter";
import { AuthProvider } from "../auth/AuthContext";
import { ThemeProvider } from "../context/ThemeContext";
import { LanguageProvider } from "../context/LanguageContext";
import { ToastProvider } from "../components/ui/Toast";
import { NotificationProvider } from "../notifications/NotificationContext";

export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <LanguageProvider>
          <ToastProvider>
            <NotificationProvider>
              <BrowserRouter basename="/certificate-equivalency-system-frontend">
                <AppRouter />
              </BrowserRouter>
            </NotificationProvider>
          </ToastProvider>
        </LanguageProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}

