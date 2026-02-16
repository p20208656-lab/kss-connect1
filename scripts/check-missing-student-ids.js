const { createClient } = require('@libsql/client');

async function checkMissingStudentIds() {
  const url = process.env.TURSO_DATABASE_URL || 'file:./data/kss.db';
  const authToken = process.env.TURSO_AUTH_TOKEN;

  const db = createClient({
    url,
    authToken: authToken || undefined,
  });
  
  try {
    console.log('🔍 กำลังตรวจสอบนักเรียนที่ยังไม่มีรหัส...\n');
    
    // ดึงรายชื่อคนที่ยังไม่มี student_id
    const missingIdsResult = await db.execute(`
      SELECT id, first_name, last_name, class_code, created_at
      FROM users
      WHERE role = 'student' AND (student_id IS NULL OR student_id = '')
      ORDER BY class_code, first_name, last_name
    `);
    
    const missingIds = missingIdsResult.rows;
    
    // ดึงสถิติทั่วไป
    const statsResult = await db.execute(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN student_id IS NOT NULL AND student_id != '' THEN 1 END) as with_id,
        COUNT(CASE WHEN student_id IS NULL OR student_id = '' THEN 1 END) as without_id
      FROM users
      WHERE role = 'student'
    `);
    
    const stats = statsResult.rows[0];
    
    console.log('📊 สรุปสถิติ:');
    console.log(`นักเรียนทั้งหมด: ${stats.total} คน`);
    console.log(`มีรหัสแล้ว: ${stats.with_id} คน (${((stats.with_id / stats.total) * 100).toFixed(1)}%)`);
    console.log(`ยังไม่มีรหัส: ${stats.without_id} คน (${((stats.without_id / stats.total) * 100).toFixed(1)}%)\n`);
    
    if (missingIds.length > 0) {
      console.log(`⚠️  รายชื่อ ${missingIds.length} คนที่ยังไม่มีรหัส:\n`);
      console.log('ID\tชื่อ\tนามสกุล\tชั้น/ห้อง');
      console.log('--------------------------------------------------------------------------');
      
      missingIds.forEach(student => {
        console.log(`${student.id}\t${student.first_name}\t${student.last_name}\t${student.class_code}`);
      });
    } else {
      console.log('✅ ครบทุกคน! ทั้งหมด ' + stats.total + ' คนมีรหัสประจำตัวแล้ว');
    }
    
  } catch (error) {
    console.error('❌ เกิดข้อผิดพลาด:', error.message);
  }
}

checkMissingStudentIds();
