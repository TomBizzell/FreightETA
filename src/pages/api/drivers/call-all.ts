import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Implement your logic to call all drivers here
    // This is just example data
    const callAllResult = {
      name: "All Drivers",
      updatedEta: new Date(Date.now() + 3600000).toISOString(),
      delayReason: "Multiple delays",
      timeUnlocked: new Date().toISOString(),
    };

    return res.status(200).json(callAllResult);
  } catch (error) {
    console.error('Error calling all drivers:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
} 