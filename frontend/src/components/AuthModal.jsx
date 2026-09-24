import React, { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { X, ShieldCheck, UserCheck, AlertCircle, Key } from 'lucide-react';
import { verifyGoogleTokenWithBackend } from '../services/api';

export default function AuthModal({ isOpen, onClose, onLoginSuccess }) {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

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

  const handleDemoLogin = (profileType) => {
    const demoProfiles = {
      agency: {
        id: 'usr_sarah_jenkins',
        name: 'Sarah Jenkins',
        email: 'sarah.jenkins@growthmedia.com',
        picture: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
        account_id: '482-910-2391',
        account_name: 'Apex Digital Global'
      },
      ecommerce: {
        id: 'usr_david_chen',
        name: 'David Chen',
        email: 'd.chen@novastore.io',
        picture: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
        account_id: '721-409-1830',
        account_name: 'Nova Store Direct'
      }
    };

    onLoginSuccess(demoProfiles[profileType]);
    onClose();
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
              <path d="M145.8 163.6L174.4 115.9C179.5 110.8 179.5 102.5 174.4 97.4L98.7 21.7C93.6 16.6 85.3 16.6 80.2 21.7L42.4 59.5C37.3 64.6 37.3 72.9 42.4 78Z" fill="#34A853"/>
            </svg>
            <h3 className="font-semibold text-gray-900 text-sm">Sign in to Google Ads</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          <div className="text-center space-y-1">
            <h4 className="text-base font-bold text-gray-900">Access Your Campaigns</h4>
            <p className="text-xs text-[#5f6368]">
              Connect with your Google Identity to inspect live ad metrics, budgets, and optimization recommendations.
            </p>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Real Google OAuth Button */}
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
              Secured by Google Identity Services OAuth 2.0
            </p>
          </div>

          {/* Divider */}
          <div className="relative flex items-center justify-center">
            <div className="border-t border-[#dadce0] w-full" />
            <span className="bg-white px-3 text-[11px] text-[#5f6368] uppercase tracking-wider absolute">
              Or Try Instant Demo Profile
            </span>
          </div>

          {/* Quick Demo Sign In Profiles */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              onClick={() => handleDemoLogin('agency')}
              className="p-2.5 border border-gray-200 rounded-lg text-left hover:border-blue-500 hover:bg-blue-50/40 transition flex items-center space-x-2"
            >
              <img
                src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80"
                alt="Sarah"
                className="w-7 h-7 rounded-full object-cover"
              />
              <div className="overflow-hidden">
                <p className="font-semibold text-gray-800 truncate">Sarah Jenkins</p>
                <p className="text-[10px] text-gray-500 truncate">Agency Account</p>
              </div>
            </button>

            <button
              onClick={() => handleDemoLogin('ecommerce')}
              className="p-2.5 border border-gray-200 rounded-lg text-left hover:border-blue-500 hover:bg-blue-50/40 transition flex items-center space-x-2"
            >
              <img
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80"
                alt="David"
                className="w-7 h-7 rounded-full object-cover"
              />
              <div className="overflow-hidden">
                <p className="font-semibold text-gray-800 truncate">David Chen</p>
                <p className="text-[10px] text-gray-500 truncate">E-Commerce</p>
              </div>
            </button>
          </div>
        </div>

        {/* Footer info */}
        <div className="px-6 py-3 bg-gray-50 border-t border-[#dadce0] text-[11px] text-[#5f6368] flex items-center justify-between">
          <span>Cloudflare Pages & GitHub Ready</span>
          <span className="font-medium text-blue-600">Google Ads UI v2.4</span>
        </div>
      </div>
    </div>
  );
}
