import React from 'react';
import { X, AlertTriangle, Phone, Building2 } from 'lucide-react';
import type { DriverWithOverlap } from '../types/driver';
import { format, addMinutes } from 'date-fns';

interface ConflictModalProps {
  driver: DriverWithOverlap;
  conflictingDrivers: DriverWithOverlap[];
  onClose: () => void;
  onUpdateTime: (driverId: string, newEta: Date) => void;
  companyInfo: {
    name: string;
    additionalInfo: string;
  };
}

export function ConflictModal({
  driver,
  conflictingDrivers,
  onClose,
  onUpdateTime,
  companyInfo,
}: ConflictModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-dark-800 rounded-lg shadow-xl max-w-lg w-full mx-4 text-gray-100">
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-6 h-6 text-amber-500" />
              <h2 className="text-xl font-semibold">Manage Conflict</h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-200 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {companyInfo.name && (
            <div className="mb-4 bg-dark-700 p-4 rounded-lg">
              <div className="flex items-center mb-2">
                <Building2 className="w-4 h-4 text-neon-purple mr-2" />
                <span className="font-medium">{companyInfo.name}</span>
              </div>
              {companyInfo.additionalInfo && (
                <p className="text-sm text-gray-400 mt-1">{companyInfo.additionalInfo}</p>
              )}
            </div>
          )}

          <div className="mb-6">
            <h3 className="font-medium text-lg mb-2">{driver.name}</h3>
            <div className="flex items-center text-gray-300 mb-1">
              <Phone className="w-4 h-4 mr-2" />
              {driver.phone}
            </div>
            <p className="text-gray-300">
              Current arrival: {format(driver.eta, 'MMM d, yyyy HH:mm')}
            </p>
            <p className="text-gray-300">
              Unloading window: {format(driver.eta, 'HH:mm')} -{' '}
              {format(addMinutes(driver.eta, 30), 'HH:mm')}
            </p>
          </div>

          <div className="space-y-4">
            <h4 className="font-medium">Conflicts with:</h4>
            {conflictingDrivers.map((conflictingDriver) => (
              <div
                key={conflictingDriver.id}
                className="bg-dark-700 border border-amber-500/30 rounded-lg p-4"
              >
                <div className="flex justify-between items-center mb-2">
                  <div>
                    <span className="font-medium block">{conflictingDriver.name}</span>
                    <span className="text-sm text-gray-400 flex items-center">
                      <Phone className="w-4 h-4 mr-1" />
                      {conflictingDriver.phone}
                    </span>
                  </div>
                  <span className="text-sm text-gray-400">
                    {format(conflictingDriver.eta, 'HH:mm')} -{' '}
                    {format(addMinutes(conflictingDriver.eta, 30), 'HH:mm')}
                  </span>
                </div>
                <input
                  type="datetime-local"
                  className="mt-2 block w-full rounded-md bg-dark-600 border-gray-600 text-gray-100 focus:border-neon-purple focus:ring-neon-purple"
                  value={format(conflictingDriver.eta, "yyyy-MM-dd'T'HH:mm")}
                  onChange={(e) =>
                    onUpdateTime(conflictingDriver.id, new Date(e.target.value))
                  }
                />
              </div>
            ))}
          </div>

          <div className="mt-6 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-neon-purple text-white rounded-md hover:bg-neon-glow focus:outline-none focus:ring-2 focus:ring-neon-purple focus:ring-offset-2 focus:ring-offset-dark-800"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}