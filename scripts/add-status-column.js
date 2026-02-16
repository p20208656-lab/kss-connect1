/**
 * Migration Script: Add 'status' column to messages table
 * 
 * Run this script to add the approval status column to existing messages.
 * Existing messages will be marked as 'approved' so they remain visible.
 * New messages will be marked as 'pending' by default.
 * 
 * Usage:
 * $env:TURSO_DATABASE_URL="libsql://your-database.turso.io"
 * $env:TURSO_AUTH_TOKEN="your-token"
 * node scripts/add-status-column.js
 */

const { createClient } = require('@libsql/client');

(async () => {
  const url = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;

  if (!url || !authToken) {
    console.log('❌ กรุณาตั้งค่า TURSO_DATABASE_URL และ TURSO_AUTH_TOKEN');
    console.log('');
    console.log('ตัวอย่าง (PowerShell):');
    console.log('$env:TURSO_DATABASE_URL="libsql://your-database.turso.io"');
    console.log('$env:TURSO_AUTH_TOKEN="your-token"');
    console.log('node scripts/add-status-column.js');
    return;
  }

  const db = createClient({ url, authToken });

  try {
    // Add status column with default 'approved' for existing messages
    await db.execute("ALTER TABLE messages ADD COLUMN status TEXT DEFAULT 'approved'");
    console.log('✅ Added status column to messages table');
    console.log('   - Existing messages are marked as "approved"');
    console.log('   - New messages will be marked as "pending"');
    
    // Count messages
    const result = await db.execute('SELECT COUNT(*) as count FROM messages');
    console.log(`   - Total messages: ${result.rows[0]?.count || 0}`);
  } catch (e) {
    if (e.message.includes('duplicate column')) {
      console.log('ℹ️ Column "status" already exists');
    } else {
      console.log('❌ Error:', e.message);
    }
  }
})();
