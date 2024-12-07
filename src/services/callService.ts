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

    // Convert "2200" format to today's date with that time
    const today = new Date();
    const hours = parseInt(relevanceData.output.ETA.slice(0, 2));
    const minutes = parseInt(relevanceData.output.ETA.slice(2));
    const newEta = new Date(today.setHours(hours, minutes, 0, 0));

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