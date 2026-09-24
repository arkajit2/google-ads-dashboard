import React, { useState } from 'react';
import { 
  BarChart3, 
  LogOut, 
  User, 
  ChevronDown, 
  Search, 
  ShieldCheck, 
  Sparkles 
} from 'lucide-react';

export default function Navbar({ user, onSignInClick, onSignOut }) {
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  return (
    <header className="h-16 bg-[#221230] border-b border-[#3D1F57] flex items-center justify-between px-4 sm:px-6 sticky top-0 z-50 select-none shadow-sm">
      {/* Left: Fraoula Ad Reports Branding */}
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2.5">
          {/* Fraoula Plum & Yellow Brand Emblem */}
          <div className="w-8 h-8 rounded-lg bg-[#3D1B4F] border border-[#FFF880]/30 flex items-center justify-center shadow-xs">
            <span className="w-3.5 h-3.5 rounded-full bg-[#FFF880] inline-block shadow-[0_0_8px_#FFF880]"></span>
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-bold text-base text-[#FFF880] tracking-tight">Fraoula</span>
              <span className="text-xs uppercase tracking-wider px-1.5 py-0.5 rounded bg-[#3D1F57] text-[#B8A6CC] font-semibold">
                Ad Reports
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Middle: Universal Search / Filter hint */}
      <div className="hidden md:flex items-center space-x-2 bg-[#160B21] border border-[#3D1F57] px-3.5 py-1.5 rounded-lg text-xs text-[#B8A6CC] w-72">
        <Search className="w-3.5 h-3.5 text-[#B8A6CC]" />
        <span className="truncate">Search campaign performance reports...</span>
      </div>

      {/* Right: User Login & Profile */}
      <div className="flex items-center space-x-3">
        {user ? (
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-[#160B21] hover:bg-[#2D1840] border border-[#3D1F57] transition"
            >
              {user.picture ? (
                <img
                  src={user.picture}
                  alt={user.name}
                  className="w-6 h-6 rounded-full border border-[#FFF880]/40 object-cover"
                />
              ) : (
                <div className="w-6 h-6 rounded-full bg-[#3D1B4F] text-[#FFF880] flex items-center justify-center font-bold text-xs">
                  {user.name ? user.name[0].toUpperCase() : 'U'}
                </div>
              )}
              <span className="text-xs font-medium text-white max-w-[120px] truncate hidden sm:inline">
                {user.name}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-[#B8A6CC]" />
            </button>

            {/* Profile Dropdown */}
            {showProfileMenu && (
              <div className="absolute right-0 top-11 w-72 bg-[#221230] rounded-xl shadow-2xl border border-[#3D1F57] p-3 z-50 text-xs">
                <div className="flex items-center space-x-3 pb-3 border-b border-[#3D1F57]">
                  {user.picture ? (
                    <img src={user.picture} alt="" className="w-10 h-10 rounded-full border border-[#FFF880]/30" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-[#3D1B4F] text-[#FFF880] flex items-center justify-center text-sm font-bold">
                      {user.name ? user.name[0] : 'U'}
                    </div>
                  )}
                  <div className="overflow-hidden">
                    <p className="font-semibold text-white truncate">{user.name}</p>
                    <p className="text-[11px] text-[#B8A6CC] truncate">{user.email}</p>
                    <span className="inline-block mt-1 text-[10px] px-2 py-0.2 rounded-full bg-[#3D1B4F] text-[#FFF880] font-medium border border-[#FFF880]/20">
                      Authenticated Google Account
                    </span>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      onSignOut();
                    }}
                    className="w-full flex items-center justify-center space-x-2 px-3 py-2 text-xs font-medium text-rose-300 hover:bg-rose-950/40 rounded-lg transition"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign out of session</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={onSignInClick}
            className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-[#FFF880] hover:bg-[#FFF880]/90 text-[#160B21] font-semibold text-xs transition shadow-[0_0_12px_rgba(255,248,128,0.25)]"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            <span>Sign In with Google</span>
          </button>
        )}
      </div>
    </header>
  );
}
