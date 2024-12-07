export interface Driver {
  id: string;
  name: string;
  eta: Date;
  phone: string;
}

export interface DriverWithOverlap extends Driver {
  overlapsWith: string[];
}