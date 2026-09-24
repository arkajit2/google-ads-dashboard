import React from 'react';
import ReactDOM from 'react-dom/client';
import { GoogleOAuthProvider } from '@react-oauth/google';
import App from './App.jsx';
import './index.css';

// Ensure any stale legacy client ID is wiped from localStorage
if (typeof window !== 'undefined') {
  try {
    const oldId = localStorage.getItem('user_google_client_id');
    if (oldId && oldId.startsWith('456268738355')) {
      localStorage.removeItem('user_google_client_id');
    }
  } catch (e) {
    console.error(e);
  }
}

// Exactly the new Client ID from Desktop Test.json
const GOOGLE_CLIENT_ID = '594825739440-1cmpg8el1f1h8pui26kuquo69dtf4698.apps.googleusercontent.com';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <App />
    </GoogleOAuthProvider>
  </React.StrictMode>,
);
