import React from 'react';
import ReactDOM from 'react-dom/client';
import { GoogleOAuthProvider } from '@react-oauth/google';
import App from './App.jsx';
import './index.css';

// Read Google OAuth Client ID dynamically from localStorage or environment
const savedClientId = typeof window !== 'undefined' ? localStorage.getItem('user_google_client_id') : null;
const GOOGLE_CLIENT_ID = savedClientId || import.meta.env.VITE_GOOGLE_CLIENT_ID || '1029384756-dummy-client-id.apps.googleusercontent.com';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <App />
    </GoogleOAuthProvider>
  </React.StrictMode>,
);
