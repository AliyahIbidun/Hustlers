import React from 'react';
import { PlayerStats } from '../types';
import { Banknote, Skull, Siren, Heart, Zap } from 'lucide-react';

interface StatsBarProps {
  stats: PlayerStats;
}

export const StatsBar: React.FC<StatsBarProps> = ({ stats }) => {
  return (
    <div className="absolute top-0 left-0 w-full z-50 pointer-events-none">
      {/* Top Bar: Cash & Cred */}
      <div className="flex justify-between items-start p-4 bg-gradient-to-b from-black/90 to-transparent">
        <div className="flex gap-3">
          <div className="flex items-center gap-2 text-green-400 bg-black/60 px-3 py-1 rounded-full border border-green-800 backdrop-blur-sm">
            <Banknote size={16} />
            <span className="font-bold font-mono text-sm">₦{stats.cash.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-2 text-yellow-400 bg-black/60 px-3 py-1 rounded-full border border-yellow-800 backdrop-blur-sm">
            <Skull size={16} />
            <span className="font-bold font-mono text-sm">{stats.streetCred}</span>
          </div>
        </div>
        
        <div className={`flex items-center gap-2 px-3 py-1 rounded-full border bg-black/60 backdrop-blur-sm transition-colors duration-300 ${stats.heat > 70 ? 'text-red-500 border-red-500 animate-pulse' : 'text-blue-400 border-blue-800'}`}>
          <Siren size={16} />
          <span className="font-bold font-mono text-sm">{stats.heat}%</span>
        </div>
      </div>

      {/* Side/Bottom Bars: Health & Energy (BitLife style bars) */}
      <div className="absolute top-16 left-4 flex flex-col gap-2 w-32">
        {/* Health Bar */}
        <div className="relative h-4 bg-gray-800 rounded-full border border-gray-600 overflow-hidden">
          <div 
            className={`absolute left-0 top-0 h-full transition-all duration-500 ${stats.health < 30 ? 'bg-red-600 animate-pulse' : 'bg-green-500'}`}
            style={{ width: `${Math.max(0, Math.min(100, stats.health))}%` }}
          />
          <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white drop-shadow-md">
            <Heart size={10} className="mr-1 inline fill-current" /> {stats.health}%
          </div>
        </div>

        {/* Energy Bar */}
        <div className="relative h-4 bg-gray-800 rounded-full border border-gray-600 overflow-hidden">
          <div 
            className={`absolute left-0 top-0 h-full transition-all duration-500 ${stats.energy < 20 ? 'bg-orange-500' : 'bg-blue-500'}`}
            style={{ width: `${Math.max(0, Math.min(100, stats.energy))}%` }}
          />
          <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white drop-shadow-md">
            <Zap size={10} className="mr-1 inline fill-current" /> {stats.energy}%
          </div>
        </div>
      </div>
    </div>
  );
};