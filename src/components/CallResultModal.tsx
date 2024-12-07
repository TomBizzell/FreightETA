import { format } from 'date-fns';
import { Modal } from './ui/modal';
import type { Driver } from '../types/driver';
import { calculateUnlockedTime, formatUnlockedTime } from '../utils/timeUtils';

export interface CallResultModalProps {
  isOpen: boolean;
  driver?: Driver;
  originalDriver?: Driver;
  delayReason?: string;
  driverData?: any;
  onClose: () => void;
  onConfirm?: () => void;
}

const formatDate = (date: Date | undefined | null): string => {
  if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
    return 'Invalid date';
  }
  return format(date, 'MMM d, yyyy HH:mm');
};

export default function CallResultModal({ 
  isOpen,
  driver,
  originalDriver,
  delayReason,
  driverData,
  onClose,
  onConfirm 
}: CallResultModalProps) {
  if (!isOpen) return null;

  const displayData = driverData || {
    name: driver?.name,
    updatedEta: driver?.eta,
    delayReason: delayReason,
    timeUnlocked: originalDriver && driver ? 
      calculateUnlockedTime(originalDriver.eta, driver.eta) : 0
  };

  return (
    <Modal isOpen={true} onClose={onClose}>
      <div className="p-6">
        <h2 className="text-xl font-bold mb-4">Call Result: {displayData.name}</h2>
        <div className="space-y-3">
          <div>
            <span className="font-semibold">Updated ETA:</span>{' '}
            {formatDate(displayData.updatedEta)}
          </div>
          <div>
            <span className="font-semibold">Delay Reason:</span>{' '}
            {displayData.delayReason}
          </div>
          <div>
            <span className="font-semibold">Time Unlocked:</span>{' '}
            {typeof displayData.timeUnlocked === 'number'
              ? formatUnlockedTime(displayData.timeUnlocked)
              : displayData.timeUnlocked}
          </div>
        </div>
        <div className="mt-6 flex justify-end space-x-3">
          {onConfirm && (
            <button
              onClick={onConfirm}
              className="px-4 py-2 bg-neon-purple text-white rounded hover:bg-neon-glow transition-colors"
            >
              Confirm Changes
            </button>
          )}
          <button
            onClick={onClose}
            className="px-4 py-2 bg-dark-700 text-gray-300 rounded hover:bg-dark-600 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
} 