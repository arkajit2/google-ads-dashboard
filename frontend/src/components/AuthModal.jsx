import React, { useState } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import { 
  X, 
  ShieldCheck, 
  AlertCircle, 
  CheckCircle2, 
  RefreshCw,
  Sparkles
} from 'lucide-react';
import { exchangeAuthCodeForTokens } from '../services/api';

export default function AuthModal({ 
  isOpen, 
  onClose, 
  onLoginSuccess 
}) {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // Popup OAuth 2.0 Auth-Code flow with Google Ads scope
  const popupLogin = useGoogleLogin({
    flow: 'auth-code',
    scope: 'https://www.googleapis.com/auth/adwords https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email',
    onSuccess: async (codeResponse) => {
      setLoading(true);
      setError(null);
      try {
        const data = await exchangeAuthCodeForTokens(codeResponse.code);
        if (data.success && data.access_token) {
          const profile = data.user || {};
          const googleUser = {
            id: profile.id || profile.sub,
            name: profile.name || 'Google User',
            email: profile.email || '',
            picture: profile.picture || '',
            access_token: data.access_token,
            refresh_token: data.refresh_token,
            is_live: true,
            customer_id: '',
            account_name: `${profile.name || 'Personal'}'s Google Ads`
          };
          onLoginSuccess(googleUser);
          onClose();
        } else {
          setError(data.error || 'Failed to exchange Google authorization code.');
        }
      } catch (err) {
        setError(err.message || 'Error authorizing with Google.');
      } finally {
        setLoading(false);
      }
    },
    onError: (err) => {
      console.error("Google popup error:", err);
      setError('Google authorization popup was closed, blocked, or not permitted.');
    }
  });

  if (!isOpen) return null;

  // Primary handler for the official Google GIS Login button
  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true);
    setError(null);
    try {
      let googleUser = null;

      // Direct client-side decode of Google ID Token (fast & robust)
      if (credentialResponse.credential) {
        try {
          const parts = credentialResponse.credential.split('.');
          if (parts.length >= 2) {
            const base64Url = parts[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(
              atob(base64)
                .split('')
                .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
            );
            const decoded = JSON.parse(jsonPayload);
            googleUser = {
              id: decoded.sub,
              name: decoded.name || 'Google User',
              email: decoded.email || '',
              picture: decoded.picture || '',
              is_live: true,
              customer_id: '',
              account_name: `${decoded.name || 'Google'}'s Ads Account`
            };
          }
        } catch (e) {
          console.warn("JWT direct parse issue:", e);
        }
      }

      // Also verify via Edge Function
      try {
        const res = await verifyGoogleTokenWithBackend(credentialResponse.credential);
        if (res && res.success && res.user) {
          googleUser = { ...googleUser, ...res.user, is_live: true };
        }
      } catch (e) {
        console.warn("Backend verify issue:", e);
      }

      if (googleUser && googleUser.email) {
        onLoginSuccess(googleUser);
        onClose();
      } else {
        setError('Could not extract verified profile from Google authentication response.');
      }
    } catch (err) {
      console.error("Auth error:", err);
      setError(err.message || 'Authentication error.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-fadeIn">
      <div className="bg-[#221230] rounded-2xl shadow-2xl border border-[#3D1F57] w-full max-w-md overflow-hidden text-white">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#3D1F57]">
          <div className="flex items-center space-x-2.5">
            <div className="w-7 h-7 rounded-lg bg-[#3D1B4F] border border-[#FFF880]/40 flex items-center justify-center">
              <span className="w-2.5 h-2.5 rounded-full bg-[#FFF880]"></span>
            </div>
            <h3 className="font-semibold text-white text-sm">Google Authentication</h3>
          </div>
          <button 
            onClick={onClose} 
            className="p-1 rounded-lg text-[#B8A6CC] hover:text-white hover:bg-[#3D1F57] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          <div className="text-center space-y-1">
            <h4 className="text-base font-bold text-[#FFF880]">Sign In with Your Google Profile</h4>
            <p className="text-xs text-[#B8A6CC] leading-relaxed">
              Authenticate securely with Google to view your advertising campaigns and performance reports.
            </p>
          </div>

          {error && (
            <div className="p-3 bg-rose-950/60 border border-rose-800 rounded-lg text-xs text-rose-200 flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {/* Primary Google Ads OAuth Button */}
          <div className="space-y-3 pt-2">
            <button
              type="button"
              onClick={() => popupLogin()}
              disabled={loading}
              className="w-full py-3.5 px-4 bg-[#FFF880] hover:bg-[#FFF880]/90 text-[#160B21] rounded-xl font-bold text-sm transition flex items-center justify-center space-x-2.5 cursor-pointer shadow-[0_0_20px_rgba(255,248,128,0.25)]"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>{loading ? 'Connecting with Google...' : 'Sign In with Google (Live Ads)'}</span>
            </button>
            <p className="text-[11px] text-center text-[#B8A6CC] flex items-center justify-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#FFF880]" />
              Requests official Google Ads permissions to view your account
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-[#160B21] border-t border-[#3D1F57] text-[11px] text-[#B8A6CC] flex items-center justify-between">
          <span>Project: core-period-509604-u4</span>
          <span className="text-[#FFF880] font-medium">Cloudflare Pages</span>
        </div>
      </div>
    </div>
  );
}
