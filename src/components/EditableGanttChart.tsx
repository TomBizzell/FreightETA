import React, { useState } from 'react';
import { format, differenceInMinutes } from 'date-fns';
import type { DriverWithOverlap } from '../types/driver';
import { calculateTimelineConfig } from '../utils/timelineUtils';
import { UNLOAD_TIME_MINUTES } from '../utils/timeUtils';

interface EditableGanttChartProps {
  title: string;
  drivers: DriverWithOverlap[];
  onUpdateTime: (driverId: string, newEta: Date) => void;
  onDriverClick: (driver: DriverWithOverlap) => void;
}

export function EditableGanttChart({
  title,
  drivers,
  onUpdateTime,
  onDriverClick,
}: EditableGanttChartProps) {
  const { startTime, endTime, totalMinutes, timeSlots } =
    calculateTimelineConfig(drivers);
  const [draggingId, setDraggingId] = useState<string | null>(null);

  const getBarStyles = (driver: DriverWithOverlap) => {
    const leftOffset =
      (differenceInMinutes(driver.eta, startTime) / totalMinutes) * 100;
    const width = (UNLOAD_TIME_MINUTES / totalMinutes) * 100;

    return {
      left: `${leftOffset}%`,
      width: `${width}%`,
    };
  };

  const handleDragStart = (
    e: React.DragEvent<HTMLDivElement>,
    driverId: string
  ) => {
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
    const offsetX = e.clientX - timeline.left;
    const percentageX = (offsetX / timeline.width) * 100;
    
    const minutesFromStart = (percentageX / 100) * totalMinutes;
    const newTime = new Date(startTime.getTime() + minutesFromStart * 60000);

    const driver = drivers.find((d) => d.id === draggingId);
    if (driver) {
      onUpdateTime(draggingId, newTime);
    }
  };

  return (
    <div className="bg-dark-800 p-6 rounded-lg shadow-xl neon-border">
      <h2 className="text-xl font-semibold mb-2 text-neon-purple">{title}</h2>
      <p className="text-sm text-gray-400 mb-6">
        Drag the bars to adjust arrival times or click on conflicting schedules to manage them
      </p>

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
      <div
        className="relative space-y-4"
        onDragOver={handleDragOver}
        onDrop={() => setDraggingId(null)}
      >
        {drivers.map((driver) => (
          <div key={driver.id} className="relative h-12">
            {/* Driver Name */}
            <div className="absolute left-0 top-0 w-32 h-full flex items-center">
              <span className="text-sm font-medium truncate text-gray-300">{driver.name}</span>
            </div>

            {/* Timeline Bar */}
            <div className="relative ml-32 h-full bg-dark-700 rounded">
              <div
                draggable
                onDragStart={(e) => handleDragStart(e, driver.id)}
                onClick={() => {
                  if (driver.overlapsWith.length > 0) {
                    onDriverClick(driver);
                  }
                }}
                className={`absolute top-1 h-10 rounded cursor-move ${
                  driver.overlapsWith.length > 0
                    ? 'bg-amber-500 bg-opacity-75 hover:bg-amber-400'
                    : 'bg-neon-purple bg-opacity-75 hover:bg-neon-glow'
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