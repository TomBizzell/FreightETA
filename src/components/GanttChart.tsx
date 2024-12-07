import React from 'react';
import { format, differenceInMinutes } from 'date-fns';
import type { DriverWithOverlap } from '../types/driver';
import { calculateTimelineConfig } from '../utils/timelineUtils';
import { UNLOAD_TIME_MINUTES } from '../utils/timeUtils';

interface GanttChartProps {
  drivers: DriverWithOverlap[];
  title: string;
}

export function GanttChart({ drivers, title }: GanttChartProps) {
  const { startTime, endTime, totalMinutes, timeSlots } = calculateTimelineConfig(drivers);

  const getBarStyles = (driver: DriverWithOverlap) => {
    const leftOffset = (differenceInMinutes(driver.eta, startTime) / totalMinutes) * 100;
    const width = (UNLOAD_TIME_MINUTES / totalMinutes) * 100;

    return {
      left: `${leftOffset}%`,
      width: `${width}%`,
    };
  };

  return (
    <div className="bg-dark-800 p-6 rounded-lg shadow-xl neon-border">
      <h2 className="text-xl font-semibold mb-6 text-neon-purple">{title}</h2>
      
      {/* Timeline Header */}
      <div className="relative mb-4 border-b border-gray-700">
        <div className="flex justify-between">
          {timeSlots.map((slot, index) => (
            <div key={index} className="flex-1 text-center">
              <span className="text-sm text-gray-400">
                {format(slot, 'HH:mm')}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Timeline Bars */}
      <div className="relative space-y-4">
        {drivers.map((driver) => (
          <div key={driver.id} className="relative h-12">
            {/* Driver Name */}
            <div className="absolute left-0 top-0 w-32 h-full flex items-center">
              <span className="text-sm font-medium truncate text-gray-300">{driver.name}</span>
            </div>
            
            {/* Timeline Bar */}
            <div className="relative ml-32 h-full bg-dark-700 rounded">
              <div
                className={`absolute top-1 h-10 rounded timeline-bar ${
                  driver.overlapsWith.length > 0
                    ? 'bg-amber-500 bg-opacity-75'
                    : 'bg-neon-purple bg-opacity-75'
                } shadow-lg transition-all duration-200`}
                style={getBarStyles(driver)}
              >
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xs font-medium px-2 truncate text-white">
                    {format(driver.eta, 'HH:mm')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}

        {drivers.length === 0 && (
          <div className="text-center text-gray-400 py-8">
            No drivers scheduled yet
          </div>
        )}
      </div>
    </div>
  );
}