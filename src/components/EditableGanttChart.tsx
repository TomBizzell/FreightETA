import React, { useState, useRef, useEffect } from 'react';
import { format, differenceInMinutes } from 'date-fns';
import type { Driver, DriverWithOverlap } from '../types/driver';
import { calculateTimelineConfig } from '../utils/timelineUtils';
import { UNLOAD_TIME_MINUTES } from '../utils/timeUtils';
import { isValidDate } from '../utils/dateUtils';

interface EditableGanttChartProps {
  title: string;
  drivers: DriverWithOverlap[];
  originalDrivers: Driver[];
  onUpdateTime: (driverId: string, newTime: Date) => void;
  onDriverClick: (driver: DriverWithOverlap) => void;
  onUpdateOriginalTime?: (driverId: string, newTime: Date) => void;
}

export function EditableGanttChart({
  title,
  drivers,
  originalDrivers,
  onUpdateTime,
  onDriverClick,
  onUpdateOriginalTime,
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

    if (!isValidDate(timeToUse)) {
      return { display: 'none' };
    }

    const timelineWidth = timeline.width - TIMELINE_PADDING * 2;
    const minutesFromStart = differenceInMinutes(timeToUse, startTime);
    const percentageFromStart = (minutesFromStart / totalMinutes) * 100;
    const barWidthPercentage = (UNLOAD_TIME_MINUTES / totalMinutes) * 100;

    return {
      width: `${barWidthPercentage}%`,
      left: `${percentageFromStart}%`,
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

  return (
    <div className="bg-dark-800 p-6 rounded-lg shadow-xl neon-border">
      <h2 className="text-xl font-semibold mb-6 text-neon-purple">{title}</h2>
      
      <div className="relative overflow-x-auto">
        {/* Timeline Header */}
        <div className="sticky top-0 bg-dark-800 z-10 mb-4 border-b border-gray-700">
          <div className="flex">
            <div className="w-32 flex-shrink-0" /> {/* Name column space */}
            <div className="flex-1 flex justify-between px-8">
              {timeSlots.map((slot, index) => (
                <div key={index} className="text-center">
                  <span className="text-sm text-gray-400">
                    {format(slot, 'HH:mm')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Timeline Rows */}
        <div className="relative">
          {drivers.map((driver) => (
            <div key={driver.id} className="flex mb-4">
              <div className="w-32 flex-shrink-0 py-2">
                <span className="text-sm font-medium text-gray-300">{driver.name}</span>
              </div>
              <div className="flex-1 relative h-16 bg-dark-700 rounded px-8"
                onDragOver={handleDragOver}
                ref={timelineRef}
              >
                <div
                  draggable
                  onDragStart={(e) => handleDragStart(e, driver.id)}
                  className={`absolute top-2 h-12 rounded cursor-move ${
                    'overlapsWith' in driver && driver.overlapsWith.length > 0
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
        </div>
      </div>
    </div>
  );
}