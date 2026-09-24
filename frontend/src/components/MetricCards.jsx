import React from 'react';
import { ArrowUpRight, ArrowDownRight, TrendingUp } from 'lucide-react';

const METRIC_CONFIG = [
  { key: 'cost', label: 'Total Ad Spend', format: (v) => `$${Number(v || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, isInverse: true },
  { key: 'impressions', label: 'Impressions', format: (v) => v ? v.toLocaleString() : '0' },
  { key: 'clicks', label: 'Total Clicks', format: (v) => v ? v.toLocaleString() : '0' },
  { key: 'ctr', label: 'Click-Through Rate', format: (v) => `${Number(v || 0).toFixed(2)}%` },
  { key: 'avg_cpc', label: 'Average CPC', format: (v) => `$${Number(v || 0).toFixed(2)}`, isInverse: true },
  { key: 'conversions', label: 'Conversions', format: (v) => Number(v || 0).toFixed(1) },
];

export default function MetricCards({ 
  summary, 
  primaryMetric, 
  secondaryMetric, 
  onSelectMetric 
}) {
  if (!summary) return null;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
      {METRIC_CONFIG.map((metric) => {
        const data = summary[metric.key] || { value: 0, change_pct: 0, is_positive: true };
        const isPrimary = primaryMetric === metric.key;
        const isSecondary = secondaryMetric === metric.key;
        const isPositiveChange = data.change_pct >= 0;
        const isFavorable = metric.isInverse ? !isPositiveChange : isPositiveChange;

        return (
          <div
            key={metric.key}
            onClick={() => onSelectMetric(metric.key)}
            className={`cursor-pointer rounded-xl bg-[#221230] border p-4 transition-all relative select-none hover:bg-[#2D1840] ${
              isPrimary
                ? 'border-[#FFF880] ring-1 ring-[#FFF880]/50 shadow-[0_0_15px_rgba(255,248,128,0.15)]'
                : isSecondary
                ? 'border-[#9D4EDD] ring-1 ring-[#9D4EDD]/50 shadow-[0_0_15px_rgba(157,78,221,0.15)]'
                : 'border-[#3D1F57] hover:border-[#FFF880]/40'
            }`}
          >
            {/* Top indicator bar */}
            {isPrimary && (
              <div className="absolute top-0 left-0 right-0 h-1 bg-[#FFF880] rounded-t-xl" />
            )}
            {isSecondary && (
              <div className="absolute top-0 left-0 right-0 h-1 bg-[#9D4EDD] rounded-t-xl" />
            )}

            {/* Label */}
            <div className="flex items-center justify-between text-xs text-[#B8A6CC] mb-1.5">
              <span className="font-medium truncate">{metric.label}</span>
              {isPrimary && (
                <span className="w-2 h-2 rounded-full bg-[#FFF880] shadow-[0_0_6px_#FFF880]" title="Primary Chart Metric" />
              )}
              {isSecondary && (
                <span className="w-2 h-2 rounded-full bg-[#9D4EDD] shadow-[0_0_6px_#9D4EDD]" title="Secondary Chart Metric" />
              )}
            </div>

            {/* Value */}
            <div className="text-xl font-bold text-white tracking-tight">
              {metric.format(data.value)}
            </div>

            {/* Delta */}
            <div className="flex items-center space-x-1.5 mt-2 text-xs">
              <div className={`flex items-center font-semibold ${isFavorable ? 'text-emerald-400' : 'text-rose-400'}`}>
                {data.change_pct >= 0 ? (
                  <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
                ) : (
                  <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />
                )}
                <span>{Math.abs(data.change_pct)}%</span>
              </div>
              <span className="text-[10px] text-[#B8A6CC]">vs last cycle</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
