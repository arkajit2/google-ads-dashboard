import React, { useState } from 'react';
import { Sparkles, CheckCircle2, ArrowRight, Zap, Target, Layers } from 'lucide-react';

export default function RecommendationsCard({ score = 88.4 }) {
  const [applied, setApplied] = useState({});
  const [currentScore, setCurrentScore] = useState(score);

  const recommendations = [
    {
      id: 'rec-1',
      title: 'Upgrade your campaigns to Performance Max',
      desc: 'Find more converting customers across Google channels with AI-powered creative and bidding.',
      lift: 4.5,
      type: 'Performance',
      icon: Zap
    },
    {
      id: 'rec-2',
      title: 'Add 12 recommended broad match keywords',
      desc: 'Smart Bidding uses contextual signals at auction time to show your ads to qualified high-intent buyers.',
      lift: 2.8,
      type: 'Targeting',
      icon: Target
    },
    {
      id: 'rec-3',
      title: 'Improve responsive search ad quality to Excellent',
      desc: 'Add 2 missing headlines and 1 description to maximize headline variety and ad relevance.',
      lift: 1.9,
      type: 'Assets',
      icon: Layers
    }
  ];

  const handleApply = (rec) => {
    if (applied[rec.id]) return;
    setApplied({ ...applied, [rec.id]: true });
    setCurrentScore(prev => Math.min(100, +(prev + rec.lift).toFixed(1)));
  };

  return (
    <div className="bg-white rounded-lg border border-[#dadce0] p-4 mb-6 shadow-sm">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        
        {/* Left: Score Gauge */}
        <div className="flex items-center space-x-4">
          <div className="relative w-20 h-20 flex items-center justify-center">
            {/* SVG circular score progress */}
            <svg className="w-20 h-20 transform -rotate-90">
              <circle
                cx="40"
                cy="40"
                r="34"
                stroke="#e8f0fe"
                strokeWidth="7"
                fill="transparent"
              />
              <circle
                cx="40"
                cy="40"
                r="34"
                stroke="#1a73e8"
                strokeWidth="7"
                strokeDasharray={2 * Math.PI * 34}
                strokeDashoffset={2 * Math.PI * 34 * (1 - currentScore / 100)}
                strokeLinecap="round"
                fill="transparent"
                className="transition-all duration-700 ease-out"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center text-center">
              <span className="text-base font-bold text-[#202124]">{currentScore}%</span>
            </div>
          </div>

          <div>
            <div className="flex items-center space-x-1.5 text-xs text-[#1a73e8] font-semibold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Optimization Score</span>
            </div>
            <h4 className="text-sm font-semibold text-[#202124] mt-0.5">
              Your account is performing well
            </h4>
            <p className="text-xs text-[#5f6368] mt-0.5">
              +{ (100 - currentScore).toFixed(1) }% potential score lift by applying available AI recommendations
            </p>
          </div>
        </div>

        {/* Right: Quick Recommendations */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3 w-full">
          {recommendations.map((rec) => {
            const isDone = !!applied[rec.id];
            const Icon = rec.icon;

            return (
              <div
                key={rec.id}
                className="border border-[#dadce0] rounded-lg p-3 bg-[#f8f9fa] hover:bg-white hover:shadow-sm transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-[11px] mb-1.5">
                    <span className="font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                      +{rec.lift}% score
                    </span>
                    <span className="text-[#5f6368] flex items-center gap-1">
                      <Icon className="w-3 h-3" />
                      {rec.type}
                    </span>
                  </div>
                  <h5 className="font-semibold text-xs text-[#202124] line-clamp-1">{rec.title}</h5>
                  <p className="text-[11px] text-[#5f6368] mt-1 line-clamp-2 leading-relaxed">
                    {rec.desc}
                  </p>
                </div>

                <div className="mt-3 pt-2 border-t border-gray-200 flex items-center justify-end">
                  {isDone ? (
                    <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Applied
                    </span>
                  ) : (
                    <button
                      onClick={() => handleApply(rec)}
                      className="text-xs font-semibold text-[#1a73e8] hover:text-[#1765cc] flex items-center gap-1 hover:underline"
                    >
                      Apply <ArrowRight className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}
