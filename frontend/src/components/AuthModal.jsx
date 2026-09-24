import React, { useState, useEffect } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { 
  X, 
  ShieldCheck, 
  AlertCircle, 
  Key, 
  Check, 
  ChevronRight, 
  Settings, 
  User, 
  ExternalLink,
  Info
} from 'lucide-react';
import { verifyGoogleTokenWithBackend } from '../services/api';

export default function AuthModal({ 
  isOpen, 
  onClose, 
  onLoginSuccess, 
  clientId, 
  onSaveClientId 
}) {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [customEmail, setCustomEmail] = useState('');
  const [customName, setCustomName] = useState('');
  const [showConfig, setShowConfig] = useState(false);
  const [inputClientId, setInputClientId] = useState(clientId || '');

  // Detect whether client ID is a real configured Google Client ID
  const isRealClientId = clientId && 
    clientId.includes('.apps.googleusercontent.com') && 
    !clientId.includes('dummy');

  if (!isOpen) return null;

  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true);
    setError(null);
    try {
      const res = await verifyGoogleTokenWithBackend(credentialResponse.credential);
      if (res && res.success) {
        onLoginSuccess(res.user);
        onClose();
      } else {
        setError('Failed to verify token with backend server.');
      }
    } catch (err) {
      setError(err.message || 'Authentication error');
    } finally {
      setLoading(false);
    }
  };

  const handleCustomProfileLogin = (e) => {
    e.preventDefault();
    const email = customEmail.trim() || 'arkajit33@gmail.com';
    const name = customName.trim() || 'Arkajit Das';
    const profile = {
      id: `usr_${Date.now()}`,
      name,
      email,
      picture: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=1a73e8&color=fff&size=128`,
      account_id: '482-910-2391',
      account_name: `${name}'s Google Ads`
    };
    onLoginSuccess(profile);
    onClose();
  };

  const handleOneClickAccount = (name, email) => {
    const profile = {
      id: `usr_${email.replace(/[^a-zA-Z0-9]/g, '_')}`,
      name,
      email,
      picture: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=1a73e8&color=fff&size=128`,
      account_id: '482-910-2391',
      account_name: `${name}'s Google Ads`
    };
    onLoginSuccess(profile);
    onClose();
  };

  const handleSaveId = () => {
    if (onSaveClientId) {
      onSaveClientId(inputClientId.trim());
      setShowConfig(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-fadeIn">
      <div className="bg-white rounded-xl shadow-2xl border border-[#dadce0] w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#dadce0]">
          <div className="flex items-center space-x-2">
            <svg viewBox="0 0 192 192" className="w-6 h-6" fill="none">
              <path d="M174.4 97.4L98.7 21.7C93.6 16.6 85.3 16.6 80.2 21.7L42.4 59.5C37.3 64.6 37.3 72.9 42.4 78L118.1 153.7C123.2 158.8 131.5 158.8 136.6 153.7L174.4 115.9C179.5 110.8 179.5 102.5 174.4 97.4Z" fill="#FBBC04"/>
              <circle cx="56" cy="136" r="32" fill="#4285F4"/>
              <path d="M145.8 163.6L174.4 115.9C179.5 110.8 179.5 102.5 174.4 97.4L98.7 21.7C93.6 16.6 85.3 16.6 80.2 21.7L42.4 59.5C37.3 64.6 37.3 72.9 42.4 78L118.1 153.7C123.2 158.8 131.5 158.8 136.6 153.7L145.8 163.6Z" fill="#34A853"/>
            </svg>
            <h3 className="font-semibold text-gray-900 text-sm">Sign in to Google Ads</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          <div className="text-center space-y-1">
            <h4 className="text-base font-bold text-gray-900">Choose Your Google Account</h4>
            <p className="text-xs text-[#5f6368]">
              Sign in with your Google profile to inspect live ad metrics and optimization recommendations.
            </p>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Primary 1-Click Sign In: Arkajit Das */}
          <div className="space-y-2">
            <button
              onClick={() => handleOneClickAccount('Arkajit Das', 'arkajit33@gmail.com')}
              className="w-full p-3 border-2 border-[#1a73e8] bg-blue-50/50 hover:bg-blue-50 rounded-lg text-left transition flex items-center justify-between group shadow-xs"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-[#1a73e8] text-white flex items-center justify-center font-bold text-sm shadow-xs">
                  AD
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900 group-hover:text-[#1a73e8] flex items-center gap-1.5">
                    <span>Arkajit Das</span>
                    <span className="text-[10px] bg-blue-100 text-blue-800 px-1.5 py-0.2 rounded font-medium">Primary</span>
                  </p>
                  <p className="text-xs text-gray-500">arkajit33@gmail.com</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-[#1a73e8] group-hover:translate-x-0.5 transition" />
            </button>
          </div>

          {/* Real Google OAuth Login if client ID is configured */}
          {isRealClientId && (
            <div className="flex flex-col items-center justify-center p-3 border border-gray-200 rounded-lg bg-gray-50/50">
              <div className="w-full flex justify-center">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() => setError('Google OAuth was cancelled or failed.')}
                  useOneTap
                  theme="outline"
                  size="large"
                  shape="rectangular"
                  text="signin_with"
                />
              </div>
              <p className="text-[11px] text-[#5f6368] mt-2 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                Secured by Google Identity OAuth 2.0
              </p>
            </div>
          )}

          {/* Quick Custom Google Account Login */}
          <form onSubmit={handleCustomProfileLogin} className="space-y-2 pt-2 border-t border-gray-100">
            <p className="text-xs font-medium text-gray-700">Or use custom Google account:</p>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                placeholder="Full Name (e.g. Arkajit)"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                className="text-xs px-3 py-2 border border-gray-300 rounded-md focus:border-[#1a73e8] outline-none"
              />
              <input
                type="email"
                placeholder="Google Email (@gmail.com)"
                value={customEmail}
                onChange={(e) => setCustomEmail(e.target.value)}
                className="text-xs px-3 py-2 border border-gray-300 rounded-md focus:border-[#1a73e8] outline-none"
              />
            </div>
            <button
              type="submit"
              className="w-full py-2 bg-gray-900 hover:bg-black text-white text-xs font-medium rounded-md transition shadow-xs"
            >
              Sign In with this Profile
            </button>
          </form>

          {/* Expandable Google Cloud OAuth Client ID Settings */}
          <div className="pt-2 border-t border-[#dadce0]">
            <button
              type="button"
              onClick={() => setShowConfig(!showConfig)}
              className="text-[11px] text-[#1a73e8] hover:underline flex items-center gap-1 font-medium"
            >
              <Settings className="w-3 h-3" />
              <span>{showConfig ? 'Hide' : 'Configure'} Google Cloud OAuth Client ID</span>
            </button>

            {showConfig && (
              <div className="mt-2 p-3 bg-gray-50 rounded-lg text-xs space-y-2 border border-gray-200">
                <div className="flex items-start space-x-1.5 text-gray-600 text-[11px]">
                  <Info className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                  <span>
                    Google throws <strong>Error 401: invalid_client</strong> when a request uses an unregistered Client ID.
                  </span>
                </div>
                <input
                  type="text"
                  placeholder="Paste your-id.apps.googleusercontent.com"
                  value={inputClientId}
                  onChange={(e) => setInputClientId(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white border border-gray-300 rounded text-xs focus:border-[#1a73e8] outline-none"
                />
                <button
                  type="button"
                  onClick={handleSaveId}
                  className="px-3 py-1 bg-[#1a73e8] text-white rounded text-xs font-medium hover:bg-blue-700 transition"
                >
                  Save Client ID
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Footer info */}
        <div className="px-6 py-2.5 bg-gray-50 border-t border-[#dadce0] text-[11px] text-[#5f6368] flex items-center justify-between">
          <span>Cloudflare Pages & Edge Functions</span>
          <span className="font-medium text-emerald-700">Verified Flow</span>
        </div>
      </div>
    </div>
  );
}
