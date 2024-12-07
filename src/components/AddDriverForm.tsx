import React, { useState } from 'react';
import { PlusCircle } from 'lucide-react';

interface AddDriverFormProps {
  onAddDriver: (name: string, eta: Date) => void;
}

export function AddDriverForm({ onAddDriver }: AddDriverFormProps) {
  const [name, setName] = useState('');
  const [eta, setEta] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && eta) {
      onAddDriver(name, new Date(eta));
      setName('');
      setEta('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Add New Driver</h2>
      <div className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Driver Name
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>
        <div>
          <label htmlFor="eta" className="block text-sm font-medium text-gray-700">
            Estimated Time of Arrival
          </label>
          <input
            type="datetime-local"
            id="eta"
            value={eta}
            onChange={(e) => setEta(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <PlusCircle className="w-5 h-5 mr-2" />
          Add Driver
        </button>
      </div>
    </form>
  );
}