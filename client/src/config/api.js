// Central API configuration
// Driven by Vite environment variables.
//
// For LOCAL development:
//   Copy client/.env.example → client/.env.local  (git-ignored)
//
// For PRODUCTION (AWS):
//   CI/CD injects VITE_* vars as GitHub Secrets at build time.

export const SWIPE_API    = import.meta.env.VITE_SWIPE_API_URL    || 'http://localhost:8080';
export const USER_JOB_API = import.meta.env.VITE_USER_JOB_API_URL || 'http://localhost:8081';
export const ML_OUTPUTS   = import.meta.env.VITE_ML_OUTPUTS_URL   || '/ml_outputs';
