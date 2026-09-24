import React, { useState } from 'react';
import {
  Plus,
  Search,
  Filter,
  Download,
  Columns,
  RefreshCw,
  Play,
  Pause,
  SlidersHorizontal,
  ChevronDown,
  Check,
  SearchIcon,
  Tv,
  Image,
  Zap,
  MoreVertical
} from 'lucide-react';

export default function CampaignsTable({ campaigns, onToggleStatus, onRefresh }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedIds, setSelectedIds] = useState([]);

  const filteredCampaigns = campaigns.filter((c) => {
    const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || c.status.toUpperCase() === statusFilter.toUpperCase();
    return matchesSearch && matchesStatus;
  });

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredCampaigns.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredCampaigns.map((c) => c.id));
    }
  };

  const toggleSelectOne = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  // Export to CSV helper
  const exportToCSV = () => {
    const headers = ['Campaign', 'Type', 'Status', 'Daily Budget', 'Impressions', 'Clicks', 'CTR', 'Avg CPC', 'Cost', 'Conversions', 'Cost / conv'];
    const rows = filteredCampaigns.map(c => [
      `"${c.name}"`,
      c.type,
      c.status,
      c.budget,
      c.impressions,
      c.clicks,
      `${c.ctr}%`,
      `$${c.avg_cpc}`,
      `$${c.cost}`,
      c.conversions,
      `$${c.cost_per_conv}`
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `google_ads_campaigns_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Calculate totals for footer
  const totalImpressions = filteredCampaigns.reduce((sum, c) => sum + (c.impressions || 0), 0);
  const totalClicks = filteredCampaigns.reduce((sum, c) => sum + (c.clicks || 0), 0);
  const totalCost = filteredCampaigns.reduce((sum, c) => sum + (c.cost || 0), 0);
  const totalConversions = filteredCampaigns.reduce((sum, c) => sum + (c.conversions || 0), 0);
  const totalAvgCpc = totalClicks ? (totalCost / totalClicks).toFixed(2) : '0.00';
  const totalCtr = totalImpressions ? ((totalClicks / totalImpressions) * 100).toFixed(2) : '0.00';
  const totalCostPerConv = totalConversions ? (totalCost / totalConversions).toFixed(2) : '0.00';

  const getTypeIcon = (type) => {
    switch (type.toLowerCase()) {
      case 'search':
        return <SearchIcon className="w-3.5 h-3.5 text-blue-600" />;
      case 'performance max':
        return <Zap className="w-3.5 h-3.5 text-purple-600" />;
      case 'display':
        return <Image className="w-3.5 h-3.5 text-emerald-600" />;
      case 'video':
        return <Tv className="w-3.5 h-3.5 text-red-600" />;
      default:
        return <SlidersHorizontal className="w-3.5 h-3.5 text-gray-500" />;
    }
  };

  return (
    <div className="bg-white rounded-lg border border-[#dadce0] shadow-sm overflow-hidden select-none">
      {/* Table Toolbar */}
      <div className="p-3 border-b border-[#dadce0] flex flex-wrap items-center justify-between gap-3 bg-white">
        <div className="flex items-center space-x-2">
          {/* Create Campaign Blue Button */}
          <button 
            className="flex items-center space-x-1.5 bg-[#1a73e8] hover:bg-[#1557b0] text-white px-3.5 py-1.5 rounded-full text-xs font-medium shadow-sm transition"
            onClick={() => alert("Creating a new campaign modal - connected to Google Ads API")}
          >
            <Plus className="w-4 h-4" />
            <span>New campaign</span>
          </button>

          {/* Search Filter */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-[#5f6368] absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Filter campaigns..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-3 py-1.5 bg-[#f1f3f4] text-xs text-[#202124] rounded-md border border-transparent focus:bg-white focus:border-[#1a73e8] outline-none w-48 transition"
            />
          </div>

          {/* Status Dropdown */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs bg-[#f1f3f4] hover:bg-gray-200 border-none rounded-md px-2.5 py-1.5 text-[#3c4043] font-medium outline-none cursor-pointer"
          >
            <option value="ALL">All campaigns ({campaigns.length})</option>
            <option value="ENABLED">Enabled only</option>
            <option value="PAUSED">Paused only</option>
          </select>
        </div>

        {/* Right Toolbar Actions */}
        <div className="flex items-center space-x-1 text-[#5f6368]">
          <button
            onClick={onRefresh}
            title="Refresh campaign metrics"
            className="p-1.5 hover:bg-[#f1f3f4] rounded-full transition"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={exportToCSV}
            title="Download CSV report"
            className="flex items-center space-x-1 text-xs hover:bg-[#f1f3f4] px-2.5 py-1.5 rounded transition font-medium"
          >
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
          <button
            title="Modify columns"
            className="p-1.5 hover:bg-[#f1f3f4] rounded-full transition"
          >
            <Columns className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Selected Action Bar */}
      {selectedIds.length > 0 && (
        <div className="bg-[#e8f0fe] px-4 py-2 border-b border-blue-200 flex items-center justify-between text-xs text-blue-900 font-medium animate-fadeIn">
          <span>{selectedIds.length} campaign(s) selected</span>
          <div className="flex items-center space-x-3">
            <button 
              onClick={() => {
                selectedIds.forEach(id => {
                  const cmp = campaigns.find(c => c.id === id);
                  if (cmp && cmp.status !== 'PAUSED') onToggleStatus(id, cmp.status);
                });
                setSelectedIds([]);
              }}
              className="px-2.5 py-1 bg-white border border-blue-300 rounded hover:bg-blue-50 text-blue-800"
            >
              Pause Selected
            </button>
            <button 
              onClick={() => {
                selectedIds.forEach(id => {
                  const cmp = campaigns.find(c => c.id === id);
                  if (cmp && cmp.status !== 'ENABLED') onToggleStatus(id, cmp.status);
                });
                setSelectedIds([]);
              }}
              className="px-2.5 py-1 bg-white border border-blue-300 rounded hover:bg-blue-50 text-blue-800"
            >
              Enable Selected
            </button>
          </div>
        </div>
      )}

      {/* Main Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-[#f8f9fa] border-b border-[#dadce0] text-[#5f6368] font-medium">
              <th className="py-2.5 px-3 w-8">
                <input
                  type="checkbox"
                  checked={filteredCampaigns.length > 0 && selectedIds.length === filteredCampaigns.length}
                  onChange={toggleSelectAll}
                  className="rounded border-[#dadce0] text-[#1a73e8] focus:ring-0 cursor-pointer"
                />
              </th>
              <th className="py-2.5 px-2 w-12 text-center">Status</th>
              <th className="py-2.5 px-3 min-w-[240px]">Campaign</th>
              <th className="py-2.5 px-3">Budget</th>
              <th className="py-2.5 px-3 text-center">Opt. score</th>
              <th className="py-2.5 px-3 text-right">Impr.</th>
              <th className="py-2.5 px-3 text-right">Clicks</th>
              <th className="py-2.5 px-3 text-right">CTR</th>
              <th className="py-2.5 px-3 text-right">Avg. CPC</th>
              <th className="py-2.5 px-3 text-right">Cost</th>
              <th className="py-2.5 px-3 text-right">Conv.</th>
              <th className="py-2.5 px-3 text-right">Cost / conv.</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#dadce0]">
            {filteredCampaigns.length === 0 ? (
              <tr>
                <td colSpan="12" className="py-8 text-center text-[#5f6368]">
                  No campaigns found matching filter.
                </td>
              </tr>
            ) : (
              filteredCampaigns.map((c) => {
                const isSelected = selectedIds.includes(c.id);
                const isEnabled = c.status.toUpperCase() === 'ENABLED';

                return (
                  <tr 
                    key={c.id} 
                    className={`hover:bg-[#f8f9fa] transition ${isSelected ? 'bg-blue-50/40' : ''}`}
                  >
                    <td className="py-3 px-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelectOne(c.id)}
                        className="rounded border-[#dadce0] text-[#1a73e8] focus:ring-0 cursor-pointer"
                      />
                    </td>

                    {/* Status Toggle Dot */}
                    <td className="py-3 px-2 text-center">
                      <button
                        onClick={() => onToggleStatus(c.id, c.status)}
                        title={isEnabled ? "Click to Pause" : "Click to Enable"}
                        className="p-1 rounded-full hover:bg-gray-200 transition"
                      >
                        {isEnabled ? (
                          <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block ring-2 ring-emerald-100" />
                        ) : (
                          <span className="w-3 h-3 rounded-full bg-gray-400 inline-block ring-2 ring-gray-100" />
                        )}
                      </button>
                    </td>

                    {/* Campaign Name & Type */}
                    <td className="py-3 px-3">
                      <div className="flex items-center space-x-2">
                        <span className="p-1 bg-gray-100 rounded" title={c.type}>
                          {getTypeIcon(c.type)}
                        </span>
                        <div>
                          <div className="font-medium text-[#1a73e8] hover:underline cursor-pointer">
                            {c.name}
                          </div>
                          <div className="text-[11px] text-[#5f6368] flex items-center space-x-1.5 mt-0.5">
                            <span>{c.type}</span>
                            <span>•</span>
                            <span className="truncate max-w-[200px]">{c.bidding_strategy}</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Daily Budget */}
                    <td className="py-3 px-3 text-[#202124]">
                      <div className="font-medium">${Number(c.budget).toFixed(2)}/day</div>
                    </td>

                    {/* Optimization Score */}
                    <td className="py-3 px-3 text-center">
                      <div className="inline-flex items-center space-x-1 bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded-full font-semibold text-[11px]">
                        <span>{c.opt_score || 85}%</span>
                      </div>
                    </td>

                    {/* Impressions */}
                    <td className="py-3 px-3 text-right text-[#202124]">
                      {Number(c.impressions).toLocaleString()}
                    </td>

                    {/* Clicks */}
                    <td className="py-3 px-3 text-right font-medium text-[#202124]">
                      {Number(c.clicks).toLocaleString()}
                    </td>

                    {/* CTR */}
                    <td className="py-3 px-3 text-right text-[#202124]">
                      {Number(c.ctr).toFixed(2)}%
                    </td>

                    {/* Avg CPC */}
                    <td className="py-3 px-3 text-right text-[#202124]">
                      ${Number(c.avg_cpc).toFixed(2)}
                    </td>

                    {/* Cost */}
                    <td className="py-3 px-3 text-right font-medium text-[#202124]">
                      ${Number(c.cost).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>

                    {/* Conversions */}
                    <td className="py-3 px-3 text-right font-medium text-purple-700">
                      {Number(c.conversions).toFixed(1)}
                    </td>

                    {/* Cost / Conv */}
                    <td className="py-3 px-3 text-right text-[#202124]">
                      ${Number(c.cost_per_conv).toFixed(2)}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>

          {/* Table Summary Footer */}
          <tfoot>
            <tr className="bg-[#f1f3f4] font-semibold text-[#202124] border-t-2 border-[#dadce0]">
              <td className="py-3 px-3"></td>
              <td className="py-3 px-2 text-center text-[#5f6368]">Total</td>
              <td className="py-3 px-3">Total: {filteredCampaigns.length} campaigns</td>
              <td className="py-3 px-3">—</td>
              <td className="py-3 px-3 text-center">—</td>
              <td className="py-3 px-3 text-right">{totalImpressions.toLocaleString()}</td>
              <td className="py-3 px-3 text-right">{totalClicks.toLocaleString()}</td>
              <td className="py-3 px-3 text-right">{totalCtr}%</td>
              <td className="py-3 px-3 text-right">${totalAvgCpc}</td>
              <td className="py-3 px-3 text-right">${totalCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
              <td className="py-3 px-3 text-right text-purple-800">{totalConversions.toFixed(1)}</td>
              <td className="py-3 px-3 text-right">${totalCostPerConv}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
