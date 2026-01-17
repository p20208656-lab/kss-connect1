// Script สำหรับ Export ข้อมูลจาก Local SQLite เป็น SQL
const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'data', 'kss.db');

if (!fs.existsSync(dbPath)) {
  console.log('❌ ไม่พบไฟล์ database:', dbPath);
  process.exit(1);
}

const db = new Database(dbPath);
let output = '';

// ฟังก์ชันสำหรับ escape string ใน SQL
function escapeSQL(str) {
  if (str === null || str === undefined) return 'NULL';
  return "'" + String(str).replace(/'/g, "''") + "'";
}

// Export ข้อมูลจากแต่ละตาราง
const tables = [
  'users',
  'teachers', 
  'admins',
  'announcements',
  'events',
  'schedules',
  'reports',
  'messages',
  'dress_code_rules',
  'ai_knowledge'
];

for (const table of tables) {
  try {
    const rows = db.prepare(`SELECT * FROM ${table}`).all();
    
    if (rows.length > 0) {
      output += `\n-- Table: ${table}\n`;
      output += `-- ${rows.length} rows\n`;
      
      for (const row of rows) {
        const columns = Object.keys(row).join(', ');
        const values = Object.values(row).map(v => {
          if (v === null) return 'NULL';
          if (typeof v === 'number') return v;
          return escapeSQL(v);
        }).join(', ');
        
        output += `INSERT INTO ${table} (${columns}) VALUES (${values});\n`;
      }
    }
    
    console.log(`✅ ${table}: ${rows.length} rows`);
  } catch (e) {
    console.log(`⚠️  ${table}: ไม่มีตารางนี้หรือเกิดข้อผิดพลาด`);
  }
}

// บันทึกไฟล์
const outputPath = path.join(__dirname, 'data-export.sql');
fs.writeFileSync(outputPath, output);

console.log('\n📁 Export สำเร็จ:', outputPath);
console.log('\n📋 ขั้นตอนถัดไป:');
console.log('1. Copy เนื้อหาจากไฟล์ data-export.sql');
console.log('2. ไปที่ Turso Dashboard > Database > Shell');
console.log('3. วาง SQL และรัน');

db.close();
