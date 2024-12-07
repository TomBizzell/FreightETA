import { useState } from 'react';
import { X, Phone, Users } from 'lucide-react';
import type { Driver } from '../types/driver';
import { callDriver } from '../services/callService';
import { format } from 'date-fns';

interface BulkCallModalProps {
  drivers: Driver[];
  originalDrivers: Driver[];
  onClose: () => void;
  onUpdateDrivers: (updatedDrivers: Driver[]) => void;
}

export function BulkCallModal({ drivers, originalDrivers, onClose, onUpdateDrivers }: BulkCallModalProps) {
  const [calling, setCalling] = useState(false);
  const [results, setResults] = useState<Array<{
    driver: Driver;
    delayReason: string;
  }>>([]);

  const handleBulkCall = async () => {
    setCalling(true);
    
    try {
      const results = await Promise.all(
        drivers.map(driver => callDriver(driver.id, driver))
      );

      // Process successful results with proper date parsing
      const updatedDrivers = results
        .filter(result => result.success && result.data)
        .map((result, index) => {
          const updatedEta = new Date(result.data!.updatedEta);
          return {
            ...drivers[index],
            eta: isNaN(updatedEta.getTime()) ? drivers[index].eta : updatedEta
          };
        });

      setResults(updatedDrivers.map(driver => ({
        driver,
        delayReason: "Traffic delay",
      })));
    } catch (error) {
      console.error('Failed to call drivers:', error);
    } finally {
      setCalling(false);
    }
  };

  if (results.length > 0) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-dark-800 rounded-lg shadow-xl max-w-2xl w-full mx-4 text-gray-100">
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">Call Results</h2>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {results.map(({ driver, delayReason }) => (
                <div key={driver.id} className="bg-dark-700 p-4 rounded-lg">
                  <h3 className="font-medium">{driver.name}</h3>
                  <p className="text-gray-300">New ETA: {format(driver.eta, 'HH:mm')}</p>
                  <p className="text-gray-400 text-sm">{delayReason}</p>
                </div>
              ))}
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => {
                  onUpdateDrivers(results.map(r => r.driver));
                  onClose();
                }}
                className="px-4 py-2 bg-neon-purple text-white rounded-md hover:bg-neon-glow transition-colors"
              >
                Update All
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-dark-800 rounded-lg shadow-xl max-w-lg w-full mx-4 text-gray-100">
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center space-x-2">
              <Users className="w-6 h-6 text-neon-purple" />
              <h2 className="text-xl font-semibold">Bulk Call Drivers</h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-200 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="space-y-4">
            <div className="bg-dark-700 p-4 rounded-lg">
              <h3 className="font-medium mb-2">Selected Drivers ({drivers.length})</h3>
              <div className="space-y-2">
                {drivers.map(driver => (
                  <div key={driver.id} className="flex items-center text-gray-300">
                    <Phone className="w-4 h-4 mr-2 text-neon-purple" />
                    <span>{driver.name} - {driver.phone}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-dark-700 text-gray-300 rounded-md hover:bg-dark-600 transition-colors"
                disabled={calling}
              >
                Cancel
              </button>
              <button
                onClick={handleBulkCall}
                disabled={calling}
                className="px-4 py-2 bg-neon-purple text-white rounded-md hover:bg-neon-glow transition-colors flex items-center"
              >
                <Phone className="w-4 h-4 mr-2" />
                {calling ? 'Calling...' : 'Call All Drivers'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 