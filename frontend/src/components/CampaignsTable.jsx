import React, { useState } from 'react';
import { 
  Search, 
  Download, 
  RefreshCw, 
  Layers, 
  TrendingUp, 
  CheckCircle2, 
  PauseCircle 
} from 'lucide-react';

export default function CampaignsTable({ campaigns, onRefresh }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const filteredCampaigns = campaigns.filter((c) => {
    const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || c.status.toUpperCase() === statusFilter.toUpperCase();
    return matchesSearch && matchesStatus;
  });

  // Export to CSV
  const exportToCSV = () => {
    const headers = ['Campaign', 'Type', 'Status', 'Daily Budget', 'Impressions', 'Clicks', 'CTR', 'Avg CPC', 'Cost', 'Conversions'];
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
      c.conversions
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `ad_performance_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const totalImpressions = filteredCampaigns.reduce((sum, c) => sum + (c.impressions || 0), 0);
  const totalClicks = filteredCampaigns.reduce((sum, c) => sum + (c.clicks || 0), 0);
  const totalCost = filteredCampaigns.reduce((sum, c) => sum + (c.cost || 0), 0);
  const totalConversions = filteredCampaigns.reduce((sum, c) => sum + (c.conversions || 0), 0);
  const totalAvgCpc = totalClicks ? (totalCost / totalClicks).toFixed(2) : '0.00';
  const totalCtr = totalImpressions ? ((totalClicks / totalImpressions) * 100).toFixed(2) : '0.00';

  return (
    <div className="bg-[#221230] rounded-2xl border border-[#3D1F57] shadow-sm overflow-hidden select-none">
      {/* Table Toolbar */}
      <div className="p-4 border-b border-[#3D1F57] flex flex-wrap items-center justify-between gap-3 bg-[#221230]">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-sm text-white">Campaign Performance Breakdown</span>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#160B21] text-[#FFF880] border border-[#3D1F57]">
              {filteredCampaigns.length} Active
            </span>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-[#B8A6CC] absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Filter by ad group or campaign..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-3 py-1.5 bg-[#160B21] text-xs text-white rounded-lg border border-[#3D1F57] focus:border-[#FFF880] outline-none w-56 transition placeholder-[#B8A6CC]/40"
            />
          </div>

          {/* Status Dropdown */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs bg-[#160B21] border border-[#3D1F57] rounded-lg px-3 py-1.5 text-white font-medium outline-none cursor-pointer"
          >
            <option value="ALL">All Statuses</option>
            <option value="ENABLED">Active Only</option>
            <option value="PAUSED">Paused Only</option>
          </select>
        </div>

        {/* Right Toolbar Actions */}
        <div className="flex items-center space-x-2">
          <button
            onClick={onRefresh}
            title="Refresh metrics"
            className="p-1.5 hover:bg-[#2D1840] text-[#B8A6CC] hover:text-white rounded-lg transition"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={exportToCSV}
            className="flex items-center space-x-1.5 text-xs bg-[#160B21] hover:bg-[#2D1840] border border-[#3D1F57] text-[#FFF880] px-3 py-1.5 rounded-lg transition font-medium"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Main Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-[#160B21]/60 border-b border-[#3D1F57] text-[#B8A6CC] font-semibold uppercase tracking-wider text-[11px]">
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 min-w-[220px]">Campaign</th>
              <th className="py-3 px-4">Channel</th>
              <th className="py-3 px-4">Daily Budget</th>
              <th className="py-3 px-4 text-right">Impressions</th>
              <th className="py-3 px-4 text-right">Clicks</th>
              <th className="py-3 px-4 text-right">CTR</th>
              <th className="py-3 px-4 text-right">Avg CPC</th>
              <th className="py-3 px-4 text-right">Spend</th>
              <th className="py-3 px-4 text-right">Conversions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#3D1F57]">
            {filteredCampaigns.length === 0 ? (
              <tr>
                <td colSpan="10" className="py-8 text-center text-[#B8A6CC]">
                  No campaigns found matching filter.
                </td>
              </tr>
            ) : (
              filteredCampaigns.map((c) => {
                const isEnabled = c.status.toUpperCase() === 'ENABLED';

                return (
                  <tr key={c.id} className="hover:bg-[#2D1840]/60 transition">
                    {/* Status Badge */}
                    <td className="py-3 px-4">
                      {isEnabled ? (
                        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-950/60 text-emerald-400 border border-emerald-800">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Active</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-gray-900 text-gray-400 border border-gray-700">
                          <PauseCircle className="w-3 h-3" />
                          <span>Paused</span>
                        </span>
                      )}
                    </td>

                    {/* Campaign Name */}
                    <td className="py-3 px-4">
                      <div className="font-semibold text-white">{c.name}</div>
                      <div className="text-[11px] text-[#B8A6CC] mt-0.5 truncate max-w-[260px]">
                        {c.bidding_strategy}
                      </div>
                    </td>

                    {/* Channel */}
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded bg-[#160B21] text-[#B8A6CC] border border-[#3D1F57] text-[11px] font-medium">
                        {c.type}
                      </span>
                    </td>

                    {/* Daily Budget */}
                    <td className="py-3 px-4 font-medium text-[#FFF880]">
                      ${Number(c.budget).toFixed(2)}/day
                    </td>

                    {/* Impressions */}
                    <td className="py-3 px-4 text-right text-[#B8A6CC]">
                      {Number(c.impressions).toLocaleString()}
                    </td>

                    {/* Clicks */}
                    <td className="py-3 px-4 text-right font-semibold text-white">
                      {Number(c.clicks).toLocaleString()}
                    </td>

                    {/* CTR */}
                    <td className="py-3 px-4 text-right text-emerald-400 font-medium">
                      {Number(c.ctr).toFixed(2)}%
                    </td>

                    {/* Avg CPC */}
                    <td className="py-3 px-4 text-right text-[#B8A6CC]">
                      ${Number(c.avg_cpc).toFixed(2)}
                    </td>

                    {/* Spend / Cost */}
                    <td className="py-3 px-4 text-right font-bold text-white">
                      ${Number(c.cost).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>

                    {/* Conversions */}
                    <td className="py-3 px-4 text-right font-bold text-[#FFF880]">
                      {Number(c.conversions).toFixed(1)}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>

          {/* Table Total Summary Footer */}
          <tfoot>
            <tr className="bg-[#160B21] font-bold text-white border-t border-[#3D1F57]">
              <td className="py-3 px-4 text-[#FFF880]">TOTALS</td>
              <td className="py-3 px-4">{filteredCampaigns.length} Campaigns Reporting</td>
              <td className="py-3 px-4">—</td>
              <td className="py-3 px-4">—</td>
              <td className="py-3 px-4 text-right text-[#B8A6CC]">{totalImpressions.toLocaleString()}</td>
              <td className="py-3 px-4 text-right">{totalClicks.toLocaleString()}</td>
              <td className="py-3 px-4 text-right text-emerald-400">{totalCtr}%</td>
              <td className="py-3 px-4 text-right">${totalAvgCpc}</td>
              <td className="py-3 px-4 text-right text-[#FFF880]">${totalCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
              <td className="py-3 px-4 text-right text-[#FFF880]">{totalConversions.toFixed(1)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
