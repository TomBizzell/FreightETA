import React, { useState, useRef, useEffect } from 'react';
import { format, differenceInMinutes } from 'date-fns';
import type { Driver, DriverWithOverlap } from '../types/driver';
import { calculateTimelineConfig, detectSwaps } from '../utils/timelineUtils';
import { UNLOAD_TIME_MINUTES } from '../utils/timeUtils';
import { isValidDate } from '../utils/dateUtils';
import { ArrowLeftRight } from 'lucide-react';
import type { SwapInfo } from '../types/swap';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface EditableGanttChartProps {
  title: string;
  drivers: DriverWithOverlap[];
  originalDrivers: Driver[];
  onUpdateTime: (driverId: string, newTime: Date) => void;
  onDriverClick: (driver: DriverWithOverlap) => void;
  onUpdateOriginalTime?: (driverId: string, newTime: Date) => void;
  onSwapsChange?: (swaps: Map<string, SwapInfo>) => void;
  onConfirmedSwapsChange?: (confirmedSwaps: Set<string>) => void;
  confirmedSwaps: Set<string>;
  currentDate: Date;
  onDateChange: (date: Date) => void;
}

export function EditableGanttChart({
  title,
  drivers,
  originalDrivers,
  onUpdateTime,
  onDriverClick,
  onUpdateOriginalTime,
  onSwapsChange,
  onConfirmedSwapsChange,
  confirmedSwaps,
  currentDate,
  onDateChange,
}: EditableGanttChartProps) {
  const [timelineConfig, setTimelineConfig] = useState(() => 
    calculateTimelineConfig(drivers)
  );

  useEffect(() => {
    setTimelineConfig(calculateTimelineConfig(drivers));
  }, [drivers]);

  const { startTime, endTime, totalMinutes, timeSlots, pixelsPerMinute } =
    timelineConfig;
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [timeline, setTimeline] = useState({ width: 0 });
  const [hoveredSwapPair, setHoveredSwapPair] = useState<[string, string] | null>(null);

  // Add a ref to measure the timeline
  const timelineRef = useRef<HTMLDivElement>(null);

  // Add useEffect to measure timeline width
  useEffect(() => {
    if (timelineRef.current) {
      setTimeline({ width: timelineRef.current.getBoundingClientRect().width });
    }
  }, [timelineRef]);

  const TIMELINE_PADDING = 32; // px for left/right padding

  const getBarStyles = (driver: Driver | DriverWithOverlap, isOriginal: boolean = false): React.CSSProperties => {
    const originalDriver = originalDrivers.find(d => d.id === driver.id);
    const timeToUse = isOriginal && originalDriver ? originalDriver.eta : driver.eta;

    // Return hidden style if date is invalid
    if (!timeToUse || !isValidDate(timeToUse) || !isValidDate(startTime)) {
      return { display: 'none' };
    }

    // Ensure we're working with proper Date objects
    const timeToUseDate = new Date(timeToUse);
    const startTimeDate = new Date(startTime);

    let minutesFromStart = differenceInMinutes(timeToUseDate, startTimeDate);
    
    // Handle cross-midnight cases
    if (minutesFromStart < 0) {
      minutesFromStart += 24 * 60;
    }
    
    const percentageFromStart = (minutesFromStart / totalMinutes) * 100;
    const barWidthPercentage = (UNLOAD_TIME_MINUTES / totalMinutes) * 100;

    // Ensure the bar stays within bounds
    const leftPosition = Math.min(Math.max(percentageFromStart, 0), 100 - barWidthPercentage);

    return {
      width: `${barWidthPercentage}%`,
      left: `${leftPosition}%`,
      position: 'absolute' as const,
    };
  };

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, driverId: string) => {
    setDraggingId(driverId);
    e.dataTransfer.setData('text/plain', driverId);
    const dragImage = new Image();
    dragImage.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
    e.dataTransfer.setDragImage(dragImage, 0, 0);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!draggingId) return;

    const timeline = e.currentTarget.getBoundingClientRect();
    const offsetX = e.clientX - timeline.left - TIMELINE_PADDING;
    const timelineWidth = timeline.width - TIMELINE_PADDING * 2;
    const percentageX = (offsetX / timelineWidth) * 100;
    
    const minutesFromStart = (percentageX / 100) * totalMinutes;
    const newTime = new Date(startTime.getTime() + minutesFromStart * 60000);

    const driver = drivers.find((d) => d.id === draggingId);
    if (driver && onUpdateOriginalTime) {
      onUpdateOriginalTime(draggingId, newTime);
      onUpdateTime(draggingId, newTime); // Also update current ETA to match
    }
  };

  const swaps = detectSwaps(originalDrivers, drivers);

  const handleConfirmSwap = (driverId: string) => {
    const swapInfo = swaps.get(driverId);
    if (swapInfo && onConfirmedSwapsChange) {
      const next = new Set(confirmedSwaps);
      // Add both drivers involved in the swap
      next.add(driverId);
      next.add(swapInfo.newId);
      // Also check the reverse swap and add those drivers
      const reverseSwap = swaps.get(swapInfo.newId);
      if (reverseSwap) {
        next.add(reverseSwap.originalId);
        next.add(reverseSwap.newId);
      }
      onConfirmedSwapsChange(next);
    }
  };

  const getSwapPair = (driverId: string): [string, string] | null => {
    const swapInfo = swaps.get(driverId);
    if (swapInfo?.newId) {
      return [driverId, swapInfo.newId];
    }
    return null;
  };

  const [hoveredSwap, setHoveredSwap] = useState<[string, string] | null>(null);

  useEffect(() => {
    const detectedSwaps = detectSwaps(originalDrivers, drivers);
    if (onSwapsChange) {
      onSwapsChange(detectedSwaps);
    }
  }, [drivers, originalDrivers, onSwapsChange]);

  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, []);

  const getCurrentTimePosition = () => {
    const minutesFromStart = differenceInMinutes(new Date(), startTime);
    const position = (minutesFromStart / totalMinutes) * 100;
    return `${position}%`;
  };

  return (
    <div className="bg-dark-800 p-6 rounded-lg shadow-xl neon-border">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-neon-purple">{title}</h2>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => {
              const newDate = new Date(currentDate);
              newDate.setDate(newDate.getDate() - 1);
              onDateChange(newDate);
            }}
            className="p-2 rounded hover:bg-gray-700 transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-gray-400" />
          </button>
          <span className="text-gray-300 font-medium">
            {format(currentDate, 'MMM d, yyyy')}
          </span>
          <button
            onClick={() => {
              const newDate = new Date(currentDate);
              newDate.setDate(newDate.getDate() + 1);
              onDateChange(newDate);
            }}
            className="p-2 rounded hover:bg-gray-700 transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </button>
        </div>
      </div>
      
      <div className="relative overflow-x-auto">
        {/* Timeline Header */}
        <div className="sticky top-0 bg-dark-800 z-10 mb-4">
          <div className="flex">
            <div className="w-32 flex-shrink-0" />
            <div className="flex-1 relative h-8">
              <div className="flex justify-between absolute inset-0">
                {timeSlots.map((slot, index) => (
                  <div key={index} className="flex flex-col items-center">
                    <span className="text-sm font-medium text-gray-200 mb-1">
                      {format(slot, 'HH:mm')}
                    </span>
                    <div className="h-2 w-0.5 bg-gray-700" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Current time indicator */}
        <div 
          className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-30"
          style={{ left: getCurrentTimePosition() }}
        >
          <div className="absolute -top-6 -translate-x-1/2 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded">
            {format(new Date(), 'HH:mm')}
          </div>
        </div>

        {/* Timeline Rows */}
        <div className="relative">
          {drivers.map((driver) => (
            <div
              key={driver.id}
              className={`flex mb-4 ${
                hoveredSwapPair && (hoveredSwapPair[0] === driver.id || hoveredSwapPair[1] === driver.id)
                ? 'bg-dark-700/50 rounded-lg transition-colors duration-150'
                : ''
              }`}
            >
              <div className="w-32 flex-shrink-0 py-2">
                <span className="text-sm font-medium text-gray-300">{driver.name}</span>
              </div>
              <div className="flex-1 relative h-16 bg-dark-700 rounded px-8"
                onDragOver={handleDragOver}
                ref={timelineRef}
              >
                {/* Original position ghost bar */}
                {!confirmedSwaps.has(driver.id) && (
                  <>
                    <div
                      className="absolute top-2 h-12 rounded bg-gray-600 bg-opacity-25"
                      style={getBarStyles(driver, true)}
                    >
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-xs font-medium px-2 truncate text-gray-400">
                          {(() => {
                            const originalTime = originalDrivers.find(d => d.id === driver.id)?.eta;
                            return isValidDate(originalTime) ? format(originalTime, 'HH:mm') : 'Invalid time';
                          })()}
                        </span>
                      </div>
                    </div>
                    {!confirmedSwaps.has(driver.id) && swaps.get(driver.id)?.newId && (
                      <div className="absolute -right-64 top-0 h-full flex flex-col justify-center">
                        <div 
                          className="bg-dark-700 rounded-lg p-2 border border-neon-purple w-56"
                          onMouseEnter={() => {
                            const swapInfo = swaps.get(driver.id);
                            if (swapInfo?.newId) {
                              setHoveredSwap([driver.id, swapInfo.newId]);
                            }
                          }}
                          onMouseLeave={() => setHoveredSwap(null)}
                        >
                          <div className="text-xs text-gray-300 mb-2">
                            Swapping:
                            <div className="font-medium text-white">
                              {driver.name} → {drivers.find(d => d.id === swaps.get(driver.id)?.newId)?.name}
                            </div>
                            <div className="text-xs text-gray-400 mt-1">
                              Both going to: {driver.destination}
                            </div>
                          </div>
                          <button
                            onClick={() => handleConfirmSwap(driver.id)}
                            className="w-full px-2 py-1 text-xs bg-neon-purple text-white rounded hover:bg-neon-glow transition-colors"
                          >
                            Confirm Swap
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                )}

                {/* Timeline bar with swap styling */}
                <div
                  draggable
                  onDragStart={(e) => handleDragStart(e, driver.id)}
                  className={`absolute top-2 h-12 rounded cursor-move ${
                    swaps.get(driver.id)?.newId 
                      ? 'border-2 border-neon-purple'
                      : ''
                  } ${
                    'overlapsWith' in driver && driver.overlapsWith.length > 0
                      ? 'bg-amber-500 bg-opacity-75'
                      : 'bg-neon-purple bg-opacity-75'
                  } shadow-lg transition-all duration-200`}
                  style={getBarStyles(driver)}
                >
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xs font-medium px-2 truncate text-white">
                      {isValidDate(driver.eta) ? format(driver.eta, 'HH:mm') : 'Invalid time'}
                    </span>
                  </div>
                </div>

                {/* Single Swap Indicator */}
                {!confirmedSwaps.has(driver.id) && swaps.get(driver.id)?.newId && (
                  <div className="absolute right-2 top-1/2 transform -translate-y-1/2 z-10">
                    <div className="flex items-center space-x-1 bg-dark-600/50 rounded-full px-2 py-1 border border-neon-purple/30">
                      <div className="w-2 h-2 bg-neon-purple rounded-full"></div>
                      <span className="text-xs text-gray-300">
                        Swapping with {drivers.find(d => d.id === swaps.get(driver.id)?.newId)?.name}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}