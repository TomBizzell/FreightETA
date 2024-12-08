import type { Driver, DriverWithOverlap } from '../../types/driver';
import type { SwapInfo } from '../../types/swap';

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