// Loads .env when present (Node 20.12+). Import first in every entry point.
try {
  (process as unknown as { loadEnvFile: (p?: string) => void }).loadEnvFile('.env');
} catch {
  /* no .env file */
}
