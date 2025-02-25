/**
 * Generates a unique event ID using timestamp and random number
 */
export const createEventId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};
