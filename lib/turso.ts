import { createClient, Client } from '@libsql/client';

// Turso database client for production (Vercel)
// Falls back to local SQLite for development

const isProduction = process.env.NODE_ENV === 'production';
const tursoUrl = process.env.TURSO_DATABASE_URL;
const tursoAuthToken = process.env.TURSO_AUTH_TOKEN;

let tursoClient: Client | null = null;

export function getTursoClient(): Client {
  if (!tursoClient) {
    if (tursoUrl && tursoAuthToken) {
      // Production: Use Turso
      tursoClient = createClient({
        url: tursoUrl,
        authToken: tursoAuthToken,
      });
      console.log('Connected to Turso database');
    } else if (tursoUrl && tursoUrl.startsWith('file:')) {
      // Local development with libsql file
      tursoClient = createClient({
        url: tursoUrl,
      });
      console.log('Connected to local libsql database');
    } else {
      // Fallback for development without Turso env vars
      // This will use in-memory or throw an error
      throw new Error(
        'Database not configured. Set TURSO_DATABASE_URL and TURSO_AUTH_TOKEN environment variables.'
      );
    }
  }
  return tursoClient;
}

// Check if Turso is configured
export function isTursoConfigured(): boolean {
  return !!(tursoUrl && (tursoAuthToken || tursoUrl.startsWith('file:')));
}

// Initialize schema for Turso
export async function initializeTursoSchema() {
  const client = getTursoClient();
  
  const schema = `
    CREATE TABLE IF NOT EXISTS logins (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      class_code TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
    
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      student_id TEXT,
      class_code TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT DEFAULT 'student',
      created_at TEXT NOT NULL,
      UNIQUE(first_name, last_name, class_code)
    );
    
    CREATE TABLE IF NOT EXISTS events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      event_date TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
    
    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      body TEXT NOT NULL,
      recipient_user_id INTEGER,
      sender_user_id INTEGER,
      is_read INTEGER DEFAULT 0,
      created_at TEXT NOT NULL
    );
    
    CREATE TABLE IF NOT EXISTS reports (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      detail TEXT,
      image_url TEXT,
      user_id INTEGER,
      created_at TEXT NOT NULL
    );
    
    CREATE TABLE IF NOT EXISTS admins (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
    
    CREATE TABLE IF NOT EXISTS dress_code (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      image_url TEXT,
      created_at TEXT NOT NULL
    );
    
    CREATE TABLE IF NOT EXISTS schedules (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      date TEXT,
      created_at TEXT NOT NULL
    );
    
    CREATE TABLE IF NOT EXISTS announcements (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      priority TEXT DEFAULT 'normal',
      image_url TEXT,
      created_at TEXT NOT NULL
    );
    
    CREATE TABLE IF NOT EXISTS teachers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      teacher_id TEXT,
      password_hash TEXT NOT NULL,
      created_at TEXT NOT NULL,
      UNIQUE(first_name, last_name)
    );
    
    CREATE TABLE IF NOT EXISTS ai_knowledge (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      question TEXT NOT NULL,
      answer TEXT NOT NULL,
      keywords TEXT,
      category TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `;
  
  // Execute each statement separately
  const statements = schema.split(';').filter(s => s.trim());
  for (const stmt of statements) {
    if (stmt.trim()) {
      await client.execute(stmt);
    }
  }
  
  console.log('Turso schema initialized');
}

// Export client for direct usage
export { tursoClient };
