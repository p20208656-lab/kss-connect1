const fs = require('fs');
const path = require('path');
const bcryptjs = require('bcryptjs');
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

// Function to create class code from ชั้น and ห้อง
function createClassCode(level, room) {
  // Convert level: ม.1 -> m1, ม.2 -> m2, etc.
  const levelCode = level.replace('ม.', 'm').toLowerCase();
  return `${levelCode}/${room}`;
}

// Main import function
async function importStudents() {
  try {
    console.log('🚀 เริ่มเข้านักเรียน...\n');
    
    // Read students-list.txt
    const filePath = path.join(__dirname, '../data/students-list.txt');
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const lines = fileContent.trim().split('\n');
    
    // Skip header
    const students = [];
    for (let i = 1; i < lines.length; i++) {
      const [level, room, firstName, lastName] = lines[i].split('\t');
      if (level && room && firstName && lastName) {
        students.push({
          level: level.trim(),
          room: room.trim(),
          firstName: firstName.trim(),
          lastName: lastName.trim()
        });
      }
    }
    
    console.log(`📋 พบนักเรียน: ${students.length} คน\n`);
    
    // Import students
    let successCount = 0;
    let failCount = 0;
    const errors = [];
    
    // Generate default password hash (password: "123456")
    const defaultPassword = '123456';
    const passwordHash = await bcryptjs.hash(defaultPassword, 10);
    
    for (const student of students) {
      try {
        const classCode = createClassCode(student.level, student.room);
        const studentId = await generateStudentId();
        const createdAt = new Date().toISOString();
        
        await db.execute({
          sql: `INSERT INTO users (first_name, last_name, student_id, class_code, password_hash, role, created_at) 
                VALUES (?, ?, ?, ?, ?, ?, ?)`,
          args: [
            student.firstName,
            student.lastName,
            studentId,
            classCode,
            passwordHash,
            'student',
            createdAt
          ]
        });
        
        successCount++;
        if (successCount % 100 === 0) {
          console.log(`✅ อัปเดต: ${successCount} คน`);
        }
      } catch (err) {
        failCount++;
        errors.push({
          student: `${student.firstName} ${student.lastName}`,
          error: err.message
        });
      }
    }
    
    console.log('\n📊 สรุปผลการเข้ารหัสนักเรียน:');
    console.log('═══════════════════════════════════');
    console.log(`นำเข้าเสร็จสิ้น: ${successCount} คน`);
    console.log(`ล้มเหลว: ${failCount} คน`);
    console.log('═══════════════════════════════════');
    
    if (errors.length > 0 && errors.length <= 10) {
      console.log('\n⚠️  ข้อผิดพลาด:');
      errors.forEach((e, idx) => {
        console.log(`${idx + 1}. ${e.student}: ${e.error}`);
      });
    }
    
    console.log('\n✅ เสร็จสิ้น!');
  } catch (err) {
    console.error('❌ เกิดข้อผิดพลาด:', err);
    process.exit(1);
  }
}

// Run import
importStudents().then(() => {
  process.exit(0);
});
