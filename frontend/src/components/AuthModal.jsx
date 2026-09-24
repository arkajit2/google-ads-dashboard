import React, { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { 
  X, 
  ShieldCheck, 
  AlertCircle, 
  Settings, 
  KeyRound, 
  Check, 
  Info,
  ExternalLink 
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
  const [showConfig, setShowConfig] = useState(false);
  const [inputClientId, setInputClientId] = useState(clientId || '');

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
        setError('Failed to verify Google token with backend.');
      }
    } catch (err) {
      setError(err.message || 'Authentication error');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveNewId = (e) => {
    e.preventDefault();
    const cleanId = inputClientId.trim();
    if (!cleanId || !cleanId.includes('.apps.googleusercontent.com')) {
      setError('Please enter a valid Google OAuth Client ID ending with .apps.googleusercontent.com');
      return;
    }
    if (onSaveClientId) {
      onSaveClientId(cleanId);
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
            <h3 className="font-semibold text-white text-sm">Sign In with Google</h3>
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
            <h4 className="text-base font-bold text-[#FFF880]">Connect Your Google Account</h4>
            <p className="text-xs text-[#B8A6CC] leading-relaxed">
              Use your official Google account to authenticate and view your advertising campaign reports.
            </p>
          </div>

          {error && (
            <div className="p-3 bg-rose-950/60 border border-rose-800 rounded-lg text-xs text-rose-200 flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {/* Official Google Identity Button */}
          <div className="flex flex-col items-center justify-center p-5 bg-[#160B21] border border-[#3D1F57] rounded-xl space-y-3">
            <div className="w-full flex justify-center">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => {
                  setError('Google OAuth Error: Origin mismatch or cancelled. Ensure this domain is registered in your Google Cloud Console.');
                }}
                useOneTap
                theme="filled_black"
                size="large"
                shape="rectangular"
                text="signin_with"
              />
            </div>
            <p className="text-[11px] text-[#B8A6CC] flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#FFF880]" />
              Secured with Google OAuth 2.0
            </p>
          </div>

          {/* Setup / Switch Client ID */}
          <div className="pt-2 border-t border-[#3D1F57]">
            <button
              type="button"
              onClick={() => setShowConfig(!showConfig)}
              className="text-xs text-[#FFF880] hover:underline flex items-center gap-1.5 font-medium"
            >
              <Settings className="w-3.5 h-3.5" />
              <span>{showConfig ? 'Hide' : 'Update'} Google OAuth Client ID</span>
            </button>

            {showConfig && (
              <form onSubmit={handleSaveNewId} className="mt-3 p-3.5 bg-[#160B21] rounded-xl border border-[#3D1F57] text-xs space-y-2.5">
                <p className="text-[#B8A6CC] text-[11px] leading-relaxed">
                  Created a new Google Cloud Console project? Paste your new OAuth 2.0 Client ID here:
                </p>
                <input
                  type="text"
                  placeholder="xxxx.apps.googleusercontent.com"
                  value={inputClientId}
                  onChange={(e) => setInputClientId(e.target.value)}
                  className="w-full px-3 py-2 bg-[#221230] border border-[#3D1F57] focus:border-[#FFF880] rounded-lg text-xs text-white placeholder-[#B8A6CC]/40 outline-none font-mono"
                  required
                />
                <button
                  type="submit"
                  className="px-3.5 py-1.5 bg-[#FFF880] hover:bg-[#FFF880]/90 text-[#160B21] font-bold rounded-lg text-xs transition"
                >
                  Apply & Reload
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-[#160B21] border-t border-[#3D1F57] text-[11px] text-[#B8A6CC] flex items-center justify-between">
          <span>Fraoula Ad Intelligence</span>
          <span className="text-[#FFF880] font-medium">OAuth 2.0 Only</span>
        </div>
      </div>
    </div>
  );
}
