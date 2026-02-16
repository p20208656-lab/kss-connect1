const fs = require('fs');
const path = require('path');
const bcryptjs = require('bcryptjs');
const { createClient } = require('@libsql/client');

// Initialize database client
const db = createClient({
  url: process.env.TURSO_DATABASE_URL || 'file:./data/kss.db',
  authToken: process.env.TURSO_AUTH_TOKEN
});


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
      const parts = lines[i].split('\t').map((value) => value.trim());
      if (parts.length >= 5) {
        const [level, room, studentId, firstName, lastName] = parts;
        if (level && room && studentId && firstName && lastName) {
          students.push({
            level,
            room,
            studentId,
            firstName,
            lastName
          });
        }
        continue;
      }

      if (parts.length === 4) {
        const [level, room, studentId, fullName] = parts;
        if (!level || !room || !studentId || !fullName) {
          continue;
        }

        const nameParts = fullName.split(' ').filter(Boolean);
        const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : '-';
        const firstName = nameParts.length > 1 ? nameParts.slice(0, -1).join(' ') : fullName;

        students.push({
          level,
          room,
          studentId,
          firstName,
          lastName
        });
      }
    }
    
    console.log(`📋 พบนักเรียน: ${students.length} คน\n`);
    
    // Import students
    let successCount = 0;
    let failCount = 0;
    const errors = [];
    
    // Generate default password hash (password: "12345678")
    const defaultPassword = '12345678';
    const passwordHash = await bcryptjs.hash(defaultPassword, 10);
    
    for (const student of students) {
      try {
        const classCode = createClassCode(student.level, student.room);
        const createdAt = new Date().toISOString();
        
        await db.execute({
          sql: `INSERT INTO users (first_name, last_name, student_id, class_code, password_hash, role, created_at) 
                VALUES (?, ?, ?, ?, ?, ?, ?)
                ON CONFLICT(first_name, last_name, class_code) DO UPDATE SET
                  student_id = excluded.student_id,
                  password_hash = excluded.password_hash,
                  role = excluded.role`,
          args: [
            student.firstName,
            student.lastName,
            student.studentId,
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
