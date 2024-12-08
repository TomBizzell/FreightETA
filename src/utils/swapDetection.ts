export function detectSwaps(originalDrivers: Driver[], currentDrivers: Driver[]): Map<string, SwapInfo> {
  const swaps = new Map<string, SwapInfo>();
  
  originalDrivers.forEach(originalDriver => {
    const currentDriver = currentDrivers.find(d => d.id === originalDriver.id);
    if (!currentDriver) return;

    // Find potential swap by looking for another driver with similar time difference
    currentDrivers.forEach(otherDriver => {
      if (otherDriver.id === originalDriver.id) return;
      
      const otherOriginal = originalDrivers.find(d => d.id === otherDriver.id);
      if (!otherOriginal) return;

      // Check if destinations match
      if (originalDriver.destination !== otherOriginal.destination) return;

      // Check if times have been swapped
      const hasSwappedTimes = 
        Math.abs(differenceInMinutes(currentDriver.eta, otherOriginal.eta)) < 5 &&
        Math.abs(differenceInMinutes(otherDriver.eta, originalDriver.eta)) < 5;

      if (hasSwappedTimes) {
        swaps.set(originalDriver.id, {
          originalId: originalDriver.id,
          newId: otherDriver.id,
          type: 'swap'
        });
      }
    });
  });

  return swaps;
} 