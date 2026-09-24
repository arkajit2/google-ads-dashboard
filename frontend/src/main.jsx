import React from 'react';
import ReactDOM from 'react-dom/client';
import { GoogleOAuthProvider } from '@react-oauth/google';
import App from './App.jsx';
import './index.css';

// Google OAuth Client ID discovered from user's bold-bose project
const DEFAULT_GOOGLE_CLIENT_ID = '456268738355-0602flbh7phl8bjra2k8n3gk26qnd0nq.apps.googleusercontent.com';
const savedClientId = typeof window !== 'undefined' ? localStorage.getItem('user_google_client_id') : null;
const GOOGLE_CLIENT_ID = savedClientId || import.meta.env.VITE_GOOGLE_CLIENT_ID || DEFAULT_GOOGLE_CLIENT_ID;

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <App />
    </GoogleOAuthProvider>
  </React.StrictMode>,
);
