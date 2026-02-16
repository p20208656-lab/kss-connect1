const { createClient } = require('@libsql/client');

async function assignMissingStudentIds() {
  const db = createClient({
    url: process.env.TURSO_DATABASE_URL || 'file:./data/kss.db',
    authToken: process.env.TURSO_AUTH_TOKEN
  });

  try {
    console.log('🔍 กำลังค้นหานักเรียนที่ยังไม่มีรหัส...\n');

    // ค้นหานักเรียนที่ยังไม่มีรหัส
    const noId = await db.execute(
      'SELECT id, first_name, last_name FROM users WHERE student_id IS NULL ORDER BY id ASC'
    );

    if (noId.rows.length === 0) {
      console.log('✅ ทั้งหมดมีรหัสแล้ว!');
      return;
    }

    console.log(`พบ ${noId.rows.length} คนที่ยังไม่มีรหัส\n`);

    // ค้นหา ID สูงสุดที่มีอยู่
    const maxIdResult = await db.execute(
      'SELECT MAX(CAST(student_id AS INTEGER)) as max_id FROM users WHERE student_id IS NOT NULL'
    );
    
    let maxId = Number(maxIdResult.rows[0]?.max_id || 0);

    // เพิ่มรหัสให้สำหรับแต่ละคน
    for (const user of noId.rows) {
      maxId += 1;
      const studentId = String(maxId).padStart(5, '0');

      await db.execute({
        sql: 'UPDATE users SET student_id = ? WHERE id = ?',
        args: [studentId, user.id]
      });

      console.log(`✅ เพิ่มรหัส: ${user.first_name} ${user.last_name} -> ${studentId}`);
    }

    console.log('\n📊 อัปเดตเสร็จสิ้น!');
  } catch (err) {
    console.error('ข้อผิดพลาด:', err.message);
  }
}

assignMissingStudentIds();
