import { addMinutes, isWithinInterval } from 'date-fns';
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