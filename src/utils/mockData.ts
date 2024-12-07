import { addHours } from 'date-fns';
import type { Driver } from '../types/driver';

const baseTime = new Date();

export const mockDrivers: Driver[] = [
  {
    id: '1',
    name: 'John Smith',
    phone: '+447581076262',
    eta: addHours(baseTime, 1),
  },
  {
    id: '2',
    name: 'Anthony Dinh',
    phone: '+447776776058',
    eta: addHours(baseTime, 1),
  },
  {
    id: '3',
    name: 'Tom Bizzell',
    phone: '+447778885361',
    eta: addHours(baseTime, 1),
  },
  {
    id: '4',
    name: 'Zain Mobarik',
    phone: '+447795210020',
    eta: addHours(baseTime, 1),
  },
];