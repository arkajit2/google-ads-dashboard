import React from 'react';
import { ArrowUpRight, ArrowDownRight, Info } from 'lucide-react';

const METRIC_CONFIG = [
  { key: 'clicks', label: 'Clicks', format: (v) => v ? v.toLocaleString() : '0', color: '#1a73e8' },
  { key: 'impressions', label: 'Impressions', format: (v) => v ? v.toLocaleString() : '0', color: '#ea4335' },
  { key: 'avg_cpc', label: 'Avg. CPC', format: (v) => `$${Number(v || 0).toFixed(2)}`, color: '#fbbc04' },
  { key: 'cost', label: 'Cost', format: (v) => `$${Number(v || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, color: '#34a853' },
  { key: 'conversions', label: 'Conversions', format: (v) => Number(v || 0).toFixed(1), color: '#9334e8' },
  { key: 'cost_per_conv', label: 'Cost / conv.', format: (v) => `$${Number(v || 0).toFixed(2)}`, color: '#ff6d01' },
];

export default function MetricCards({ 
  summary, 
  primaryMetric, 
  secondaryMetric, 
  onSelectMetric 
}) {
  if (!summary) return null;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-4">
      {METRIC_CONFIG.map((metric) => {
        const data = summary[metric.key] || { value: 0, change_pct: 0, is_positive: true };
        const isPrimary = primaryMetric === metric.key;
        const isSecondary = secondaryMetric === metric.key;

        const isPositiveChange = data.change_pct >= 0;
        const showGreen = metric.key === 'cost' || metric.key === 'cost_per_conv' 
          ? !isPositiveChange // Cost decreasing is good
          : isPositiveChange; // Clicks/Impr/Conv increasing is good

        return (
          <div
            key={metric.key}
            onClick={() => onSelectMetric(metric.key)}
            className={`cursor-pointer rounded-lg bg-white border p-3 transition-all relative select-none hover:shadow-sm ${
              isPrimary
                ? 'border-[#1a73e8] ring-1 ring-[#1a73e8] bg-blue-50/20'
                : isSecondary
                ? 'border-[#ea4335] ring-1 ring-[#ea4335] bg-red-50/20'
                : 'border-[#dadce0] hover:border-gray-400'
            }`}
          >
            {/* Top active color tab */}
            {isPrimary && (
              <div className="absolute top-0 left-0 right-0 h-1 bg-[#1a73e8] rounded-t-lg" />
            )}
            {isSecondary && (
              <div className="absolute top-0 left-0 right-0 h-1 bg-[#ea4335] rounded-t-lg" />
            )}

            {/* Header / Metric Label */}
            <div className="flex items-center justify-between text-xs text-[#5f6368] mb-1">
              <span className="font-medium truncate">{metric.label}</span>
              <div className="flex items-center space-x-1">
                {isPrimary && (
                  <span className="w-2 h-2 rounded-full bg-[#1a73e8]" title="Primary Chart Metric" />
                )}
                {isSecondary && (
                  <span className="w-2 h-2 rounded-full bg-[#ea4335]" title="Secondary Chart Metric" />
                )}
              </div>
            </div>

            {/* Metric Value */}
            <div className="text-xl font-bold text-[#202124] tracking-tight">
              {metric.format(data.value)}
            </div>

            {/* Change % compared to previous period */}
            <div className="flex items-center space-x-1 mt-1.5 text-xs">
              <div className={`flex items-center font-medium ${showGreen ? 'text-emerald-700' : 'text-rose-600'}`}>
                {data.change_pct >= 0 ? (
                  <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
                ) : (
                  <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />
                )}
                <span>{Math.abs(data.change_pct)}%</span>
              </div>
              <span className="text-[11px] text-[#5f6368] truncate">vs prev 30d</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
