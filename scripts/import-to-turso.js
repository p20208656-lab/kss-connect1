// Script สำหรับ Import ข้อมูลไป Turso
// ใช้: TURSO_DATABASE_URL=xxx TURSO_AUTH_TOKEN=xxx node scripts/import-to-turso.js

const { createClient } = require('@libsql/client');
const fs = require('fs');
const path = require('path');

async function main() {
  const url = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;

  if (!url || !authToken) {
    console.log('❌ กรุณาตั้งค่า Environment Variables:');
    console.log('   TURSO_DATABASE_URL=libsql://xxx.turso.io');
    console.log('   TURSO_AUTH_TOKEN=your-token');
    console.log('\nตัวอย่างการรัน:');
    console.log('$env:TURSO_DATABASE_URL="libsql://xxx.turso.io"; $env:TURSO_AUTH_TOKEN="xxx"; node scripts/import-to-turso.js');
    process.exit(1);
  }

  console.log('🔗 กำลังเชื่อมต่อ Turso...');
  
  const client = createClient({ url, authToken });

  // สร้าง Schema ก่อน
  console.log('📝 กำลังสร้าง Schema...');
  
  const schema = `
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      class_code TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      is_admin INTEGER DEFAULT 0,
      role TEXT DEFAULT 'student',
      student_id TEXT,
      plain_password TEXT
    );
    
    CREATE TABLE IF NOT EXISTS teachers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    );
    
    CREATE TABLE IF NOT EXISTS admins (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    );
    
    CREATE TABLE IF NOT EXISTS announcements (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      priority TEXT DEFAULT 'normal',
      created_at TEXT DEFAULT (datetime('now')),
      image_url TEXT
    );
    
    CREATE TABLE IF NOT EXISTS events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      event_date TEXT NOT NULL,
      event_type TEXT DEFAULT 'general',
      created_at TEXT DEFAULT (datetime('now'))
    );
    
    CREATE TABLE IF NOT EXISTS schedules (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      class_code TEXT NOT NULL,
      day_of_week TEXT NOT NULL,
      period INTEGER NOT NULL,
      subject TEXT NOT NULL,
      teacher TEXT,
      room TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );
    
    CREATE TABLE IF NOT EXISTS reports (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      detail TEXT,
      image_url TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      status TEXT DEFAULT 'pending',
      user_id INTEGER
    );
    
    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      body TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      recipient_user_id INTEGER,
      sender_user_id INTEGER,
      is_read INTEGER DEFAULT 0
    );
    
    CREATE TABLE IF NOT EXISTS ai_knowledge (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      question TEXT NOT NULL,
      answer TEXT NOT NULL,
      keywords TEXT,
      category TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );
  `;

  // รัน schema
  const statements = schema.split(';').filter(s => s.trim());
  for (const stmt of statements) {
    if (stmt.trim()) {
      await client.execute(stmt);
    }
  }
  console.log('✅ Schema สร้างเรียบร้อย');

  // อ่านไฟล์ SQL
  const sqlPath = path.join(__dirname, 'data-export.sql');
  if (!fs.existsSync(sqlPath)) {
    console.log('⚠️  ไม่พบไฟล์ data-export.sql - ข้ามการ import ข้อมูล');
    console.log('✅ Database พร้อมใช้งานแล้ว (ยังไม่มีข้อมูล)');
    client.close();
    return;
  }

  const sqlContent = fs.readFileSync(sqlPath, 'utf-8');
  const insertStatements = sqlContent
    .split('\n')
    .filter(line => line.trim().startsWith('INSERT'));

  console.log(`📊 กำลัง Import ${insertStatements.length} records...`);

  let success = 0;
  let failed = 0;

  for (const stmt of insertStatements) {
    try {
      await client.execute(stmt);
      success++;
    } catch (e) {
      console.log('⚠️  Error:', e.message.substring(0, 50));
      failed++;
    }
  }

  console.log(`\n✅ Import สำเร็จ: ${success} records`);
  if (failed > 0) {
    console.log(`⚠️  ล้มเหลว: ${failed} records (อาจเป็น duplicate)`);
  }

  // ตรวจสอบข้อมูล
  console.log('\n📊 สรุปข้อมูลใน Turso:');
  const tables = ['users', 'teachers', 'admins', 'announcements', 'events', 'reports', 'messages', 'ai_knowledge'];
  for (const table of tables) {
    try {
      const result = await client.execute(`SELECT COUNT(*) as count FROM ${table}`);
      console.log(`   ${table}: ${result.rows[0].count} rows`);
    } catch (e) {
      console.log(`   ${table}: error`);
    }
  }

  client.close();
  console.log('\n🎉 เสร็จสิ้น!');
}

main().catch(console.error);
