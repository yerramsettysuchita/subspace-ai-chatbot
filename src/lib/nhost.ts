// src/lib/nhost.ts
import { NhostClient } from '@nhost/nhost-js';

const subdomain = import.meta.env.VITE_NHOST_SUBDOMAIN;
const region = import.meta.env.VITE_NHOST_REGION;

// Debug logging for development
if (import.meta.env.DEV) {
  console.log('Nhost Config Debug:', { 
    subdomain, 
    region,
    hasSubdomain: !!subdomain,
    env: import.meta.env.MODE
  });
}

// Provide defaults for development if env vars are missing
const config = {
  subdomain: subdomain || 'local-dev',
  region: region || 'us-east-1',
};

// Show warning if subdomain is missing
if (!subdomain && import.meta.env.DEV) {
  console.warn('⚠️ VITE_NHOST_SUBDOMAIN not found. Using development mode.');
}

const nhostClient = new NhostClient({
  subdomain: config.subdomain,
  region: config.region,
  clientStorageType: 'localStorage',
  autoSignIn: true,
  autoRefreshToken: true,
});

export const nhost = nhostClient;

// Test connection only in development
if (import.meta.env.DEV) {
  // Simple connection test
  const testConnection = async () => {
    try {
      await nhost.graphql.request(`query { __typename }`);
      console.log('✅ Nhost GraphQL connection successful');
    } catch (error) {
      console.log('⚠️ Nhost GraphQL connection failed (this is normal for first setup):', error);
    }
  };
  
  setTimeout(testConnection, 1000);
}