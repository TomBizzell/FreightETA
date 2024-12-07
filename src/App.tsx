import { useState } from 'react';
import { Truck } from 'lucide-react';
import { mockDrivers } from './utils/mockData';
import { calculateOverlaps } from './utils/timeUtils';
import { TimeUnlockedCard } from './components/TimeUnlockedCard';
import { DriversTable } from './components/DriversTable';
import { GanttChart } from './components/GanttChart';
import type { Driver, DriverWithOverlap } from './types/driver';

function App() {
  const [liveDrivers, setLiveDrivers] = useState<Driver[]>(mockDrivers);
  const [originalDrivers, _setOriginalDrivers] = useState<Driver[]>(mockDrivers);
  const companyInfo = {
    name: '',
    additionalInfo: ''
  };

  const liveDriversWithOverlaps: DriverWithOverlap[] = calculateOverlaps(liveDrivers);

  const onAddDriver = (driverWithoutId: Omit<Driver, "id">) => {
    const newDriver = {
      ...driverWithoutId,
      id: crypto.randomUUID()  // Generate a unique ID
    };
    setLiveDrivers([...liveDrivers, newDriver]);
  };

  const onRemoveDriver = (driverId: string) => {
    setLiveDrivers(liveDrivers.filter(driver => driver.id !== driverId));
  };

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

          <div className="w-full max-w-sm mb-8">
            <TimeUnlockedCard 
              originalDrivers={originalDrivers}
              liveDrivers={liveDrivers}
            />
          </div>

          <div className="w-full space-y-8">
            <DriversTable 
              title="Current Schedule"
              drivers={liveDriversWithOverlaps}
              onAddDriver={onAddDriver}
              onRemoveDriver={onRemoveDriver}
              companyInfo={companyInfo}
            />

            <GanttChart 
              drivers={liveDriversWithOverlaps}
              title="Schedule Timeline"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;