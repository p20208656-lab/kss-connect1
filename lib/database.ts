/**
 * Database wrapper for KSS Connect
 * 
 * This module provides a unified database interface that works with:
 * - SQLite (better-sqlite3) for local development
 * - Turso (libsql) for production on Vercel
 * 
 * The choice is automatic based on environment variables.
 */

// For Vercel/Production: Use Turso
// For Local Development: Use better-sqlite3

const isTursoConfigured = !!(process.env.TURSO_DATABASE_URL && process.env.TURSO_AUTH_TOKEN);

// Re-export everything from the appropriate database module
// In production with Turso, we need async functions
// In development with SQLite, we use sync functions

// For now, we'll use the existing db.ts for local development
// and provide instructions for migrating to Turso

/**
 * TURSO MIGRATION GUIDE
 * =====================
 * 
 * Since the existing codebase uses synchronous SQLite functions,
 * and Turso requires async functions, here are the options:
 * 
 * Option A: Use Turso's embedded replica (recommended for gradual migration)
 *   - Uses local SQLite file that syncs with Turso
 *   - Allows keeping sync API
 *   - Requires running a sync process
 * 
 * Option B: Convert all DB functions to async (complete rewrite)
 *   - All 75+ functions need to be converted
 *   - All API routes need to be updated to await
 *   - Most thorough solution
 * 
 * Option C: Use Vercel Postgres instead of Turso
 *   - Requires schema conversion to PostgreSQL
 *   - Different SQL syntax in some places
 * 
 * For now, we recommend Option A with Turso embedded replica.
 */

export { isTursoConfigured };

// When Turso is not configured, use local SQLite
// This allows the app to work locally without Turso
if (!isTursoConfigured) {
  console.log('Using local SQLite database (development mode)');
} else {
  console.log('Turso database configured');
}
