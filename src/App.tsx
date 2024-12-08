import { useState } from 'react';
import { Truck, Phone } from 'lucide-react';
import { mockDrivers } from './utils/mockData';
import { calculateOverlaps } from './utils/timeUtils';
import { TimeUnlockedCard } from './components/TimeUnlockedCard';
import { DriversTable } from './components/DriversTable';
import { EditableGanttChart } from './components/EditableGanttChart';
import { BulkCallModal } from './components/BulkCallModal';
import type { Driver, DriverWithOverlap } from './types/driver';
import type { SwapInfo } from './types/swap';

function App() {
  const [liveDrivers, setLiveDrivers] = useState<Driver[]>(mockDrivers);
  const [originalDrivers, _setOriginalDrivers] = useState<Driver[]>(mockDrivers);
  const [showBulkCallModal, setShowBulkCallModal] = useState(false);
  const [swaps, setSwaps] = useState<Map<string, SwapInfo>>(new Map());
  const [confirmedSwaps, setConfirmedSwaps] = useState<Set<string>>(new Set());
  const [hoveredSwap, setHoveredSwap] = useState<[string, string] | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const companyInfo = {
    name: '',
    additionalInfo: ''
  };

  const liveDriversWithOverlaps: DriverWithOverlap[] = calculateOverlaps(liveDrivers);

  const onAddDriver = (driverWithoutId: Omit<Driver, "id"> & { id?: string }) => {
    if (driverWithoutId.id) {
      // Update existing driver
      setLiveDrivers(prevDrivers =>
        prevDrivers.map(driver =>
          driver.id === driverWithoutId.id
            ? { ...driverWithoutId as Driver }
            : driver
        )
      );
    } else {
      // Add new driver
      const newDriver = {
        ...driverWithoutId,
        id: crypto.randomUUID()
      };
      setLiveDrivers([...liveDrivers, newDriver]);
    }
  };

  const onRemoveDriver = (driverId: string) => {
    setLiveDrivers(liveDrivers.filter(driver => driver.id !== driverId));
  };

  const onUpdateDriverTime = (driverId: string, newEta: Date) => {
    setLiveDrivers(prevDrivers =>
      prevDrivers.map(driver =>
        driver.id === driverId ? { ...driver, eta: newEta } : driver
      )
    );
  };

  const onUpdateOriginalTime = (driverId: string, newEta: Date) => {
    _setOriginalDrivers(prevDrivers =>
      prevDrivers.map(driver =>
        driver.id === driverId ? { ...driver, eta: newEta } : driver
      )
    );
  };

  const handleBulkDriverUpdate = (updatedDrivers: Driver[]) => {
    setLiveDrivers(prevDrivers => {
      const driverMap = new Map(updatedDrivers.map(d => [d.id, d]));
      return prevDrivers.map(driver => 
        driverMap.has(driver.id) ? driverMap.get(driver.id)! : driver
      );
    });
  };

  const handleConfirmSwap = (driverId: string) => {
    const swapInfo = swaps.get(driverId);
    if (swapInfo) {
      const next = new Set(confirmedSwaps);
      next.add(driverId);
      next.add(swapInfo.newId);
      setConfirmedSwaps(next);
    }
  };

  const handleConfirmUpdate = (driverId: string) => {
    const next = new Set(confirmedSwaps);
    next.add(driverId);
    setConfirmedSwaps(next);
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
            <div className="flex justify-end">
              <button
                onClick={() => setShowBulkCallModal(true)}
                className="px-4 py-2 bg-neon-purple text-white rounded-md hover:bg-neon-glow transition-colors flex items-center"
              >
                <Phone className="w-4 h-4 mr-2" />
                Call All Drivers
              </button>
            </div>

            <DriversTable 
              title="Current Schedule"
              drivers={liveDriversWithOverlaps}
              originalDrivers={originalDrivers}
              onAddDriver={onAddDriver}
              onRemoveDriver={onRemoveDriver}
              companyInfo={companyInfo}
              swaps={swaps}
              confirmedSwaps={confirmedSwaps}
              onConfirmUpdate={handleConfirmUpdate}
            />

            <EditableGanttChart 
              drivers={liveDriversWithOverlaps}
              originalDrivers={originalDrivers}
              title="Schedule Timeline"
              onUpdateTime={onUpdateDriverTime}
              onUpdateOriginalTime={onUpdateOriginalTime}
              onSwapsChange={setSwaps}
              onConfirmedSwapsChange={setConfirmedSwaps}
              confirmedSwaps={confirmedSwaps}
              onDriverClick={(driver) => {
                // Add your click handler here
              }}
              currentDate={currentDate}
              onDateChange={setCurrentDate}
            />
          </div>
        </div>

        {showBulkCallModal && (
          <BulkCallModal
            drivers={liveDrivers}
            originalDrivers={originalDrivers}
            onClose={() => setShowBulkCallModal(false)}
            onUpdateDrivers={handleBulkDriverUpdate}
          />
        )}
      </div>
    </div>
  );
}

export default App;