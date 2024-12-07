import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { driverId } = req.query;

  try {
    // Implement your actual driver calling logic here
    // This is just example data
    const driverCallResult = {
      name: "Driver Name",
      updatedEta: new Date(Date.now() + 3600000).toISOString(),
      delayReason: "Traffic congestion",
      timeUnlocked: new Date().toISOString(),
    };

    return res.status(200).json(driverCallResult);
  } catch (error) {
    console.error('Error calling driver:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
} 