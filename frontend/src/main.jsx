import React from 'react';
import ReactDOM from 'react-dom/client';
import { ClerkProvider } from '@clerk/react';
import { PersonaProvider } from './context/PersonaContext';
import App from './App';
import AuthPage from './features/auth/AuthPage';
import './index.css';

// Automatically suppress Clerk development mode badges and watermarks across all views
if (typeof window !== 'undefined') {
  const hideDevBadge = () => {
    document.querySelectorAll('*').forEach((el) => {
      if (
        el.children.length === 0 &&
        el.textContent &&
        el.textContent.trim().toLowerCase() === 'development mode'
      ) {
        // Hide badge container and eliminate orange dotted dev background
        const container = el.closest('[class*="Badge"]') || el.closest('div') || el;
        container.style.setProperty('display', 'none', 'important');
      }
    });
  };
  const devBadgeObserver = new MutationObserver(hideDevBadge);
  devBadgeObserver.observe(document.documentElement, { childList: true, subtree: true });
}

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <PersonaProvider>
      {PUBLISHABLE_KEY ? (
        <ClerkProvider 
          publishableKey={PUBLISHABLE_KEY} 
          afterSignOutUrl="/"
          appearance={{
            layout: {
              unsafe_disableDevelopmentModeWarnings: true,
            },
          }}
        >
          <App />
        </ClerkProvider>
      ) : (
        <AuthPage isConfigured={false} />
      )}
    </PersonaProvider>
  </React.StrictMode>
);
