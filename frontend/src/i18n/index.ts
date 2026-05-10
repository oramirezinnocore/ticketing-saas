/**
 * Centralized Localization System
 * Spanish (Mexico) - es-MX
 *
 * This is the single source of truth for all UI text in the application.
 */

export { authTexts } from './auth';
export { eventTexts } from './events';
export { paymentTexts } from './payments';
export { commonTexts } from './common';

// Re-export all texts in a single object for convenience
import { authTexts } from './auth';
import { eventTexts } from './events';
import { paymentTexts } from './payments';
import { commonTexts } from './common';

export const texts = {
  auth: authTexts,
  events: eventTexts,
  payments: paymentTexts,
  common: commonTexts,
};

// Default export for easier imports
export default texts;
