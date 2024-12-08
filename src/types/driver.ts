export interface Driver {
  id: string;
  name: string;
  eta: Date;
  phone: string;
  destination: string;
  overlapsWith?: string[];
}

export interface DriverWithOverlap extends Driver {
  overlapsWith: string[];
}