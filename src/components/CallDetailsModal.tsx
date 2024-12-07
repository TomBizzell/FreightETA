import React, { useState } from 'react';
import { X, Phone, MessageSquare } from 'lucide-react';
import type { Driver } from '../types/driver';
import CallResultModal, { CallResultModalProps } from './CallResultModal';
import { callDriver } from '../services/callService';

interface CallDetailsModalProps {
  driver: Driver;
  originalDriver: Driver;
  companyInfo: {
    name: string;
    additionalInfo: string;
  };
  onClose: () => void;
  onUpdateDriver: (updatedDriver: Driver) => void;
}

export function CallDetailsModal({ driver, originalDriver, companyInfo, onClose, onUpdateDriver }: CallDetailsModalProps) {
  const [callDetails, setCallDetails] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [updatedDriver, setUpdatedDriver] = useState<Driver | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCall = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await callDriver(driver.id, driver);
      console.log('API Response:', result);
      
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to call driver');
      }
      
      const updatedDriverData = {
        ...driver,
        eta: result.data.updatedEta,
      };
      
      console.log('Updated Driver Data:', updatedDriverData);
      setUpdatedDriver(updatedDriverData);
      setCallDetails(result.data.delayReason);
      setShowResult(true);
      onUpdateDriver(updatedDriverData);
    } catch (err) {
      console.error('Call Error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  if (showResult && updatedDriver) {
    console.log({
      updatedDriver,
      originalDriver,
      callDetails
    });

    return (
      <CallResultModal
        isOpen={true}
        driver={updatedDriver}
        originalDriver={originalDriver}
        delayReason={callDetails || "No specific reason provided"}
        onClose={onClose}
        onConfirm={() => {
          onUpdateDriver(updatedDriver);
          onClose();
        }}
      />
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-dark-800 rounded-lg shadow-xl max-w-lg w-full mx-4 text-gray-100">
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center space-x-2">
              <Phone className="w-6 h-6 text-neon-purple" />
              <h2 className="text-xl font-semibold">Call Driver</h2>
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
              <h3 className="font-medium text-lg">{driver.name}</h3>
              <p className="text-gray-400">{driver.phone}</p>
            </div>

            {companyInfo.name && (
              <div className="bg-dark-700 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Company Information</h4>
                <p className="text-gray-300">{companyInfo.name}</p>
                {companyInfo.additionalInfo && (
                  <p className="text-gray-400 mt-1 text-sm">{companyInfo.additionalInfo}</p>
                )}
              </div>
            )}

            <div>
              <label htmlFor="callDetails" className="block text-sm font-medium text-gray-300 mb-2">
                Additional Call Details
              </label>
              <textarea
                id="callDetails"
                value={callDetails}
                onChange={(e) => setCallDetails(e.target.value)}
                className="w-full rounded-md bg-dark-600 border-gray-600 text-gray-100 focus:border-neon-purple focus:ring-neon-purple"
                rows={4}
                placeholder="Enter any specific questions or information for this call..."
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-dark-700 text-gray-300 rounded-md hover:bg-dark-600 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleCall}
              disabled={isLoading}
              className={`px-4 py-2 bg-neon-purple text-white rounded-md hover:bg-neon-glow transition-colors flex items-center ${
                isLoading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <Phone className={`w-4 h-4 mr-2 ${isLoading ? 'animate-pulse' : ''}`} />
              {isLoading ? 'Calling...' : 'Call Now'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}