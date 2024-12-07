import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Truck, Phone, Building2 } from 'lucide-react';
import { DriversTable } from './components/DriversTable';
import { GanttChart } from './components/GanttChart';
import { EditableGanttChart } from './components/EditableGanttChart';
import { ConflictModal } from './components/ConflictModal';
import { calculateOverlaps } from './utils/timeUtils';
import { mockDrivers } from './utils/mockData';
import type { Driver, DriverWithOverlap } from './types/driver';

function App() {
  const [liveDrivers, setLiveDrivers] = useState<Driver[]>(mockDrivers);
  const [originalDrivers, setOriginalDrivers] = useState<Driver[]>(mockDrivers);
  const [selectedDriver, setSelectedDriver] = useState<DriverWithOverlap | null>(null);
  const [companyInfo, setCompanyInfo] = useState({
    name: '',
    additionalInfo: ''
  });

  const handleAddLiveDriver = (driverData: Omit<Driver, 'id'>) => {
    const newDriver: Driver = {
      id: uuidv4(),
      ...driverData,
    };
    setLiveDrivers((prev) => [...prev, newDriver]);
  };

  const handleAddOriginalDriver = (driverData: Omit<Driver, 'id'>) => {
    const newDriver: Driver = {
      id: uuidv4(),
      ...driverData,
    };
    setOriginalDrivers((prev) => [...prev, newDriver]);
  };

  const handleRemoveLiveDriver = (id: string) => {
    setLiveDrivers((prev) => prev.filter((driver) => driver.id !== id));
  };

  const handleRemoveOriginalDriver = (id: string) => {
    setOriginalDrivers((prev) => prev.filter((driver) => driver.id !== id));
  };

  const handleUpdateLiveTime = (driverId: string, newEta: Date) => {
    setLiveDrivers((prev) =>
      prev.map((driver) =>
        driver.id === driverId ? { ...driver, eta: newEta } : driver
      )
    );
  };

  const handleUpdateOriginalTime = (driverId: string, newEta: Date) => {
    setOriginalDrivers((prev) =>
      prev.map((driver) =>
        driver.id === driverId ? { ...driver, eta: newEta } : driver
      )
    );
  };

  const handleNewSchedule = () => {
    setLiveDrivers([]);
    setOriginalDrivers([]);
    setCompanyInfo({ name: '', additionalInfo: '' });
  };

  const handleCallDrivers = () => {
    const driversWithConflicts = liveDriversWithOverlaps.filter(
      (driver) => driver.overlapsWith.length > 0
    );
    if (driversWithConflicts.length > 0) {
      setSelectedDriver(driversWithConflicts[0]);
    }
  };

  const liveDriversWithOverlaps: DriverWithOverlap[] = calculateOverlaps(liveDrivers);
  const originalDriversWithOverlaps: DriverWithOverlap[] = calculateOverlaps(originalDrivers);

  const handleDriverClick = (driver: DriverWithOverlap) => {
    setSelectedDriver(driver);
  };

  const conflictingDrivers = selectedDriver
    ? liveDriversWithOverlaps.filter((d) =>
        selectedDriver.overlapsWith.includes(d.id)
      )
    : [];

  return (
    <div className="min-h-screen bg-dark-900 text-gray-100">
      <div className="max-w-7xl mx-auto py-8 px-4">
        <div className="flex flex-col items-center justify-center mb-8">
          <div className="flex items-center mb-4">
            <Truck className="w-8 h-8 text-neon-purple mr-2" />
            <h1 className="text-3xl font-bold text-gray-100">
              Driver Schedule Manager
            </h1>
          </div>

          {/* Company Information Form */}
          <div className="w-full max-w-2xl mb-8 bg-dark-800 p-6 rounded-lg shadow-xl neon-border">
            <div className="flex items-center mb-4">
              <Building2 className="w-5 h-5 text-neon-purple mr-2" />
              <h2 className="text-xl font-semibold text-gray-100">Company Information</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label htmlFor="companyName" className="block text-sm font-medium text-gray-300 mb-1">
                  Company Name
                </label>
                <input
                  type="text"
                  id="companyName"
                  value={companyInfo.name}
                  onChange={(e) => setCompanyInfo(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full rounded-md bg-dark-600 border-gray-600 text-gray-100 focus:border-neon-purple focus:ring-neon-purple"
                  placeholder="Enter company name"
                />
              </div>
              <div>
                <label htmlFor="additionalInfo" className="block text-sm font-medium text-gray-300 mb-1">
                  Additional Call Information
                </label>
                <textarea
                  id="additionalInfo"
                  value={companyInfo.additionalInfo}
                  onChange={(e) => setCompanyInfo(prev => ({ ...prev, additionalInfo: e.target.value }))}
                  className="w-full rounded-md bg-dark-600 border-gray-600 text-gray-100 focus:border-neon-purple focus:ring-neon-purple"
                  rows={3}
                  placeholder="Enter any additional information for driver calls"
                />
              </div>
            </div>
          </div>

          <div className="flex space-x-4">
            <button
              onClick={handleNewSchedule}
              className="px-4 py-2 bg-dark-700 text-gray-100 rounded-md hover:bg-dark-600 transition-colors"
            >
              New Schedule
            </button>
            <button
              onClick={handleCallDrivers}
              className="px-4 py-2 bg-neon-purple text-white rounded-md hover:bg-neon-glow transition-colors flex items-center"
            >
              <Phone className="w-4 h-4 mr-2" />
              Call Drivers
            </button>
          </div>
        </div>
        
        <div className="space-y-8">
          <DriversTable
            title="Live Schedule"
            drivers={liveDrivers}
            onAddDriver={handleAddLiveDriver}
            onRemoveDriver={handleRemoveLiveDriver}
            companyInfo={companyInfo}
          />

          <EditableGanttChart
            title="Original Schedule"
            drivers={originalDriversWithOverlaps}
            onUpdateTime={handleUpdateOriginalTime}
            onDriverClick={handleDriverClick}
          />
          
          <GanttChart
            title="Live Schedule"
            drivers={liveDriversWithOverlaps}
          />
        </div>
      </div>

      {selectedDriver && (
        <ConflictModal
          driver={selectedDriver}
          conflictingDrivers={conflictingDrivers}
          onClose={() => setSelectedDriver(null)}
          onUpdateTime={handleUpdateLiveTime}
          companyInfo={companyInfo}
        />
      )}
    </div>
  );
}

export default App;