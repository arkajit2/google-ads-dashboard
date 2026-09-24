import React from 'react';
import {
  LayoutDashboard,
  Sparkles,
  TrendingUp,
  Layers,
  FolderKanban,
  FileText,
  Globe,
  KeyRound,
  Users,
  Sliders,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

const NAV_ITEMS = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'recommendations', label: 'Recommendations', icon: Sparkles, badge: '88%' },
  { id: 'insights', label: 'Insights and reports', icon: TrendingUp },
  { id: 'campaigns', label: 'Campaigns', icon: Layers },
  { id: 'adgroups', label: 'Ad groups', icon: FolderKanban },
  { id: 'ads', label: 'Ads & assets', icon: FileText },
  { id: 'landing_pages', label: 'Landing pages', icon: Globe },
  { id: 'keywords', label: 'Keywords', icon: KeyRound },
  { id: 'audiences', label: 'Audiences', icon: Users },
  { id: 'settings', label: 'Settings', icon: Sliders },
];

export default function Sidebar({ activeTab, setActiveTab, collapsed, setCollapsed }) {
  return (
    <aside 
      className={`bg-white border-r border-[#dadce0] flex flex-col justify-between transition-all duration-200 select-none z-30 ${
        collapsed ? 'w-16' : 'w-56'
      }`}
      style={{ minHeight: 'calc(100vh - 64px)' }}
    >
      {/* Top Nav links */}
      <div className="py-2">
        <div className="space-y-0.5 px-2">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                title={collapsed ? item.label : undefined}
                className={`w-full flex items-center rounded-r-full text-xs font-medium transition py-2.5 px-3 relative ${
                  isActive
                    ? 'bg-[#e8f0fe] text-[#1a73e8] font-semibold'
                    : 'text-[#3c4043] hover:bg-[#f1f3f4] hover:text-[#202124]'
                } ${collapsed ? 'justify-center rounded-lg' : ''}`}
              >
                {/* Active indicator bar */}
                {isActive && !collapsed && (
                  <span className="absolute left-0 top-0 bottom-0 w-1 bg-[#1a73e8] rounded-r"></span>
                )}

                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#1a73e8]' : 'text-[#5f6368]'}`} />

                {!collapsed && (
                  <div className="flex items-center justify-between flex-1 ml-3 overflow-hidden">
                    <span className="truncate">{item.label}</span>
                    {item.badge && (
                      <span className="ml-1 px-1.5 py-0.2 text-[10px] font-bold rounded-full bg-emerald-100 text-emerald-800">
                        {item.badge}
                      </span>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Collapse Toggle Footer */}
      <div className="p-2 border-t border-[#dadce0]">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center p-2 text-[#5f6368] hover:text-[#202124] hover:bg-[#f1f3f4] rounded transition"
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <div className="flex items-center space-x-2 text-xs">
              <ChevronLeft className="w-4 h-4" />
              <span>Collapse sidebar</span>
            </div>
          )}
        </button>
      </div>
    </aside>
  );
}
