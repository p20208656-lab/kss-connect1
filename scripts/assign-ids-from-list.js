const fs = require('fs');
const path = require('path');
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
  const levelCode = level.replace('ม.', 'm').toLowerCase();
  return `${levelCode}/${room}`;
}

// Main function
async function updateMissingStudentIds() {
  try {
    console.log('🚀 เริ่มอัดเดตรหัสนักเรียนจาก students-list.txt...\n');
    
    // Read students-list.txt
    const filePath = path.join(__dirname, '../data/students-list.txt');
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const lines = fileContent.trim().split('\n');
    
    // Skip header (first line)
    const students = [];
    for (let i = 1; i < lines.length; i++) {
      const parts = lines[i].split('\t');
      if (parts.length >= 4) {
        const [level, room, firstName, lastName] = parts;
        if (level && room && firstName && lastName) {
          students.push({
            level: level.trim(),
            room: room.trim(),
            firstName: firstName.trim(),
            lastName: lastName.trim()
          });
        }
      }
    }
    
    console.log(`📋 พบนักเรียน: ${students.length} คน\n`);
    
    let successCount = 0;
    let alreadyHaveId = 0;
    let notFound = 0;
    const updates = [];
    
    for (const student of students) {
      try {
        const classCode = createClassCode(student.level, student.room);
        
        // Find user by name and class code
        const result = await db.execute({
          sql: 'SELECT id, student_id FROM users WHERE first_name = ? AND last_name = ? AND class_code = ?',
          args: [student.firstName, student.lastName, classCode]
        });
        
        if (result.rows.length > 0) {
          const user = result.rows[0];
          const userId = user.id;
          
          if (user.student_id) {
            // Already has ID
            alreadyHaveId++;
          } else {
            // Assign new ID
            const studentId = await generateStudentId();
            
            await db.execute({
              sql: 'UPDATE users SET student_id = ? WHERE id = ?',
              args: [studentId, userId]
            });
            
            successCount++;
            updates.push({
              name: `${student.firstName} ${student.lastName}`,
              class: `${student.level}/${student.room}`,
              studentId: studentId
            });
            
            if (successCount % 50 === 0) {
              console.log(`✅ อัดเดต: ${successCount} คน`);
            }
          }
        } else {
          notFound++;
        }
      } catch (err) {
        console.error(`❌ เกิดข้อผิดพลาด: ${student.firstName} ${student.lastName} - ${err.message}`);
      }
    }
    
    console.log('\n📊 สรุปผลการอัดเดต:');
    console.log('═══════════════════════════════════');
    console.log(`อัดเดตสำเร็จ: ${successCount} คน`);
    console.log(`มีรหัสแล้ว: ${alreadyHaveId} คน`);
    console.log(`ไม่พบในระบบ: ${notFound} คน`);
    console.log('═══════════════════════════════════');
    
    if (updates.length > 0 && updates.length <= 20) {
      console.log('\n🎯 รายชื่อที่อัดเดต:');
      updates.forEach((u, idx) => {
        console.log(`${idx + 1}. ${u.name} (${u.class}) -> ${u.studentId}`);
      });
    } else if (updates.length > 20) {
      console.log(`\n🎯 แสดง 20 รายการแรกจาก ${updates.length} คน:`);
      updates.slice(0, 20).forEach((u, idx) => {
        console.log(`${idx + 1}. ${u.name} (${u.class}) -> ${u.studentId}`);
      });
    }
    
    console.log('\n✅ เสร็จสิ้น!');
  } catch (err) {
    console.error('❌ เกิดข้อผิดพลาด:', err);
    process.exit(1);
  }
}

updateMissingStudentIds();
