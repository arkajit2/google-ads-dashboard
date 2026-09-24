import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend
} from 'recharts';
import { ChevronDown, BarChart2 } from 'lucide-react';

const METRIC_OPTIONS = [
  { value: 'clicks', label: 'Clicks', unit: '', prefix: '' },
  { value: 'impressions', label: 'Impressions', unit: '', prefix: '' },
  { value: 'cost', label: 'Cost', unit: '', prefix: '$' },
  { value: 'conversions', label: 'Conversions', unit: '', prefix: '' },
  { value: 'cost_per_conv', label: 'Cost / conv.', unit: '', prefix: '$' },
  { value: 'ctr', label: 'CTR', unit: '%', prefix: '' },
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
        <div className="bg-white p-3 border border-[#dadce0] rounded-lg shadow-lg text-xs space-y-1 z-50">
          <p className="font-semibold text-gray-800 pb-1 border-b border-gray-100">{label}</p>
          {payload.map((entry, index) => (
            <div key={`tooltip-${index}`} className="flex items-center justify-between space-x-4">
              <span className="flex items-center space-x-1.5" style={{ color: entry.color }}>
                <span className="w-2.5 h-2.5 rounded-sm inline-block" style={{ backgroundColor: entry.color }} />
                <span className="font-medium text-gray-700">{entry.name}:</span>
              </span>
              <span className="font-bold text-gray-900">
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
    <div className="bg-white rounded-lg border border-[#dadce0] p-4 mb-6 shadow-sm">
      {/* Top Chart Header / Metric Selectors */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#dadce0] mb-4">
        <div className="flex flex-wrap items-center gap-2 sm:gap-4">
          {/* Primary Metric Dropdown */}
          <div className="flex items-center space-x-2 bg-blue-50/70 border border-blue-200 px-3 py-1.5 rounded-md">
            <span className="w-3 h-3 rounded-full bg-[#1a73e8]"></span>
            <select
              value={primaryMetric}
              onChange={(e) => setPrimaryMetric(e.target.value)}
              className="bg-transparent text-xs font-semibold text-[#1a73e8] focus:outline-none cursor-pointer"
            >
              {METRIC_OPTIONS.map((opt) => (
                <option key={`p-${opt.value}`} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <span className="text-[#5f6368] text-xs font-medium">vs</span>

          {/* Secondary Metric Dropdown */}
          <div className="flex items-center space-x-2 bg-red-50/70 border border-red-200 px-3 py-1.5 rounded-md">
            <span className="w-3 h-3 rounded-full bg-[#ea4335]"></span>
            <select
              value={secondaryMetric}
              onChange={(e) => setSecondaryMetric(e.target.value)}
              className="bg-transparent text-xs font-semibold text-[#ea4335] focus:outline-none cursor-pointer"
            >
              <option value="none">None</option>
              {METRIC_OPTIONS.map((opt) => (
                <option key={`s-${opt.value}`} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Chart View Toggle / Granularity */}
        <div className="flex items-center space-x-1 text-xs text-[#5f6368]">
          <span className="px-2.5 py-1 bg-[#e8f0fe] text-[#1a73e8] font-medium rounded">Daily</span>
          <span className="px-2.5 py-1 hover:bg-gray-100 rounded cursor-pointer">Weekly</span>
          <span className="px-2.5 py-1 hover:bg-gray-100 rounded cursor-pointer">Monthly</span>
        </div>
      </div>

      {/* Main Chart SVG / Recharts Canvas */}
      <div className="h-64 sm:h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f3f4" />
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 11, fill: '#5f6368' }} 
              axisLine={{ stroke: '#dadce0' }}
              tickLine={false}
            />
            {/* Primary Y Axis (Left) */}
            <YAxis
              yAxisId="left"
              tick={{ fontSize: 11, fill: '#1a73e8' }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => {
                if (v >= 1000) return `${(v / 1000).toFixed(0)}k`;
                return v;
              }}
            />
            {/* Secondary Y Axis (Right) */}
            {secondaryMetric !== 'none' && (
              <YAxis
                yAxisId="right"
                orientation="right"
                tick={{ fontSize: 11, fill: '#ea4335' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => {
                  if (v >= 1000) return `${(v / 1000).toFixed(0)}k`;
                  return v;
                }}
              />
            )}
            <Tooltip content={<CustomTooltip />} />
            
            {/* Primary Line */}
            <Line
              yAxisId="left"
              type="monotone"
              dataKey={primaryMetric}
              name={primaryMeta.label}
              stroke="#1a73e8"
              strokeWidth={2.5}
              dot={{ r: 2, fill: '#1a73e8' }}
              activeDot={{ r: 5, fill: '#1a73e8' }}
            />

            {/* Secondary Line */}
            {secondaryMetric !== 'none' && (
              <Line
                yAxisId="right"
                type="monotone"
                dataKey={secondaryMetric}
                name={secondaryMeta.label}
                stroke="#ea4335"
                strokeWidth={2}
                strokeDasharray="4 4"
                dot={{ r: 2, fill: '#ea4335' }}
                activeDot={{ r: 4, fill: '#ea4335' }}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
