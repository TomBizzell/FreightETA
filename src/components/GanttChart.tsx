import React, { useState } from 'react';
import { format, differenceInMinutes } from 'date-fns';
import type { DriverWithOverlap } from '../types/driver';
import { calculateTimelineConfig } from '../utils/timelineUtils';
import { UNLOAD_TIME_MINUTES } from '../utils/timeUtils';
import { isValidDate, safeFormatDate } from '../utils/dateUtils';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface GanttChartProps {
  drivers: DriverWithOverlap[];
  title: string;
  currentDate: Date;
  onDateChange: (newDate: Date) => void;
}

export function GanttChart({ drivers, title, currentDate, onDateChange }: GanttChartProps) {
  const { startTime, endTime, totalMinutes, timeSlots } = calculateTimelineConfig(drivers);

  const handlePreviousDay = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() - 1);
    onDateChange(newDate);
  };

  const handleNextDay = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + 1);
    onDateChange(newDate);
  };

  const getBarStyles = (driver: DriverWithOverlap) => {
    if (!isValidDate(driver.eta)) {
      return { display: 'none' };
    }
    
    const leftOffset = (differenceInMinutes(driver.eta, startTime) / totalMinutes) * 100;
    const width = (UNLOAD_TIME_MINUTES / totalMinutes) * 100;

    return {
      left: `${leftOffset}%`,
      width: `${width}%`,
    };
  };

  return (
    <div className="bg-dark-800 p-6 rounded-lg shadow-xl neon-border">
      {/* Date Navigation */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-neon-purple">{title}</h2>
        <div className="flex items-center space-x-4">
          <button
            onClick={handlePreviousDay}
            className="p-2 rounded hover:bg-gray-700 transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-gray-400" />
          </button>
          <span className="text-gray-300 font-medium">
            {format(currentDate, 'MMM d, yyyy')}
          </span>
          <button
            onClick={handleNextDay}
            className="p-2 rounded hover:bg-gray-700 transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </button>
        </div>
      </div>
      
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
                    {safeFormatDate(driver.eta, 'HH:mm')}
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