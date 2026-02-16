const { createClient } = require('@libsql/client');

// Initialize database client
const db = createClient({
  url: process.env.TURSO_DATABASE_URL || 'file:./data/kss.db',
  authToken: process.env.TURSO_AUTH_TOKEN
});

// Function to generate student ID
async function generateStudentId() {
  const result = await db.execute({
    sql: `SELECT MAX(CAST(student_id AS INTEGER)) as max_id FROM users WHERE student_id IS NOT NULL`
  });
  let maxId = Number(result.rows[0]?.max_id || 0);
  return String(maxId + 1).padStart(5, '0');
}

// Main function
async function updateMissingIds() {
  try {
    console.log('🔍 กำลังค้นหานักเรียนที่ยังไม่มีรหัส...\n');
    
    // Find all users without student_id
    const usersWithoutId = await db.execute({
      sql: `SELECT id, first_name, last_name, class_code FROM users WHERE student_id IS NULL ORDER BY id`
    });
    
    const missingCount = usersWithoutId.rows.length;
    console.log(`พบ ${missingCount} คนที่ยังไม่มีรหัส\n`);
    
    if (missingCount === 0) {
      console.log('✅ ทั้งหมดมีรหัสแล้ว!');
      process.exit(0);
    }
    
    // Assign student IDs to users without IDs
    let successCount = 0;
    let failCount = 0;
    const updates = [];
    
    for (const user of usersWithoutId.rows) {
      try {
        const studentId = await generateStudentId();
        
        await db.execute({
          sql: 'UPDATE users SET student_id = ? WHERE id = ?',
          args: [studentId, user.id]
        });
        
        successCount++;
        updates.push({
          name: `${user.first_name} ${user.last_name}`,
          class: user.class_code,
          studentId: studentId
        });
        
        console.log(`✅ ${user.first_name} ${user.last_name} (${user.class_code}) -> ${studentId}`);
      } catch (err) {
        failCount++;
        console.error(`❌ ล้มเหลว: ${user.first_name} ${user.last_name} - ${err.message}`);
      }
    }
    
    console.log('\n📊 สรุปผลการอัปเดต:');
    console.log('═══════════════════════════════════');
    console.log(`อัปเดตสำเร็จ: ${successCount} คน`);
    console.log(`ล้มเหลว: ${failCount} คน`);
    console.log('═══════════════════════════════════');
    
    if (updates.length > 0) {
      console.log('\n🎯 รายชื่อที่อัปเดต:');
      updates.forEach((u, idx) => {
        console.log(`${idx + 1}. ${u.name} (${u.class}) -> ${u.studentId}`);
      });
    }
    
    console.log('\n✅ เสร็จสิ้น!');
  } catch (err) {
    console.error('❌ เกิดข้อผิดพลาด:', err);
    process.exit(1);
  }
}

updateMissingIds();
