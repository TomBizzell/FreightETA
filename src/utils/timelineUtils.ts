import { addMinutes, differenceInMinutes, startOfHour, addHours, format } from 'date-fns';
import type { DriverWithOverlap } from '../types/driver';

export interface TimelineConfig {
  startTime: Date;
  endTime: Date;
  totalMinutes: number;
  timeSlots: Date[];
}

export function calculateTimelineConfig(drivers: DriverWithOverlap[]): TimelineConfig {
  if (drivers.length === 0) {
    const now = new Date();
    return {
      startTime: now,
      endTime: addHours(now, 2),
      totalMinutes: 120,
      timeSlots: Array.from({ length: 3 }, (_, i) => addHours(now, i)),
    };
  }

  const earliestEta = startOfHour(
    new Date(Math.min(...drivers.map((d) => d.eta.getTime())))
  );
  const latestEta = new Date(Math.max(
    ...drivers.map((d) => addMinutes(d.eta, 30).getTime())
  ));

  // Add padding to the timeline
  const startTime = addHours(earliestEta, -1);
  const endTime = addHours(latestEta, 1);
  const totalMinutes = differenceInMinutes(endTime, startTime);

  // Create time slots for the timeline (hourly)
  const timeSlots: Date[] = [];
  let currentSlot = startTime;
  while (currentSlot <= endTime) {
    timeSlots.push(currentSlot);
    currentSlot = addHours(currentSlot, 1);
  }

  return { startTime, endTime, totalMinutes, timeSlots };
}