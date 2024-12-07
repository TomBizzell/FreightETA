import React, { useState } from 'react';
import { format } from 'date-fns';
import { Plus, Trash2, Phone } from 'lucide-react';
import type { Driver } from '../types/driver';
import { CallDetailsModal } from './CallDetailsModal';
import { formatUnlockedTime, calculateDriverUnlockedTime } from '../utils/timeUtils';
import CallResultModal from './CallResultModal';

interface DriversTableProps {
  title: string;
  drivers: Driver[];
  originalDrivers: Driver[];
  onAddDriver: (driver: Omit<Driver, 'id'>) => void;
  onRemoveDriver: (id: string) => void;
  companyInfo: {
    name: string;
    additionalInfo: string;
  };
}

// Helper function to safely format dates
const safeFormatDate = (date: Date | null | undefined) => {
  if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
    return 'Invalid date';
  }
  return format(date, 'MMM d, yyyy HH:mm');
};

const isValidDate = (date: Date | null | undefined): date is Date => {
  return date instanceof Date && !isNaN(date.getTime());
};

export function DriversTable({
  title,
  drivers,
  originalDrivers,
  onAddDriver,
  onRemoveDriver,
  companyInfo,
}: DriversTableProps) {
  const [newDriver, setNewDriver] = useState({
    name: '',
    phone: '',
    eta: '',
  });
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [callResult, setCallResult] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showCallModal, setShowCallModal] = useState(false);
  const [callingDriverIds, setCallingDriverIds] = useState<Set<string>>(new Set());

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newDriver.name && newDriver.phone && newDriver.eta) {
      onAddDriver({
        name: newDriver.name,
        phone: newDriver.phone,
        eta: new Date(newDriver.eta),
      });
      setNewDriver({ name: '', phone: '', eta: '' });
    }
  };

  const handleDriverCall = (driver: Driver) => {
    setCallingDriverIds(prev => new Set(prev).add(driver.id));
    setSelectedDriver(driver);
    setShowCallModal(true);
  };

  const handleCallAll = () => {
    const mockResult = {
      name: "All Drivers",
      updatedEta: "Various times",
      delayReason: "Multiple reasons",
      timeUnlocked: "Various"
    };
    
    setCallResult(mockResult);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setCallResult(null);
  };

  const handleCallModalClose = () => {
    setShowCallModal(false);
    setCallingDriverIds(prev => {
      const newSet = new Set(prev);
      if (selectedDriver) {
        newSet.delete(selectedDriver.id);
      }
      return newSet;
    });
    setSelectedDriver(null);
  };

  // Split drivers into two categories
  const activeDrivers = drivers.filter(driver => {
    const originalDriver = originalDrivers.find(d => d.id === driver.id);
    if (!isValidDate(driver.eta) || !originalDriver || !isValidDate(originalDriver.eta)) {
      return true; // Show invalid dates in active section
    }
    return driver.eta.getTime() === originalDriver.eta.getTime();
  });

  const checkedInDrivers = drivers.filter(driver => {
    const originalDriver = originalDrivers.find(d => d.id === driver.id);
    if (!isValidDate(driver.eta) || !originalDriver || !isValidDate(originalDriver.eta)) {
      return false; // Don't show invalid dates in checked-in section
    }
    return driver.eta.getTime() !== originalDriver.eta.getTime();
  });

  return (
    <div className="bg-dark-800 p-6 rounded-lg shadow-xl neon-border overflow-x-auto space-y-8">
      {/* Active Drivers Section */}
      <div>
        <h2 className="text-xl font-semibold mb-4 text-neon-purple">Active Drivers</h2>
        <table className="min-w-full divide-y divide-gray-700">
          <thead className="bg-dark-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Driver Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Phone Number
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Estimated Time of Arrival
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Time Unlocked
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {activeDrivers.map((driver) => {
              const unlockedMinutes = calculateDriverUnlockedTime(
                driver,
                originalDrivers.find(d => d.id === driver.id)
              );
              
              return (
                <tr key={driver.id} className="hover:bg-dark-700 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">{driver.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{driver.phone}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {safeFormatDate(driver.eta)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={unlockedMinutes > 0 ? 'text-emerald-400' : 'text-gray-400'}>
                      {formatUnlockedTime(unlockedMinutes)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => handleDriverCall(driver)}
                        disabled={callingDriverIds.has(driver.id)}
                        className={`transition-colors ${
                          callingDriverIds.has(driver.id)
                            ? 'text-gray-500'
                            : 'text-neon-purple hover:text-neon-glow'
                        }`}
                        title={callingDriverIds.has(driver.id) ? 'Calling...' : 'Call Driver'}
                      >
                        <Phone className={`w-5 h-5 ${callingDriverIds.has(driver.id) ? 'animate-pulse' : ''}`} />
                      </button>
                      <button
                        onClick={() => onRemoveDriver(driver.id)}
                        className="text-red-400 hover:text-red-300 transition-colors"
                        title="Remove Driver"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            <tr>
              <td colSpan={4} className="px-6 py-4">
                <form onSubmit={handleSubmit} className="flex space-x-4">
                  <input
                    type="text"
                    placeholder="Driver Name"
                    value={newDriver.name}
                    onChange={(e) =>
                      setNewDriver((prev) => ({ ...prev, name: e.target.value }))
                    }
                    className="flex-1 rounded-md bg-dark-600 border-gray-600 text-gray-100 placeholder-gray-400 focus:border-neon-purple focus:ring-neon-purple"
                    required
                  />
                  <input
                    type="tel"
                    placeholder="Phone Number"
                    value={newDriver.phone}
                    onChange={(e) =>
                      setNewDriver((prev) => ({ ...prev, phone: e.target.value }))
                    }
                    className="flex-1 rounded-md bg-dark-600 border-gray-600 text-gray-100 placeholder-gray-400 focus:border-neon-purple focus:ring-neon-purple"
                    required
                  />
                  <input
                    type="datetime-local"
                    value={newDriver.eta}
                    onChange={(e) =>
                      setNewDriver((prev) => ({ ...prev, eta: e.target.value }))
                    }
                    className="flex-1 rounded-md bg-dark-600 border-gray-600 text-gray-100 focus:border-neon-purple focus:ring-neon-purple"
                    required
                  />
                  <button
                    type="submit"
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-neon-purple hover:bg-neon-glow transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-neon-purple"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    Add
                  </button>
                </form>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Checked-in Drivers Section */}
      {checkedInDrivers.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4 text-gray-400">Checked-in Drivers</h2>
          <table className="min-w-full divide-y divide-gray-700 opacity-75">
            <thead className="bg-dark-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Driver Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Phone Number
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Updated ETA
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Original ETA
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {checkedInDrivers.map((driver) => {
                const originalDriver = originalDrivers.find(d => d.id === driver.id);
                return (
                  <tr key={driver.id} className="hover:bg-dark-700 transition-colors text-gray-400">
                    <td className="px-6 py-4 whitespace-nowrap">{driver.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{driver.phone}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-green-400">
                      {safeFormatDate(driver.eta)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {originalDriver && safeFormatDate(originalDriver.eta)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => onRemoveDriver(driver.id)}
                        className="text-red-400 hover:text-red-300 transition-colors"
                        title="Remove Driver"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {showCallModal && selectedDriver && (
        <CallDetailsModal
          driver={selectedDriver}
          originalDriver={originalDrivers.find(d => d.id === selectedDriver.id)!}
          companyInfo={companyInfo}
          onClose={handleCallModalClose}
          onUpdateDriver={(updatedDriver) => {
            const updatedDrivers = drivers.map(d => 
              d.id === updatedDriver.id ? updatedDriver : d
            );
            onAddDriver(updatedDriver);
            handleCallModalClose();
          }}
        />
      )}

      <CallResultModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        driverData={callResult}
      />
    </div>
  );
}