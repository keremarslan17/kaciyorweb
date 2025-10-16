import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// All Providers (ThemeProvider, AuthProvider, CartProvider, Router) are now
// correctly organized inside the App.tsx component. This makes the entry point
// clean and ensures the correct provider hierarchy.

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
