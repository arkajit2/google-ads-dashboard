import React, { useState } from 'react';
import { 
  Search, 
  HelpCircle, 
  Bell, 
  Settings, 
  Wrench, 
  CreditCard, 
  BarChart2, 
  ChevronDown, 
  LogOut, 
  User, 
  Sparkles,
  ExternalLink
} from 'lucide-react';

export default function Navbar({ user, onSignInClick, onSignOut }) {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showAccountDropdown, setShowAccountDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <header className="h-16 bg-[#ffffff] border-b border-[#dadce0] flex items-center justify-between px-4 sticky top-0 z-50 select-none">
      {/* Left: Google Ads Logo & Account Switcher */}
      <div className="flex items-center space-x-3">
        {/* Google Ads Brand Logo */}
        <div className="flex items-center space-x-2 cursor-pointer pr-3 border-r border-[#dadce0]">
          <div className="w-8 h-8 flex items-center justify-center">
            {/* Authentic Google Ads icon */}
            <svg viewBox="0 0 192 192" className="w-7 h-7" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M174.4 97.4L98.7 21.7C93.6 16.6 85.3 16.6 80.2 21.7L42.4 59.5C37.3 64.6 37.3 72.9 42.4 78L118.1 153.7C123.2 158.8 131.5 158.8 136.6 153.7L174.4 115.9C179.5 110.8 179.5 102.5 174.4 97.4Z" fill="#FBBC04"/>
              <path d="M42.4 78C37.3 72.9 37.3 64.6 42.4 59.5L80.2 21.7C85.3 16.6 93.6 16.6 98.7 21.7L174.4 97.4C179.5 102.5 179.5 110.8 174.4 115.9L136.6 153.7C131.5 158.8 123.2 158.8 118.1 153.7L42.4 78Z" fill="#FBBC04"/>
              <circle cx="56" cy="136" r="32" fill="#4285F4"/>
              <path d="M145.8 163.6L174.4 115.9C179.5 110.8 179.5 102.5 174.4 97.4L98.7 21.7C93.6 16.6 85.3 16.6 80.2 21.7L42.4 59.5C37.3 64.6 37.3 72.9 42.4 78L118.1 153.7C123.2 158.8 131.5 158.8 136.6 153.7L145.8 163.6Z" fill="#34A853"/>
            </svg>
          </div>
          <div className="flex flex-col">
            <span className="text-[#3c4043] font-medium text-[17px] tracking-tight leading-none">
              Google <span className="text-[#5f6368] font-normal">Ads</span>
            </span>
          </div>
        </div>

        {/* Account Selector Dropdown */}
        <div className="relative">
          <button 
            onClick={() => setShowAccountDropdown(!showAccountDropdown)}
            className="flex items-center space-x-2 px-3 py-1.5 rounded hover:bg-[#f1f3f4] text-left transition"
          >
            <div className="flex flex-col">
              <span className="text-[13px] font-medium text-[#202124] max-w-[200px] truncate">
                {user ? user.account_name : "Acme Digital Growth"}
              </span>
              <span className="text-[11px] text-[#5f6368] flex items-center gap-1">
                <span>{user ? user.account_id : "482-910-2391"}</span>
                <span className="text-gray-300">•</span>
                <span className="text-emerald-700 font-medium">Standard</span>
              </span>
            </div>
            <ChevronDown className="w-4 h-4 text-[#5f6368]" />
          </button>

          {showAccountDropdown && (
            <div className="absolute top-12 left-0 w-72 bg-white rounded-md shadow-lg border border-[#dadce0] p-2 z-50 text-sm">
              <div className="px-3 py-2 text-xs font-semibold text-[#5f6368] uppercase tracking-wider">
                Active Ad Account
              </div>
              <div className="p-2 bg-blue-50/70 border border-blue-100 rounded flex items-center justify-between">
                <div>
                  <p className="font-medium text-blue-900">{user ? user.account_name : "Acme Digital Growth"}</p>
                  <p className="text-xs text-blue-700">{user ? user.account_id : "482-910-2391"}</p>
                </div>
                <span className="text-[10px] bg-blue-600 text-white px-2 py-0.5 rounded font-medium">Current</span>
              </div>
              <div className="mt-2 pt-2 border-t border-[#dadce0]">
                <button 
                  onClick={() => setShowAccountDropdown(false)}
                  className="w-full text-left px-3 py-2 text-xs text-[#1a73e8] hover:bg-gray-50 rounded flex items-center justify-between"
                >
                  Manage manager accounts
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Middle: Universal Search Bar */}
      <div className="flex-1 max-w-2xl mx-6 hidden md:block">
        <div className="relative flex items-center">
          <Search className="w-4 h-4 text-[#5f6368] absolute left-3.5 pointer-events-none" />
          <input
            type="text"
            placeholder="Search campaigns, tools, reports, and keywords (/)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-20 py-2 bg-[#f1f3f4] focus:bg-white text-sm text-[#202124] rounded-full border border-transparent focus:border-[#1a73e8] focus:shadow-md outline-none transition"
          />
          <span className="absolute right-3 text-[11px] text-[#5f6368] bg-[#dadce0]/50 px-1.5 py-0.5 rounded">
            Ctrl + /
          </span>
        </div>
      </div>

      {/* Right: Tools, Help, Notifications & User Sign In */}
      <div className="flex items-center space-x-1 sm:space-x-2">
        {/* Reports */}
        <button 
          title="Reports" 
          className="p-2 text-[#5f6368] hover:text-[#202124] hover:bg-[#f1f3f4] rounded-full transition"
        >
          <BarChart2 className="w-5 h-5" />
        </button>

        {/* Tools and settings */}
        <button 
          title="Tools and settings" 
          className="p-2 text-[#5f6368] hover:text-[#202124] hover:bg-[#f1f3f4] rounded-full transition hidden sm:inline-flex"
        >
          <Wrench className="w-5 h-5" />
        </button>

        {/* Billing */}
        <button 
          title="Billing and payments" 
          className="p-2 text-[#5f6368] hover:text-[#202124] hover:bg-[#f1f3f4] rounded-full transition hidden sm:inline-flex"
        >
          <CreditCard className="w-5 h-5" />
        </button>

        {/* Refresh / Help */}
        <button 
          title="Help" 
          className="p-2 text-[#5f6368] hover:text-[#202124] hover:bg-[#f1f3f4] rounded-full transition"
        >
          <HelpCircle className="w-5 h-5" />
        </button>

        {/* Notifications */}
        <button 
          title="Notifications" 
          className="p-2 text-[#5f6368] hover:text-[#202124] hover:bg-[#f1f3f4] rounded-full transition relative"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#ea4335] rounded-full"></span>
        </button>

        {/* User Account / Google Sign In */}
        <div className="relative ml-2">
          {user ? (
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center space-x-2 p-1 rounded-full hover:ring-2 hover:ring-[#1a73e8]/30 transition"
            >
              {user.picture ? (
                <img
                  src={user.picture}
                  alt={user.name}
                  className="w-8 h-8 rounded-full border border-gray-200 object-cover"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-[#1a73e8] text-white flex items-center justify-center font-medium text-sm">
                  {user.name ? user.name[0].toUpperCase() : 'G'}
                </div>
              )}
            </button>
          ) : (
            <button
              onClick={onSignInClick}
              className="flex items-center space-x-2 px-3.5 py-1.5 rounded border border-[#dadce0] hover:bg-[#f8f9fa] text-[#1a73e8] font-medium text-xs tracking-wide shadow-sm hover:shadow transition"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>Sign in with Google</span>
            </button>
          )}

          {/* Profile Dropdown */}
          {showProfileMenu && user && (
            <div className="absolute right-0 top-11 w-80 bg-white rounded-lg shadow-xl border border-[#dadce0] p-4 z-50">
              <div className="flex items-center space-x-3 pb-3 border-b border-[#dadce0]">
                {user.picture ? (
                  <img src={user.picture} alt="" className="w-12 h-12 rounded-full" />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-[#1a73e8] text-white flex items-center justify-center text-lg font-medium">
                    {user.name ? user.name[0] : 'G'}
                  </div>
                )}
                <div className="overflow-hidden">
                  <p className="font-semibold text-sm text-[#202124] truncate">{user.name}</p>
                  <p className="text-xs text-[#5f6368] truncate">{user.email}</p>
                  <span className="inline-block mt-1 text-[10px] px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-medium">
                    Connected via Google OAuth
                  </span>
                </div>
              </div>

              <div className="py-2 text-xs space-y-1">
                <div className="p-2 hover:bg-gray-50 rounded flex justify-between">
                  <span className="text-[#5f6368]">Customer ID:</span>
                  <span className="font-medium text-[#202124]">{user.account_id || "482-910-2391"}</span>
                </div>
                <div className="p-2 hover:bg-gray-50 rounded flex justify-between">
                  <span className="text-[#5f6368]">Account Type:</span>
                  <span className="font-medium text-[#202124]">Advertiser standard</span>
                </div>
              </div>

              <div className="pt-2 border-t border-[#dadce0]">
                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    onSignOut();
                  }}
                  className="w-full flex items-center justify-center space-x-2 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 rounded transition"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign out of Google Account</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
