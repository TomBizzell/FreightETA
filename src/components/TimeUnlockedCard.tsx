import React from 'react';
import { Clock, ArrowUpRight } from 'lucide-react';
import { differenceInMinutes } from 'date-fns';
import type { Driver } from '../types/driver';

interface TimeUnlockedCardProps {
  originalDrivers: Driver[];
  liveDrivers: Driver[];
}

export function TimeUnlockedCard({ originalDrivers, liveDrivers }: TimeUnlockedCardProps) {
  const calculateTimeUnlocked = () => {
    let totalMinutes = 0;
    
    liveDrivers.forEach(liveDriver => {
      const originalDriver = originalDrivers.find(d => d.id === liveDriver.id);
      if (originalDriver && liveDriver.eta > originalDriver.eta) {
        const diff = differenceInMinutes(liveDriver.eta, originalDriver.eta);
        totalMinutes += diff;
      }
    });
    
    return totalMinutes;
  };

  const timeUnlocked = calculateTimeUnlocked();
  const hours = Math.floor(timeUnlocked / 60);
  const minutes = timeUnlocked % 60;

  return (
    <div className="bg-dark-800 p-6 rounded-lg shadow-xl neon-border">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <Clock className="w-5 h-5 text-neon-purple" />
          <h2 className="text-sm font-medium text-gray-400">Time Unlocked</h2>
        </div>
        <ArrowUpRight className="w-5 h-5 text-neon-purple animate-pulse-slow" />
      </div>
      
      <div className="mt-2">
        <div className="text-3xl font-bold text-neon-purple">
          {hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`}
        </div>
        <p className="text-sm text-gray-400 mt-1">
          Total advance notice of delays
        </p>
      </div>
    </div>
  );
} 