import { addMinutes, differenceInMinutes, startOfHour, addHours, format } from 'date-fns';
import type { Driver, DriverWithOverlap } from '../types/driver';

const UNLOAD_TIME_MINUTES = 30; // Define constant for unload time

export interface TimelineConfig {
  startTime: Date;
  endTime: Date;
  totalMinutes: number;
  timeSlots: Date[];
  pixelsPerMinute: number;
}

function isValidDate(date: any): date is Date {
  return date instanceof Date && !isNaN(date.getTime());
}

export function calculateTimelineConfig(drivers: DriverWithOverlap[]): TimelineConfig {
  const now = new Date();
  
  if (drivers.length === 0) {
    return {
      startTime: startOfHour(now),
      endTime: addHours(startOfHour(now), 12),
      totalMinutes: 12 * 60,
      timeSlots: Array.from({ length: 13 }, (_, i) => addHours(startOfHour(now), i)),
      pixelsPerMinute: 2,
    };
  }

  // Ensure all dates are valid
  const validDrivers = drivers.filter(d => isValidDate(d.eta));
  
  if (validDrivers.length === 0) {
    return {
      startTime: startOfHour(now),
      endTime: addHours(startOfHour(now), 12),
      totalMinutes: 12 * 60,
      timeSlots: Array.from({ length: 13 }, (_, i) => addHours(startOfHour(now), i)),
      pixelsPerMinute: 2,
    };
  }

  // Find earliest and latest ETAs including unload time
  const allTimes = validDrivers.flatMap(d => [
    new Date(d.eta).getTime(),
    addMinutes(new Date(d.eta), UNLOAD_TIME_MINUTES).getTime()
  ]);
  
  const earliestTime = startOfHour(new Date(Math.min(...allTimes)));
  const latestTime = new Date(Math.max(...allTimes));
  
  // Calculate total minutes considering date crossing
  let totalMinutes = differenceInMinutes(latestTime, earliestTime);
  if (totalMinutes < 0) {
    totalMinutes += 24 * 60; // Add 24 hours worth of minutes if crossing midnight
  }
  
  // Ensure minimum timeline width
  totalMinutes = Math.max(totalMinutes + UNLOAD_TIME_MINUTES, 240); // Minimum 4 hours
  
  // Generate time slots
  const timeSlots = [];
  let currentSlot = new Date(earliestTime);
  
  while (timeSlots.length <= Math.ceil(totalMinutes / 60)) {
    timeSlots.push(new Date(currentSlot));
    currentSlot = addHours(currentSlot, 1);
  }

  return {
    startTime: earliestTime,
    endTime: addMinutes(earliestTime, totalMinutes),
    totalMinutes,
    timeSlots,
    pixelsPerMinute: 2
  };
}

interface SwapInfo {
  originalId: string;
  newId: string;
  timestamp: Date;
}

export function detectSwaps(originalDrivers: Driver[], currentDrivers: Driver[]): Map<string, SwapInfo> {
  const swaps = new Map<string, SwapInfo>();
  
  currentDrivers.forEach(currentDriver => {
    const originalDriver = originalDrivers.find(d => d.id === currentDriver.id);
    if (!originalDriver?.eta || !currentDriver.eta) return;

    // If current time is different from original time
    if (currentDriver.eta.getTime() !== originalDriver.eta.getTime()) {
      // Find another driver who has this driver's original time AND same destination
      const swappedWith = currentDrivers.find(
        d => d.id !== currentDriver.id && 
            d.eta && 
            d.destination === currentDriver.destination &&
            Math.abs(d.eta.getTime() - originalDriver.eta.getTime()) < 60000
      );
      
      if (swappedWith) {
        const swappedOriginal = originalDrivers.find(d => d.id === swappedWith.id);
        if (swappedOriginal?.eta && 
            Math.abs(currentDriver.eta.getTime() - swappedOriginal.eta.getTime()) < 60000) {
          swaps.set(currentDriver.id, {
            originalId: currentDriver.id,
            newId: swappedWith.id,
            timestamp: new Date()
          });
        }
      }
    }
  });
  
  return swaps;
}