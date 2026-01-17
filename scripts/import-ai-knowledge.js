// Script สำหรับ Import AI Knowledge ไป Turso (จัดการ multiline)
const { createClient } = require('@libsql/client');
const Database = require('better-sqlite3');
const path = require('path');

async function main() {
  const url = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;

  if (!url || !authToken) {
    console.log('❌ กรุณาตั้งค่า TURSO_DATABASE_URL และ TURSO_AUTH_TOKEN');
    process.exit(1);
  }

  // เชื่อมต่อ Local SQLite
  const localDbPath = path.join(__dirname, '..', 'data', 'kss.db');
  const localDb = new Database(localDbPath);
  
  // เชื่อมต่อ Turso
  console.log('🔗 กำลังเชื่อมต่อ Turso...');
  const client = createClient({ url, authToken });

  // ดึงข้อมูล ai_knowledge จาก local
  const aiKnowledge = localDb.prepare('SELECT * FROM ai_knowledge').all();
  console.log(`📊 พบ ${aiKnowledge.length} records ใน ai_knowledge`);

  let success = 0;
  let failed = 0;

  for (const row of aiKnowledge) {
    try {
      await client.execute({
        sql: `INSERT INTO ai_knowledge (id, question, answer, keywords, category, created_at, updated_at) 
              VALUES (?, ?, ?, ?, ?, ?, ?)`,
        args: [row.id, row.question, row.answer, row.keywords, row.category, row.created_at, row.updated_at]
      });
      success++;
      process.stdout.write(`\r✅ Imported: ${success}/${aiKnowledge.length}`);
    } catch (e) {
      if (e.message.includes('UNIQUE constraint')) {
        // Skip duplicates
      } else {
        console.log(`\n⚠️  Error row ${row.id}:`, e.message.substring(0, 80));
      }
      failed++;
    }
  }

  console.log(`\n\n✅ Import สำเร็จ: ${success} records`);
  if (failed > 0) {
    console.log(`⚠️  ข้าม: ${failed} records`);
  }

  // ตรวจสอบ
  const result = await client.execute('SELECT COUNT(*) as count FROM ai_knowledge');
  console.log(`📊 ai_knowledge ใน Turso: ${result.rows[0].count} rows`);

  localDb.close();
  client.close();
  console.log('🎉 เสร็จสิ้น!');
}

main().catch(console.error);
