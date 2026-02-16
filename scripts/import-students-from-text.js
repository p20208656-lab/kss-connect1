// นำเข้ารายชื่อจากไฟล์ข้อความ data/students-list.txt ไปยัง Turso
// รูปแบบบรรทัด: ม.<ชั้น>\t<ห้อง>\t<ชื่อ>\t<นามสกุล>
// รองรับช่องว่างในชื่อ โดยจะถือ token สุดท้ายเป็นนามสกุล ที่เหลือเป็นชื่อ

const { createClient } = require('@libsql/client');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const DEFAULT_PASSWORD = '123456';

async function main() {
  const url = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;
  if (!url || !authToken) {
    console.log('❌ กรุณาตั้งค่า TURSO_DATABASE_URL และ TURSO_AUTH_TOKEN');
    process.exit(1);
  }

  const filePath = path.join(__dirname, '..', 'data', 'students-list.txt');
  if (!fs.existsSync(filePath)) {
    console.log('❌ ไม่พบไฟล์ data/students-list.txt');
    process.exit(1);
  }

  const raw = fs.readFileSync(filePath, 'utf-8');
  const lines = raw.split(/\r?\n/).filter(l => l.trim()).filter(l => !l.startsWith('ชั้น'));

  const client = createClient({ url, authToken });
  const passwordHash = await bcrypt.hash(DEFAULT_PASSWORD, 10);

  let success = 0;
  let skipped = 0;
  let failed = 0;

  for (const line of lines) {
    try {
      // ถ้ามี tab ให้ parse ด้วย tab เพื่อคงช่องว่างในชื่อ/นามสกุล
      let gradeStr, roomStr, first_name, last_name;
      if (line.includes('\t')) {
        const cols = line.split('\t');
        if (cols.length < 4) {
          console.log('⚠️  บรรทัดไม่ครบข้อมูล (tab) ข้าม:', line);
          failed++;
          continue;
        }
        gradeStr = cols[0];
        roomStr = cols[1];
        first_name = cols[2].trim();
        last_name = cols[3].trim();
      } else {
        const parts = line.trim().split(/\s+/);
        if (parts.length < 4) {
          console.log('⚠️  บรรทัดไม่ครบข้อมูล ข้าม:', line);
          failed++;
          continue;
        }
        gradeStr = parts[0];
        roomStr = parts[1];
        const nameTokens = parts.slice(2);
        last_name = nameTokens[nameTokens.length - 1];
        first_name = nameTokens.slice(0, -1).join(' ');
      }

      // แปลงข้อความพิเศษของนามสกุล
      if (['ไม่มีนามสกุล', 'ไม่ปรากฏนามสกุล'].includes(last_name)) {
        last_name = '-';
      }
      const grade = parseInt(gradeStr.replace('ม.', ''), 10);
      const room = parseInt(roomStr, 10);
      const class_code = `ม.${grade}/${room}`;

      // ตรวจซ้ำ
      const existing = await client.execute({
        sql: 'SELECT id FROM users WHERE first_name = ? AND last_name = ? AND class_code = ?',
        args: [first_name, last_name, class_code]
      });
      if (existing.rows.length > 0) {
        console.log(`⏭️  มีอยู่แล้ว: ${first_name} ${last_name} (${class_code})`);
        skipped++;
        continue;
      }

      await client.execute({
        sql: `INSERT INTO users (first_name, last_name, class_code, password_hash, created_at, role)
              VALUES (?, ?, ?, ?, datetime('now'), 'student')`,
        args: [first_name, last_name, class_code, passwordHash]
      });
      console.log(`✅ เพิ่ม ${first_name} ${last_name} (${class_code})`);
      success++;
    } catch (e) {
      console.log('❌ Error บรรทัด:', line);
      console.log('   ', e.message);
      failed++;
    }
  }

  const total = await client.execute('SELECT COUNT(*) as count FROM users');
  console.log('\n' + '='.repeat(50));
  console.log('📊 สรุป:');
  console.log(`   ✅ เพิ่มสำเร็จ: ${success}`);
  console.log(`   ⏭️  ข้าม (มีอยู่แล้ว): ${skipped}`);
  console.log(`   ❌ ล้มเหลว: ${failed}`);
  console.log(`   👥 นักเรียนทั้งหมด: ${total.rows[0].count}`);
  console.log('='.repeat(50));
  console.log(`\n🔑 รหัสผ่านเริ่มต้น: ${DEFAULT_PASSWORD}`);

  client.close();
}

main().catch(console.error);
