import { addMinutes, isWithinInterval, differenceInMinutes } from 'date-fns';
import type { Driver, DriverWithOverlap } from '../types/driver';

export const UNLOAD_TIME_MINUTES = 30;

export function calculateOverlaps(drivers: Driver[]): DriverWithOverlap[] {
  return drivers.map(driver => {
    const driverInterval = {
      start: driver.eta,
      end: addMinutes(driver.eta, UNLOAD_TIME_MINUTES)
    };

    const overlaps = drivers
      .filter(otherDriver => 
        otherDriver.id !== driver.id &&
        (isWithinInterval(otherDriver.eta, driverInterval) ||
         isWithinInterval(addMinutes(otherDriver.eta, UNLOAD_TIME_MINUTES), driverInterval) ||
         isWithinInterval(driver.eta, {
           start: otherDriver.eta,
           end: addMinutes(otherDriver.eta, UNLOAD_TIME_MINUTES)
         }))
      )
      .map(d => d.id);

    return {
      ...driver,
      overlapsWith: overlaps
    };
  });
}

export function calculateUnlockedTime(originalEta: Date, currentEta: Date): number {
  if (currentEta > originalEta) {
    return differenceInMinutes(currentEta, originalEta);
  }
  return 0;
}

export function formatUnlockedTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return hours > 0 ? `${hours}h ${remainingMinutes}m` : `${remainingMinutes}m`;
}

export function calculateDriverUnlockedTime(
  driver: Driver,
  originalDriver: Driver | undefined
): number {
  if (!originalDriver || driver.eta <= originalDriver.eta) {
    return 0;
  }
  return differenceInMinutes(driver.eta, originalDriver.eta);
}