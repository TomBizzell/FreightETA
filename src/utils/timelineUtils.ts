import { addMinutes, differenceInMinutes, startOfHour, addHours, format } from 'date-fns';
import type { DriverWithOverlap } from '../types/driver';

const UNLOAD_TIME_MINUTES = 30; // Define constant for unload time

export interface TimelineConfig {
  startTime: Date;
  endTime: Date;
  totalMinutes: number;
  timeSlots: Date[];
  pixelsPerMinute: number;
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

  // Find earliest and latest ETAs including unload time
  const allTimes = drivers.flatMap(d => [
    d.eta.getTime(),
    addMinutes(d.eta, UNLOAD_TIME_MINUTES).getTime()
  ]);
  
  const earliestTime = startOfHour(new Date(Math.min(...allTimes)));
  const latestTime = startOfHour(addHours(new Date(Math.max(...allTimes)), 1));

  // Ensure minimum 4-hour window
  const minEndTime = addHours(earliestTime, 4);
  const endTime = latestTime > minEndTime ? latestTime : minEndTime;
  
  const totalMinutes = differenceInMinutes(endTime, earliestTime);
  const timeSlots = Array.from(
    { length: Math.ceil(totalMinutes / 60) + 1 }, 
    (_, i) => addHours(earliestTime, i)
  );

  return {
    startTime: earliestTime,
    endTime,
    totalMinutes,
    timeSlots,
    pixelsPerMinute: 2
  };
}