import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';

const METRIC_OPTIONS = [
  { value: 'clicks', label: 'Clicks', prefix: '', unit: '' },
  { value: 'impressions', label: 'Impressions', prefix: '', unit: '' },
  { value: 'cost', label: 'Spend ($)', prefix: '$', unit: '' },
  { value: 'conversions', label: 'Conversions', prefix: '', unit: '' },
  { value: 'ctr', label: 'CTR (%)', prefix: '', unit: '%' },
  { value: 'avg_cpc', label: 'Avg CPC', prefix: '$', unit: '' },
];

export default function PerformanceChart({
  data,
  primaryMetric,
  setPrimaryMetric,
  secondaryMetric,
  setSecondaryMetric
}) {
  const primaryMeta = METRIC_OPTIONS.find(m => m.value === primaryMetric) || METRIC_OPTIONS[0];
  const secondaryMeta = METRIC_OPTIONS.find(m => m.value === secondaryMetric) || METRIC_OPTIONS[1];

  const formatValue = (val, meta) => {
    if (val === undefined || val === null) return '0';
    if (meta.prefix === '$') {
      return `$${Number(val).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    if (meta.unit === '%') {
      return `${Number(val).toFixed(2)}%`;
    }
    return Number(val).toLocaleString();
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#160B21] p-3 border border-[#3D1F57] rounded-xl shadow-xl text-xs space-y-1.5 z-50">
          <p className="font-semibold text-[#FFF880] pb-1 border-b border-[#3D1F57]">{label}</p>
          {payload.map((entry, index) => (
            <div key={`tooltip-${index}`} className="flex items-center justify-between space-x-4">
              <span className="flex items-center space-x-1.5" style={{ color: entry.color }}>
                <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: entry.color }} />
                <span className="font-medium text-[#B8A6CC]">{entry.name}:</span>
              </span>
              <span className="font-bold text-white">
                {entry.name === primaryMeta.label
                  ? formatValue(entry.value, primaryMeta)
                  : formatValue(entry.value, secondaryMeta)}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-[#221230] rounded-2xl border border-[#3D1F57] p-5 mb-6 shadow-sm">
      {/* Header Selectors */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#3D1F57] mb-4">
        <div className="flex flex-wrap items-center gap-3">
          {/* Primary Metric (Fraoula Yellow) */}
          <div className="flex items-center space-x-2 bg-[#160B21] border border-[#FFF880]/30 px-3 py-1.5 rounded-lg">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FFF880] shadow-[0_0_6px_#FFF880]"></span>
            <select
              value={primaryMetric}
              onChange={(e) => setPrimaryMetric(e.target.value)}
              className="bg-transparent text-xs font-semibold text-[#FFF880] focus:outline-none cursor-pointer"
            >
              {METRIC_OPTIONS.map((opt) => (
                <option key={`p-${opt.value}`} value={opt.value} className="bg-[#160B21] text-white">
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <span className="text-[#B8A6CC] text-xs">vs</span>

          {/* Secondary Metric (Violet) */}
          <div className="flex items-center space-x-2 bg-[#160B21] border border-[#9D4EDD]/40 px-3 py-1.5 rounded-lg">
            <span className="w-2.5 h-2.5 rounded-full bg-[#9D4EDD] shadow-[0_0_6px_#9D4EDD]"></span>
            <select
              value={secondaryMetric}
              onChange={(e) => setSecondaryMetric(e.target.value)}
              className="bg-transparent text-xs font-semibold text-[#9D4EDD] focus:outline-none cursor-pointer"
            >
              <option value="none" className="bg-[#160B21] text-white">None</option>
              {METRIC_OPTIONS.map((opt) => (
                <option key={`s-${opt.value}`} value={opt.value} className="bg-[#160B21] text-white">
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="text-xs text-[#B8A6CC] font-medium">
          Reporting Cycle: <span className="text-white">Daily Performance</span>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="h-64 sm:h-72 w-full flex items-center justify-center">
        {(!data || data.length === 0) ? (
          <div className="text-center p-6 space-y-2">
            <div className="w-10 h-10 mx-auto rounded-full bg-[#160B21] border border-[#3D1F57] flex items-center justify-center text-[#B8A6CC]">
              <span className="w-2.5 h-2.5 rounded-full bg-[#FFF880]/60"></span>
            </div>
            <p className="text-xs text-[#B8A6CC] font-medium">No performance timeseries data recorded for the selected period.</p>
            <p className="text-[11px] text-[#B8A6CC]/60">Historical daily clicks and impressions will display here as campaigns run.</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#3D1F57" opacity={0.6} />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 11, fill: '#B8A6CC' }} 
                axisLine={{ stroke: '#3D1F57' }}
                tickLine={false}
              />
              {/* Primary Y Axis (Left - Fraoula Yellow) */}
              <YAxis
                yAxisId="left"
                tick={{ fontSize: 11, fill: '#FFF880' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => {
                  if (v >= 1000) return `${(v / 1000).toFixed(0)}k`;
                  return v;
                }}
              />
              {/* Secondary Y Axis (Right - Violet) */}
              {secondaryMetric !== 'none' && (
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tick={{ fontSize: 11, fill: '#9D4EDD' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => {
                    if (v >= 1000) return `${(v / 1000).toFixed(0)}k`;
                    return v;
                  }}
                />
              )}
              <Tooltip content={<CustomTooltip />} />
              
              {/* Primary Line - Fraoula Yellow */}
              <Line
                yAxisId="left"
                type="monotone"
                dataKey={primaryMetric}
                name={primaryMeta.label}
                stroke="#FFF880"
                strokeWidth={2.5}
                dot={{ r: 2, fill: '#FFF880' }}
                activeDot={{ r: 5, fill: '#FFF880', stroke: '#160B21', strokeWidth: 2 }}
              />

              {/* Secondary Line - Violet */}
              {secondaryMetric !== 'none' && (
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey={secondaryMetric}
                  name={secondaryMeta.label}
                  stroke="#9D4EDD"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  dot={{ r: 2, fill: '#9D4EDD' }}
                  activeDot={{ r: 5, fill: '#9D4EDD', stroke: '#160B21', strokeWidth: 2 }}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
