const { createClient } = require('@libsql/client');

async function checkStudentIds() {
  const db = createClient({
    url: process.env.TURSO_DATABASE_URL || 'file:./data/kss.db',
    authToken: process.env.TURSO_AUTH_TOKEN
  });

  try {
    // นับจำนวนนักเรียนทั้งหมด
    const allUsers = await db.execute('SELECT COUNT(*) as total FROM users');
    const totalUsers = Number(allUsers.rows[0].total);
    
    // นับจำนวนที่มีรหัสแล้ว
    const withId = await db.execute('SELECT COUNT(*) as count FROM users WHERE student_id IS NOT NULL');
    const countWithId = Number(withId.rows[0].count);
    
    // นับจำนวนที่ยังไม่มีรหัส
    const withoutId = await db.execute('SELECT COUNT(*) as count FROM users WHERE student_id IS NULL');
    const countWithoutId = Number(withoutId.rows[0].count);
    
    // แสดงสถิติ
    console.log('📊 สถิติรหัสประจำตัวนักเรียน:');
    console.log('═══════════════════════════════════');
    console.log(`นักเรียนทั้งหมด: ${totalUsers} คน`);
    console.log(`มีรหัสแล้ว: ${countWithId} คน (${((countWithId/totalUsers)*100).toFixed(1)}%)`);
    console.log(`ยังไม่มีรหัส: ${countWithoutId} คน`);
    console.log('═══════════════════════════════════');
    
    if (countWithoutId > 0) {
      console.log('\n👤 รายชื่อที่ยังไม่มีรหัส:');
      const noId = await db.execute('SELECT id, first_name, last_name, class_code FROM users WHERE student_id IS NULL ORDER BY first_name ASC');
      noId.rows.forEach((row, i) => {
        console.log(`${i+1}. ${row.first_name} ${row.last_name} (${row.class_code})`);
      });
    } else {
      console.log(`\n✅ ครบทุกคน! ทั้งหมด ${totalUsers} คนมีรหัสประจำตัวแล้ว`);
    }
  } catch (err) {
    console.error('ข้อผิดพลาด:', err.message);
  }
}

checkStudentIds();
