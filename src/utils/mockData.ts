import { addHours } from 'date-fns';
import type { Driver } from '../types/driver';

const baseTime = new Date();

export const mockDrivers: Driver[] = [
  {
    id: '1',
    name: 'John Smith',
    phone: '(555) 123-4567',
    eta: addHours(baseTime, 1),
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    phone: '(555) 234-5678',
    eta: addHours(baseTime, 1.5),
  },
  {
    id: '3',
    name: 'Mike Wilson',
    phone: '(555) 345-6789',
    eta: addHours(baseTime, 2),
  },
  {
    id: '4',
    name: 'Emily Davis',
    phone: '(555) 456-7890',
    eta: addHours(baseTime, 2.25),
  },
];