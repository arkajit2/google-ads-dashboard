import React, { useState } from 'react';
import { Calendar as CalendarIcon, ChevronDown, Check } from 'lucide-react';

const PRESETS = [
  { id: '7', label: 'Last 7 days' },
  { id: '14', label: 'Last 14 days' },
  { id: '30', label: 'Last 30 days' },
  { id: 'month', label: 'This month' },
  { id: 'last_month', label: 'Last month' },
  { id: 'all', label: 'All time' }
];

export default function DateRangePicker({ selectedDays, onSelectDays }) {
  const [isOpen, setIsOpen] = useState(false);
  const [compare, setCompare] = useState(true);

  const getLabel = () => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - (selectedDays || 30));
    
    const fmt = (d) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    return `${fmt(start)} – ${fmt(end)}`;
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 bg-white hover:bg-[#f1f3f4] border border-[#dadce0] px-3 py-1.5 rounded text-xs text-[#202124] font-medium shadow-sm transition"
      >
        <CalendarIcon className="w-3.5 h-3.5 text-[#5f6368]" />
        <span>{getLabel()}</span>
        <ChevronDown className="w-3.5 h-3.5 text-[#5f6368]" />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-10 w-64 bg-white border border-[#dadce0] rounded-lg shadow-xl p-3 z-50 text-xs">
          <p className="font-semibold text-gray-700 pb-2 border-b border-gray-100 uppercase tracking-wider text-[11px]">
            Date Range
          </p>
          <div className="py-2 space-y-1">
            {PRESETS.map((preset) => {
              const daysNum = preset.id === '7' ? 7 : preset.id === '14' ? 14 : preset.id === '30' ? 30 : 30;
              const isSelected = selectedDays === daysNum;

              return (
                <button
                  key={preset.id}
                  onClick={() => {
                    onSelectDays(daysNum);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-3 py-1.5 rounded flex items-center justify-between transition ${
                    isSelected ? 'bg-blue-50 text-[#1a73e8] font-semibold' : 'hover:bg-gray-100 text-[#3c4043]'
                  }`}
                >
                  <span>{preset.label}</span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-[#1a73e8]" />}
                </button>
              );
            })}
          </div>

          <div className="pt-2 border-t border-gray-100">
            <label className="flex items-center space-x-2 text-[#3c4043] cursor-pointer">
              <input
                type="checkbox"
                checked={compare}
                onChange={(e) => setCompare(e.target.checked)}
                className="rounded border-[#dadce0] text-[#1a73e8] focus:ring-0"
              />
              <span>Compare to previous period</span>
            </label>
          </div>
        </div>
      )}
    </div>
  );
}
