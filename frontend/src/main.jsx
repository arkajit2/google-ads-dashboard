import React from 'react';
import ReactDOM from 'react-dom/client';
import { GoogleOAuthProvider } from '@react-oauth/google';
import App from './App.jsx';
import './index.css';

// Google OAuth Client ID from Google Cloud Console project core-period-509604-u4
const NEW_GOOGLE_CLIENT_ID = '594825739440-1cmpg8el1f1h8pui26kuquo69dtf4698.apps.googleusercontent.com';

// Prefer localStorage if explicitly overridden, else use the newly configured Client ID
const savedClientId = typeof window !== 'undefined' ? localStorage.getItem('user_google_client_id') : null;
const GOOGLE_CLIENT_ID = savedClientId || import.meta.env.VITE_GOOGLE_CLIENT_ID || NEW_GOOGLE_CLIENT_ID;

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <App />
    </GoogleOAuthProvider>
  </React.StrictMode>,
);
