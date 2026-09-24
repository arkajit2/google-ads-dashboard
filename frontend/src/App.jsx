import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import MetricCards from './components/MetricCards';
import PerformanceChart from './components/PerformanceChart';
import CampaignsTable from './components/CampaignsTable';
import RecommendationsCard from './components/RecommendationsCard';
import DateRangePicker from './components/DateRangePicker';
import AuthModal from './components/AuthModal';
import { 
  fetchSummaryMetrics, 
  fetchTimeseriesData, 
  fetchCampaigns, 
  toggleCampaignStatus 
} from './services/api';
import { 
  Layers, 
  TrendingUp, 
  BarChart, 
  Target, 
  Settings as SettingsIcon,
  HelpCircle,
  AlertTriangle,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  
  // Authenticated user state
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('google_ads_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Dashboard Data State
  const [summary, setSummary] = useState(null);
  const [timeseries, setTimeseries] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [selectedDays, setSelectedDays] = useState(30);
  const [loading, setLoading] = useState(true);

  // Chart Metric Selectors
  const [primaryMetric, setPrimaryMetric] = useState('clicks');
  const [secondaryMetric, setSecondaryMetric] = useState('impressions');

  // Load Dashboard Data
  const loadData = async (days = selectedDays) => {
    setLoading(true);
    try {
      const [sumData, tsData, cmpData] = await Promise.all([
        fetchSummaryMetrics(),
        fetchTimeseriesData(days),
        fetchCampaigns()
      ]);
      setSummary(sumData);
      setTimeseries(tsData);
      setCampaigns(cmpData);
    } catch (err) {
      console.error("Failed to load dashboard data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(selectedDays);
  }, [selectedDays]);

  const handleLoginSuccess = (profile) => {
    setUser(profile);
    localStorage.setItem('google_ads_user', JSON.stringify(profile));
  };

  const handleSignOut = () => {
    setUser(null);
    localStorage.removeItem('google_ads_user');
  };

  const handleToggleCampaignStatus = async (id, currentStatus) => {
    // Optimistic UI update
    const nextStatus = currentStatus === 'ENABLED' ? 'PAUSED' : 'ENABLED';
    setCampaigns(prev => prev.map(c => c.id === id ? { ...c, status: nextStatus } : c));
    await toggleCampaignStatus(id, currentStatus);
  };

  const handleMetricCardClick = (metricKey) => {
    if (primaryMetric === metricKey) return;
    if (secondaryMetric === metricKey) {
      setSecondaryMetric(primaryMetric);
      setPrimaryMetric(metricKey);
    } else {
      setSecondaryMetric(primaryMetric);
      setPrimaryMetric(metricKey);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex flex-col text-[#202124]">
      {/* Top Google Ads Header */}
      <Navbar
        user={user}
        onSignInClick={() => setIsAuthModalOpen(true)}
        onSignOut={handleSignOut}
      />

      {/* Main Container with Sidebar + Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Google Ads Sidebar */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          collapsed={sidebarCollapsed}
          setCollapsed={setSidebarCollapsed}
        />

        {/* Content Body */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {/* Subheader: Page title & Date Range Picker */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl sm:text-2xl font-normal text-[#202124]">
                  {activeTab === 'overview' && 'Campaigns Overview'}
                  {activeTab === 'recommendations' && 'Optimization Recommendations'}
                  {activeTab === 'insights' && 'Insights and Auction Reports'}
                  {activeTab === 'campaigns' && 'All Campaigns'}
                  {activeTab === 'adgroups' && 'Ad Groups'}
                  {activeTab === 'ads' && 'Ads & Assets'}
                  {activeTab === 'landing_pages' && 'Landing Pages'}
                  {activeTab === 'keywords' && 'Keywords'}
                  {activeTab === 'audiences' && 'Audience Segments'}
                  {activeTab === 'settings' && 'Account Settings'}
                </h1>
                {loading && <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />}
              </div>
              <p className="text-xs text-[#5f6368] mt-1">
                Account ID: <span className="font-medium text-gray-700">{user?.account_id || "482-910-2391"}</span> • Currency: USD ($)
              </p>
            </div>

            {/* Date Range Selector */}
            <DateRangePicker
              selectedDays={selectedDays}
              onSelectDays={(days) => setSelectedDays(days)}
            />
          </div>

          {/* Prompt banner for unauthenticated visitors */}
          {!user && (
            <div className="mb-6 p-4 bg-[#e8f0fe] border border-blue-200 rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
              <div className="flex items-start sm:items-center space-x-3">
                <div className="p-2 bg-blue-600 text-white rounded-full">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-blue-900">
                    Sign in with your Google profile
                  </h3>
                  <p className="text-xs text-blue-800">
                    Sign in to associate your personal Google identity with this advertising workspace and view customized insights.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="px-4 py-1.5 bg-[#1a73e8] hover:bg-[#1557b0] text-white rounded-md text-xs font-semibold shadow-xs transition shrink-0"
              >
                Sign in now
              </button>
            </div>
          )}

          {/* TAB: OVERVIEW */}
          {activeTab === 'overview' && (
            <>
              {/* Scorecard Metric Tiles */}
              <MetricCards
                summary={summary}
                primaryMetric={primaryMetric}
                secondaryMetric={secondaryMetric}
                onSelectMetric={handleMetricCardClick}
              />

              {/* Dual Metric Time Series Performance Chart */}
              <PerformanceChart
                data={timeseries}
                primaryMetric={primaryMetric}
                setPrimaryMetric={setPrimaryMetric}
                secondaryMetric={secondaryMetric}
                setSecondaryMetric={setSecondaryMetric}
              />

              {/* Optimization Score & AI Recommendations */}
              <RecommendationsCard score={summary?.optimization_score || 88.4} />

              {/* High-Fidelity Campaigns Data Table */}
              <div className="mt-6">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-base font-medium text-[#202124]">Campaign performance</h2>
                  <span className="text-xs text-[#5f6368]">Showing {campaigns.length} campaigns</span>
                </div>
                <CampaignsTable
                  campaigns={campaigns}
                  onToggleStatus={handleToggleCampaignStatus}
                  onRefresh={() => loadData(selectedDays)}
                />
              </div>
            </>
          )}

          {/* TAB: RECOMMENDATIONS */}
          {activeTab === 'recommendations' && (
            <div className="space-y-6">
              <RecommendationsCard score={summary?.optimization_score || 88.4} />
              <div className="bg-white rounded-lg border border-[#dadce0] p-6 text-center py-12">
                <Target className="w-12 h-12 text-[#1a73e8] mx-auto mb-3" />
                <h3 className="text-base font-semibold text-gray-900">All current recommendations are analyzed</h3>
                <p className="text-xs text-[#5f6368] max-w-md mx-auto mt-1">
                  Google AI continually evaluates auction competition, budget efficiency, and keyword bids to maximize return on ad spend (ROAS).
                </p>
              </div>
            </div>
          )}

          {/* TAB: CAMPAIGNS */}
          {activeTab === 'campaigns' && (
            <CampaignsTable
              campaigns={campaigns}
              onToggleStatus={handleToggleCampaignStatus}
              onRefresh={() => loadData(selectedDays)}
            />
          )}

          {/* TAB: INSIGHTS & REPORTS */}
          {activeTab === 'insights' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white border border-[#dadce0] rounded-lg p-5">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Top Search Themes & Queries</h3>
                <div className="space-y-2 text-xs">
                  {[
                    { term: "cloud automation platform", volume: "14.2K searches", cpc: "$1.84", convRate: "8.4%" },
                    { term: "enterprise ad campaign manager", volume: "9.8K searches", cpc: "$2.10", convRate: "7.1%" },
                    { term: "google ads reporting dashboard", volume: "8.5K searches", cpc: "$1.45", convRate: "9.2%" },
                    { term: "ai advertising optimization", volume: "6.9K searches", cpc: "$1.95", convRate: "6.8%" },
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2.5 bg-gray-50 rounded">
                      <span className="font-medium text-blue-700">{item.term}</span>
                      <div className="flex items-center space-x-3 text-gray-600">
                        <span>{item.volume}</span>
                        <span className="font-semibold text-gray-800">{item.cpc}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white border border-[#dadce0] rounded-lg p-5">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Device Breakdown</h3>
                <div className="space-y-3 text-xs">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="font-medium text-gray-700">Mobile phones</span>
                      <span className="font-bold text-gray-900">58.4% (15,972 clicks)</span>
                    </div>
                    <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                      <div className="bg-blue-600 h-full rounded-full" style={{ width: '58.4%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="font-medium text-gray-700">Computers (Desktop)</span>
                      <span className="font-bold text-gray-900">37.2% (10,174 clicks)</span>
                    </div>
                    <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                      <div className="bg-green-600 h-full rounded-full" style={{ width: '37.2%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="font-medium text-gray-700">Tablets</span>
                      <span className="font-bold text-gray-900">4.4% (1,204 clicks)</span>
                    </div>
                    <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                      <div className="bg-amber-500 h-full rounded-full" style={{ width: '4.4%' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* OTHER TABS (Settings, Keywords, Ad groups) */}
          {(activeTab === 'adgroups' || activeTab === 'ads' || activeTab === 'landing_pages' || activeTab === 'keywords' || activeTab === 'audiences' || activeTab === 'settings') && (
            <div className="bg-white border border-[#dadce0] rounded-lg p-8 text-center">
              <Layers className="w-12 h-12 text-[#1a73e8] mx-auto mb-3" />
              <h3 className="text-base font-semibold text-gray-900 capitalize">{activeTab.replace('_', ' ')} Management</h3>
              <p className="text-xs text-[#5f6368] max-w-md mx-auto mt-2">
                This section connects directly to your Google Ads account configuration. All performance metrics reflect your live account data.
              </p>
              <button 
                onClick={() => setActiveTab('overview')}
                className="mt-4 px-4 py-1.5 bg-[#1a73e8] text-white rounded text-xs font-semibold hover:bg-blue-700 transition"
              >
                Back to Overview Dashboard
              </button>
            </div>
          )}
        </main>
      </div>

      {/* Authentication Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />
    </div>
  );
}
