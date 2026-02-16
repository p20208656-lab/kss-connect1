const { createClient } = require('@libsql/client');

async function verifySpecificUsers() {
  const url = process.env.TURSO_DATABASE_URL || 'file:./data/kss.db';
  const authToken = process.env.TURSO_AUTH_TOKEN;

  const db = createClient({
    url,
    authToken: authToken || undefined,
  });
  
  try {
    console.log('🔍 ตรวจสอบผู้ใช้ที่ "ดูเหมือน" ไม่มีรหัส...\n');
    
    // ตรวจสอบรหัส ID ที่ปรากฏในรูป
    const userIds = [270, 466, 616, 266, 512, 143, 419];
    
    console.log('ID\tชื่อ\tนามสกุล\tรหัสประจำตัว\tชั้น/ห้อง');
    console.log('─'.repeat(70));
    
    for (const userId of userIds) {
      const result = await db.execute(`
        SELECT id, first_name, last_name, student_id, class_code
        FROM users
        WHERE id = ?
      `, [userId]);
      
      if (result.rows.length > 0) {
        const user = result.rows[0];
        const studentId = user.student_id || '(null)';
        console.log(`${user.id}\t${user.first_name}\t${user.last_name}\t${studentId}\t${user.class_code}`);
      }
    }
    
    console.log('\n' + '─'.repeat(70));
    console.log('\n✨ ตรวจสอบทั่วไป:');
    
    // ตรวจสอบคนที่มี student_id = null หรือเป็น string ว่าง
    const emptyResult = await db.execute(`
      SELECT COUNT(*) as count FROM users 
      WHERE role = 'student' AND (student_id IS NULL OR student_id = '')
    `);
    
    console.log(`จำนวนคนที่ student_id IS NULL หรือ = '': ${emptyResult.rows[0].count}`);
    
    // ตรวจสอบคนที่มี student_id
    const filledResult = await db.execute(`
      SELECT COUNT(*) as count FROM users 
      WHERE role = 'student' AND student_id IS NOT NULL AND student_id != ''
    `);
    
    console.log(`จำนวนคนที่มี student_id: ${filledResult.rows[0].count}`);
    
  } catch (error) {
    console.error('❌ เกิดข้อผิดพลาด:', error.message);
  }
}

verifySpecificUsers();
