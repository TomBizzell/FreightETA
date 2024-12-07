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
          <Clock className="text-2xl text-white" />
          <h2 className="text-2xl font-bold text-white">Time Unlocked</h2>
        </div>
        <div className="flex items-center space-x-2">
          <ArrowUpRight className="text-2xl text-white" />
          <span className="text-2xl font-bold text-white">{hours}h {minutes}m</span>
        </div>
      </div>
    </div>
  );
} 