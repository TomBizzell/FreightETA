import { addMinutes } from 'date-fns';
import type { Driver } from '../types/driver';

interface RelevanceResponse {
  status: string;
  errors: string[];
  output: {
    phone_number: string;
    ETA: string;
  };
}

export async function callDriver(driverId: string, driver: Driver): Promise<{
  success: boolean;
  data?: {
    updatedEta: Date;
    delayReason: string;
  };
  error?: string;
}> {
  try {
    const response = await fetch('https://api-f1db6c.stack.tryrelevance.com/latest/studios/193c2581-f645-4769-8faa-e484d39b8a0f/trigger_limited', {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        params: {
          phone_number: driver.phone,
          purpose_of_call: "Checking delivery status",
          company_name: "Logistics Co"
        },
        project: "4cdae3b2f076-4584-907e-b17df4690f40"
      })
    });

    if (!response.ok) {
      throw new Error('Failed to call driver');
    }

    const relevanceData: RelevanceResponse = await response.json();
    console.log('Raw API Response:', relevanceData);

    if (relevanceData.status !== 'complete' || !relevanceData.output?.ETA) {
      throw new Error('Invalid API response format');
    }

    // Convert "2200" format to a proper date/time
    const originalDate = driver.eta;
    const hours = parseInt(relevanceData.output.ETA.slice(0, 2));
    const minutes = parseInt(relevanceData.output.ETA.slice(2));

    // Create new date based on original date
    const newEta = new Date(originalDate);
    newEta.setHours(hours, minutes, 0, 0);

    // If the new time is more than 12 hours before the original time,
    // assume it's for the next day
    if (newEta.getTime() - originalDate.getTime() < -12 * 60 * 60 * 1000) {
      newEta.setDate(newEta.getDate() + 1);
    }
    // If the new time is more than 12 hours after the original time,
    // assume it's for the previous day
    else if (newEta.getTime() - originalDate.getTime() > 12 * 60 * 60 * 1000) {
      newEta.setDate(newEta.getDate() - 1);
    }

    return {
      success: true,
      data: {
        updatedEta: newEta,
        delayReason: "Updated based on driver's response"
      }
    };
  } catch (error) {
    console.error('API Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to call driver'
    };
  }
} 