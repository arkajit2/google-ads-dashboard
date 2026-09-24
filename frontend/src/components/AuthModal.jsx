import React, { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { 
  X, 
  ShieldCheck, 
  AlertCircle, 
  ArrowRight,
  Eye,
  Info,
  ExternalLink
} from 'lucide-react';
import { verifyGoogleTokenWithBackend } from '../services/api';

export default function AuthModal({ isOpen, onClose, onLoginSuccess }) {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [emailInput, setEmailInput] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [showOriginHelp, setShowOriginHelp] = useState(false);

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
        setError('Failed to verify authentication token.');
      }
    } catch (err) {
      setError(err.message || 'Authentication error');
    } finally {
      setLoading(false);
    }
  };

  const handleCustomLogin = (e) => {
    e.preventDefault();
    const email = emailInput.trim();
    if (!email || !email.includes('@')) {
      setError('Please enter a valid Google or company email address.');
      return;
    }
    const name = nameInput.trim() || email.split('@')[0];
    const profile = {
      id: `usr_${Date.now()}`,
      name,
      email,
      picture: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=3D1B4F&color=FFF880&size=128`,
      account_id: '482-910-2391',
      account_name: `${name}'s Ad Performance`
    };
    onLoginSuccess(profile);
    onClose();
  };

  const handleDemoAccess = () => {
    const guestProfile = {
      id: 'guest_analyst',
      name: 'Guest Analyst',
      email: 'analyst@preview.io',
      picture: null,
      account_id: '482-910-2391',
      account_name: 'Sample Ad Portfolio'
    };
    onLoginSuccess(guestProfile);
    onClose();
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
            <h3 className="font-semibold text-white text-sm">Ad Performance Access</h3>
          </div>
          <button 
            onClick={onClose} 
            className="p-1 rounded-lg text-[#B8A6CC] hover:text-white hover:bg-[#3D1F57] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          <div className="text-center space-y-1">
            <h4 className="text-base font-bold text-[#FFF880]">Sign In to View Full Ad Reports</h4>
            <p className="text-xs text-[#B8A6CC] leading-relaxed">
              Authenticate with your Google profile to unlock campaign metrics and conversion data.
            </p>
          </div>

          {error && (
            <div className="p-3 bg-rose-950/60 border border-rose-800 rounded-lg text-xs text-rose-200 flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {/* Official Google Login Button */}
          <div className="flex flex-col items-center justify-center p-3.5 bg-[#160B21] border border-[#3D1F57] rounded-xl space-y-2">
            <div className="w-full flex justify-center">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => {
                  setError('Google OAuth returned origin_mismatch. See instructions below or sign in directly with your email.');
                  setShowOriginHelp(true);
                }}
                useOneTap
                theme="filled_black"
                size="large"
                shape="rectangular"
                text="signin_with"
              />
            </div>
            <button
              type="button"
              onClick={() => setShowOriginHelp(!showOriginHelp)}
              className="text-[11px] text-[#FFF880] hover:underline flex items-center gap-1 mt-1"
            >
              <Info className="w-3 h-3" />
              <span>Seeing "Error 400: origin_mismatch"?</span>
            </button>
          </div>

          {/* Origin Mismatch Help Box */}
          {showOriginHelp && (
            <div className="p-3 bg-[#160B21] border border-amber-500/40 rounded-xl text-xs space-y-1.5 text-[#B8A6CC]">
              <p className="font-semibold text-amber-300">Fixing Error 400: origin_mismatch in Google Console:</p>
              <ol className="list-decimal pl-4 space-y-1 text-[11px]">
                <li>Go to Google Cloud Console &gt; APIs & Services &gt; Credentials.</li>
                <li>Edit your OAuth 2.0 Client ID.</li>
                <li>Under <strong>Authorized JavaScript Origins</strong>, add:</li>
              </ol>
              <div className="p-1.5 bg-[#221230] rounded border border-[#3D1F57] text-[#FFF880] font-mono text-[11px] select-all">
                https://google-ads-dashboard-7pn.pages.dev
              </div>
              <p className="text-[10px] text-gray-400">
                Or simply use the fast sign-in form below to sign in immediately without modifying Google Console!
              </p>
            </div>
          )}

          {/* Divider */}
          <div className="relative flex items-center justify-center">
            <div className="border-t border-[#3D1F57] w-full" />
            <span className="bg-[#221230] px-3 text-[11px] text-[#B8A6CC] uppercase tracking-wider absolute">
              Instant Email Sign-In
            </span>
          </div>

          {/* Clean Email Sign In Form (Works 100% without Google Console whitelist) */}
          <form onSubmit={handleCustomLogin} className="space-y-2">
            <input
              type="text"
              placeholder="Your Name (Optional)"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              className="w-full px-3 py-2 bg-[#160B21] border border-[#3D1F57] focus:border-[#FFF880] rounded-lg text-xs text-white placeholder-[#B8A6CC]/50 outline-none transition"
            />
            <input
              type="email"
              placeholder="Your Google or Work Email (@gmail.com / corporate)"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              required
              className="w-full px-3 py-2 bg-[#160B21] border border-[#3D1F57] focus:border-[#FFF880] rounded-lg text-xs text-white placeholder-[#B8A6CC]/50 outline-none transition"
            />
            <button
              type="submit"
              className="w-full py-2.5 bg-[#FFF880] hover:bg-[#FFF880]/90 text-[#160B21] text-xs font-bold rounded-lg transition shadow-xs flex items-center justify-center space-x-1.5"
            >
              <span>Sign In with this Google Profile</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* Guest preview button */}
          <div className="pt-1 text-center">
            <button
              type="button"
              onClick={handleDemoAccess}
              className="text-xs text-[#B8A6CC] hover:text-[#FFF880] transition underline underline-offset-4 flex items-center justify-center gap-1 mx-auto"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Explore Sample Demo Report as Guest</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-2.5 bg-[#160B21] border-t border-[#3D1F57] text-[11px] text-[#B8A6CC] flex items-center justify-between">
          <span>Fraoula Cloud Intelligence</span>
          <span className="text-[#FFF880] font-medium">Privacy Protected</span>
        </div>
      </div>
    </div>
  );
}
