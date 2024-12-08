import React, { useState } from 'react';
import { format } from 'date-fns';
import { Plus, Trash2, Phone, Check, AlertTriangle, Clock } from 'lucide-react';
import type { Driver } from '../types/driver';
import type { SwapInfo } from '../types/swap';
import { CallDetailsModal } from './CallDetailsModal';
import { formatUnlockedTime, calculateDriverUnlockedTime } from '../utils/timeUtils';
import CallResultModal from './CallResultModal';
import { differenceInMinutes } from 'date-fns';

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
  swaps: Map<string, SwapInfo>;
  confirmedSwaps: Set<string>;
  onConfirmUpdate: (driverId: string) => void;
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

const getDriverStatus = (driver: Driver, originalDrivers: Driver[], swaps: Map<string, SwapInfo>, confirmedSwaps: Set<string>) => {
  const originalDriver = originalDrivers.find(d => d.id === driver.id);
  
  if (!isValidDate(driver.eta) || !originalDriver || !isValidDate(originalDriver.eta)) {
    return 'active';
  }

  const hasSwap = swaps.has(driver.id);
  const hasUpdate = driver.eta.getTime() !== originalDriver.eta.getTime();
  const isConfirmed = confirmedSwaps.has(driver.id);

  if ((hasSwap || hasUpdate) && !isConfirmed) {
    return 'pending';
  }

  if (isConfirmed) {
    return 'checked-in';
  }

  return 'active';
};

const getDelayInfo = (originalEta: Date, updatedEta: Date): { message: string; type: 'early' | 'delayed' | 'ontime' } => {
  const diffMinutes = differenceInMinutes(updatedEta, originalEta);
  if (diffMinutes > 0) {
    return {
      message: `Delayed by ${diffMinutes} minutes`,
      type: 'delayed'
    };
  } else if (diffMinutes < 0) {
    return {
      message: `Early by ${Math.abs(diffMinutes)} minutes`,
      type: 'early'
    };
  }
  return {
    message: 'On time',
    type: 'ontime'
  };
};

export function DriversTable({
  title,
  drivers,
  originalDrivers,
  onAddDriver,
  onRemoveDriver,
  companyInfo,
  swaps,
  confirmedSwaps,
  onConfirmUpdate,
}: DriversTableProps) {
  const [newDriver, setNewDriver] = useState({
    name: '',
    phone: '',
    eta: '',
    destination: '',
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
        destination: newDriver.destination,
      });
      setNewDriver({ name: '', phone: '', eta: '', destination: '' });
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
  const activeDrivers = drivers.filter(driver => 
    getDriverStatus(driver, originalDrivers, swaps, confirmedSwaps) === 'active'
  );

  const pendingDrivers = drivers.filter(driver => 
    getDriverStatus(driver, originalDrivers, swaps, confirmedSwaps) === 'pending'
  );

  const checkedInDrivers = drivers.filter(driver => 
    getDriverStatus(driver, originalDrivers, swaps, confirmedSwaps) === 'checked-in'
  );

  const handleConfirmUpdate = (driverId: string) => {
    // Implement the logic to confirm the update
  };

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
                Destination
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
                  <td className="px-6 py-4 whitespace-nowrap">{driver.destination}</td>
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
                  <input
                    type="text"
                    placeholder="Destination"
                    value={newDriver.destination}
                    onChange={(e) =>
                      setNewDriver((prev) => ({ ...prev, destination: e.target.value }))
                    }
                    className="flex-1 rounded-md bg-dark-600 border-gray-600 text-gray-100 placeholder-gray-400 focus:border-neon-purple focus:ring-neon-purple"
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

      {/* Pending Updates */}
      {pendingDrivers.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4 text-neon-purple">Pending Updates</h2>
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
                  Original ETA
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Updated ETA
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {pendingDrivers.map((driver) => {
                const originalDriver = originalDrivers.find(d => d.id === driver.id);
                const hasSwap = swaps.has(driver.id);
                const swapInfo = swaps.get(driver.id);
                
                return (
                  <tr key={driver.id} className="hover:bg-dark-700 transition-colors text-gray-400">
                    <td className="px-6 py-4 whitespace-nowrap">{driver.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{driver.phone}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {originalDriver && safeFormatDate(originalDriver.eta)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-green-400">
                      {safeFormatDate(driver.eta)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <span className="text-amber-400">Time Update</span>
                        <div className="relative group">
                          {originalDriver && (() => {
                            const delayInfo = getDelayInfo(originalDriver.eta, driver.eta);
                            return (
                              <>
                                {delayInfo.type === 'delayed' ? (
                                  <AlertTriangle className="w-4 h-4 text-amber-400 cursor-help" />
                                ) : (
                                  <Clock className="w-4 h-4 text-emerald-400 cursor-help" />
                                )}
                                <div className="absolute hidden group-hover:block z-10 w-48 p-2 mt-2 text-sm bg-dark-700 rounded-lg shadow-xl -left-1/2 transform -translate-x-1/4">
                                  <span className={
                                    delayInfo.type === 'delayed' ? 'text-amber-400' : 
                                    delayInfo.type === 'early' ? 'text-emerald-400' : 
                                    'text-gray-400'
                                  }>
                                    {delayInfo.message}
                                  </span>
                                </div>
                              </>
                            );
                          })()}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => onConfirmUpdate(driver.id)}
                          className="text-green-400 hover:text-green-300 transition-colors"
                          title="Confirm Update"
                        >
                          <Check className="w-5 h-5" />
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
            </tbody>
          </table>
        </div>
      )}

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
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {checkedInDrivers.map((driver) => (
                <tr key={driver.id} className="hover:bg-dark-700 transition-colors text-gray-400">
                  <td className="px-6 py-4 whitespace-nowrap">{driver.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{driver.phone}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-emerald-400">
                    {safeFormatDate(driver.eta)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {originalDrivers.find(d => d.id === driver.id)?.eta && 
                     safeFormatDate(originalDrivers.find(d => d.id === driver.id)!.eta)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-emerald-400">Checked-in</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => onRemoveDriver(driver.id)}
                      className="text-red-500 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
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