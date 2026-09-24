import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import MetricCards from './components/MetricCards';
import PerformanceChart from './components/PerformanceChart';
import CampaignsTable from './components/CampaignsTable';
import AuthModal from './components/AuthModal';
import { 
  fetchSummaryMetrics, 
  fetchTimeseriesData, 
  fetchCampaigns,
  syncGoogleAdsWithEdge
} from './services/api';
import { 
  BarChart3, 
  ShieldCheck, 
  Calendar, 
  Sparkles, 
  RefreshCw,
  TrendingUp,
  Layers,
  ArrowUpRight,
  Info,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export default function App() {
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
  const [loading, setLoading] = useState(false);

  // Chart Metric Selectors
  const [primaryMetric, setPrimaryMetric] = useState('clicks');
  const [secondaryMetric, setSecondaryMetric] = useState('impressions');

  // Load Data
  const loadData = async (currentUser = user) => {
    setLoading(true);
    try {
      if (currentUser?.is_live && currentUser?.access_token) {
        // Fetch live from Google Ads API
        const devToken = localStorage.getItem('google_ads_dev_token') || '';
        const res = await syncGoogleAdsWithEdge(currentUser.access_token, currentUser.customer_id || '', devToken);
        if (res && res.success) {
          setCampaigns(res.campaigns || []);
          if (res.summary) setSummary(res.summary);
          return;
        }
      }

      // Default sample view for preview
      const [sumData, tsData, cmpData] = await Promise.all([
        fetchSummaryMetrics(),
        fetchTimeseriesData(selectedDays),
        fetchCampaigns()
      ]);
      setSummary(sumData);
      setTimeseries(tsData);
      setCampaigns(cmpData);
    } catch (err) {
      console.error("Failed to load reporting data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(user);
  }, [user, selectedDays]);

  const handleLoginSuccess = (profile) => {
    setUser(profile);
    localStorage.setItem('google_ads_user', JSON.stringify(profile));
    if (profile.campaigns) setCampaigns(profile.campaigns);
    if (profile.summary) setSummary(profile.summary);
  };

  const handleSignOut = () => {
    setUser(null);
    localStorage.removeItem('google_ads_user');
    window.location.reload();
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
    <div className="min-h-screen bg-[#160B21] text-white flex flex-col font-sans">
      {/* Fraoula Header */}
      <Navbar
        user={user}
        onSignInClick={() => setIsAuthModalOpen(true)}
        onSignOut={handleSignOut}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-6 lg:p-8 space-y-6">
        
        {/* Subheader: Reporting Cycle & Status */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-2 border-b border-[#3D1F57]">
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                Live Google Ads Performance Intelligence
              </h1>
              {loading && <RefreshCw className="w-4 h-4 text-[#FFF880] animate-spin" />}
            </div>
            <p className="text-xs text-[#B8A6CC] mt-1">
              Reporting Cycle: <span className="text-[#FFF880] font-semibold">Last 30 Days</span> • Account: {user ? (user.customer_id || user.email) : "Preview Sample"}
            </p>
          </div>

          {/* User Status Badge */}
          <div className="flex items-center space-x-2">
            {user ? (
              <div className="flex items-center space-x-2 bg-[#221230] border border-emerald-800/60 px-3 py-1.5 rounded-lg text-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                <span className="text-emerald-300 font-medium">Connected: {user.name || user.email}</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2 bg-[#221230] border border-[#3D1F57] px-3 py-1.5 rounded-lg text-xs">
                <span className="w-2 h-2 rounded-full bg-[#FFF880]"></span>
                <span className="text-[#B8A6CC]">Preview Mode (Sample Report)</span>
              </div>
            )}
          </div>
        </div>

        {/* Unauthenticated Visitor Preview Banner */}
        {!user && (
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#221230] via-[#2A1535] to-[#1F0E2E] border border-[#FFF880]/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg">
            <div className="flex items-start sm:items-center space-x-3.5">
              <div className="p-2.5 rounded-xl bg-[#3D1B4F] text-[#FFF880] border border-[#FFF880]/40 shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#FFF880]">
                  Viewing Sample Performance Report (Not Signed In)
                </h3>
                <p className="text-xs text-[#B8A6CC] mt-0.5 leading-relaxed">
                  Sign in with your personal or client Google profile to load your real Google Ads account campaigns, clicks, and spend.
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="px-5 py-2 rounded-xl bg-[#FFF880] hover:bg-[#FFF880]/90 text-[#160B21] text-xs font-bold transition shadow-[0_0_15px_rgba(255,248,128,0.25)] shrink-0 flex items-center space-x-1.5 cursor-pointer"
            >
              <span>Connect with Google Ads</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Live Authenticated Banner */}
        {user && user.needs_developer_token && (
          <div className="p-4 rounded-xl bg-[#221230] border border-amber-500/40 flex items-start space-x-3 text-xs">
            <Info className="w-4 h-4 text-[#FFF880] shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold text-white">
                Google Ads Account Authorized for <span className="text-[#FFF880]">{user.name}</span> ({user.email})
              </p>
              <p className="text-[#B8A6CC] leading-relaxed">
                Google OAuth access token is active. To execute live production queries against Google's API servers (`googleads.googleapis.com`), Google requires a Developer Token from a Google Ads Manager (MCC) Account.
              </p>
            </div>
          </div>
        )}

        {/* Metric Summary Scorecards (Fraoula Plum & Yellow) */}
        <MetricCards
          summary={summary}
          primaryMetric={primaryMetric}
          secondaryMetric={secondaryMetric}
          onSelectMetric={handleMetricCardClick}
        />

        {/* Dual Axis Performance Time Series Chart */}
        <PerformanceChart
          data={timeseries}
          primaryMetric={primaryMetric}
          setPrimaryMetric={setPrimaryMetric}
          secondaryMetric={secondaryMetric}
          setSecondaryMetric={setSecondaryMetric}
        />

        {/* Campaign Reporting Breakdown Table */}
        <CampaignsTable
          campaigns={campaigns}
          onRefresh={() => loadData(user)}
        />

      </main>

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />
    </div>
  );
}
