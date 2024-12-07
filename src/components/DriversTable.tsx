import React, { useState } from 'react';
import { format } from 'date-fns';
import { Plus, Trash2, Phone } from 'lucide-react';
import type { Driver } from '../types/driver';
import { CallDetailsModal } from './CallDetailsModal';

interface DriversTableProps {
  title: string;
  drivers: Driver[];
  onAddDriver: (driver: Omit<Driver, 'id'>) => void;
  onRemoveDriver: (id: string) => void;
  companyInfo: {
    name: string;
    additionalInfo: string;
  };
}

export function DriversTable({
  title,
  drivers,
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

  return (
    <div className="bg-dark-800 p-6 rounded-lg shadow-xl neon-border overflow-x-auto">
      <h2 className="text-xl font-semibold mb-4 text-neon-purple">{title}</h2>
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
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-700">
          {drivers.map((driver) => (
            <tr key={driver.id} className="hover:bg-dark-700 transition-colors">
              <td className="px-6 py-4 whitespace-nowrap">{driver.name}</td>
              <td className="px-6 py-4 whitespace-nowrap">{driver.phone}</td>
              <td className="px-6 py-4 whitespace-nowrap">
                {format(driver.eta, 'MMM d, yyyy HH:mm')}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setSelectedDriver(driver)}
                    className="text-neon-purple hover:text-neon-glow transition-colors"
                    title="Call Driver"
                  >
                    <Phone className="w-5 h-5" />
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
          ))}
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

      {selectedDriver && (
        <CallDetailsModal
          driver={selectedDriver}
          companyInfo={companyInfo}
          onClose={() => setSelectedDriver(null)}
        />
      )}
    </div>
  );
}