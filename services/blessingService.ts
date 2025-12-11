import { Blessing } from '../types';
import { BLESSINGS } from '../constants';

export const getRandomBlessing = (): Blessing => {
  const index = Math.floor(Math.random() * BLESSINGS.length);
  return BLESSINGS[index];
};

// In a real scenario with API_KEY, we would use GoogleGenAI here.
// For this demo, we return instantaneous results for the best UIUX.
export const generateNewBlessing = async (): Promise<Blessing> => {
  // Simulate network delay for effect
  await new Promise(resolve => setTimeout(resolve, 600)); 
  return getRandomBlessing();
};
