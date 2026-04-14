/**
 * Application Initialization
 * Runs on app startup to initialize background jobs and services
 */

// Import QB Sync Job (auto-starts when imported)
import '@/jobs/quickbooks-sync';

console.log('[App Init] ✅ QB Sync job initialized');

export const initializeApp = () => {
  console.log('[App Init] 🚀 Application initialization complete');
};
