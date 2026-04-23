/**
 * Shared API configuration for mapping development and production endpoints.
 * In development, it uses the local proxy defined in vite.config.js.
 * In production, it uses the VITE_API_URL environment variable.
 */
const API_BASE_URL = import.meta.env.MODE === 'production' 
  ? import.meta.env.VITE_API_URL 
  : '';

export default API_BASE_URL;
