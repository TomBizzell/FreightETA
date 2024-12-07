import React from 'react';
import { format } from 'date-fns';
import { Clock, AlertTriangle } from 'lucide-react';
import type { DriverWithOverlap } from '../types/driver';

interface DriverTimelineProps {
  drivers: DriverWithOverlap[];
  onRemoveDriver: (id: string) => void;
}

export function DriverTimeline({ drivers, onRemoveDriver }: DriverTimelineProps) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Driver Schedule</h2>
      <div className="space-y-4">
        {drivers.map((driver) => (
          <div
            key={driver.id}
            className={`p-4 rounded-lg border ${
              driver.overlapsWith.length > 0
                ? 'border-amber-200 bg-amber-50'
                : 'border-green-200 bg-green-50'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Clock className="w-5 h-5 text-gray-600" />
                <div>
                  <h3 className="font-medium">{driver.name}</h3>
                  <p className="text-sm text-gray-600">
                    ETA: {format(driver.eta, 'MMM d, yyyy HH:mm')}
                  </p>
                </div>
              </div>
              <button
                onClick={() => onRemoveDriver(driver.id)}
                className="text-red-600 hover:text-red-800"
              >
                Remove
              </button>
            </div>
            {driver.overlapsWith.length > 0 && (
              <div className="mt-2 flex items-start space-x-2 text-amber-700">
                <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                <p className="text-sm">
                  Overlaps with:{' '}
                  {driver.overlapsWith
                    .map(
                      (id) => drivers.find((d) => d.id === id)?.name || 'Unknown'
                    )
                    .join(', ')}
                </p>
              </div>
            )}
          </div>
        ))}
        {drivers.length === 0 && (
          <p className="text-center text-gray-500">No drivers scheduled yet</p>
        )}
      </div>
    </div>
  );
}