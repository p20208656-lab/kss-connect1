const fs = require('fs');
const path = require('path');
const { createClient } = require('@libsql/client');

// Initialize database client
const db = createClient({
  url: process.env.TURSO_DATABASE_URL || 'file:./data/kss.db',
  authToken: process.env.TURSO_AUTH_TOKEN
});

// Function to create class code from ชั้น and ห้อง
function createClassCode(level, room) {
  const levelCode = level.replace('ม.', 'm').toLowerCase();
  return `${levelCode}/${room}`;
}

// Main import function
async function updateStudentIds() {
  try {
    console.log('🚀 เริ่มอัดเดตรหัสนักเรียนจากข้อมูล...\n');
    
    // Parse the provided data
    const studentData = [
      { level: 'ม.1', room: '1', id: '06541', firstName: 'ทัตเทพ', lastName: 'เรือนงาม' },
      { level: 'ม.1', room: '1', id: '06542', firstName: 'บรรณสรณ์', lastName: 'ผันแปรจิต' },
      { level: 'ม.1', room: '1', id: '06546', firstName: 'พิชญุตม์', lastName: 'ศรีพูล' },
      { level: 'ม.1', room: '1', id: '06548', firstName: 'วรโชติ', lastName: 'มากดี' },
      { level: 'ม.1', room: '1', id: '06551', firstName: 'พงศกร', lastName: 'ผิวนิล' },
      { level: 'ม.1', room: '1', id: '06554', firstName: 'เกียรติบดินทร์', lastName: 'แจ่มกลาง' },
      { level: 'ม.1', room: '1', id: '06555', firstName: 'ศยุภัฑฐ์', lastName: 'โสตวัย' },
      { level: 'ม.1', room: '1', id: '06556', firstName: 'ภัทรวิทย์', lastName: 'คงรอด' },
      { level: 'ม.1', room: '1', id: '06557', firstName: 'คุณธรรม', lastName: 'พรหมทองสุข' },
      { level: 'ม.1', room: '1', id: '06566', firstName: 'เดชฤทธิ์', lastName: 'สอนขำ' },
      { level: 'ม.1', room: '1', id: '06567', firstName: 'ภูมินทร์', lastName: 'บุญทัน' },
      { level: 'ม.1', room: '1', id: '06568', firstName: 'สหัศชัย', lastName: 'นนทะนำ' },
      { level: 'ม.1', room: '1', id: '06535', firstName: 'รสริน', lastName: 'บัวนาค' },
      { level: 'ม.1', room: '1', id: '06536', firstName: 'กานต์ธิดา', lastName: 'จูเซ่ง' },
      { level: 'ม.1', room: '1', id: '06537', firstName: 'เปรมณพิชญ์', lastName: 'วาณิชย์เจริญ' },
    ];
    
    console.log(`📋 เตรียมอัดเดต: ${studentData.length} คน\n`);
    
    let successCount = 0;
    let failCount = 0;
    const updates = [];
    
    for (const student of studentData) {
      try {
        const classCode = createClassCode(student.level, student.room);
        
        // Find user by name and class code
        const result = await db.execute({
          sql: 'SELECT id FROM users WHERE first_name = ? AND last_name = ? AND class_code = ?',
          args: [student.firstName.trim(), student.lastName.trim(), classCode]
        });
        
        if (result.rows.length > 0) {
          const userId = result.rows[0].id;
          
          // Update student ID
          await db.execute({
            sql: 'UPDATE users SET student_id = ? WHERE id = ?',
            args: [student.id, userId]
          });
          
          successCount++;
          updates.push({
            name: `${student.firstName} ${student.lastName}`,
            class: `${student.level}/${student.room}`,
            studentId: student.id
          });
          
          if (successCount % 50 === 0) {
            console.log(`✅ อัดเดต: ${successCount} คน`);
          }
        } else {
          failCount++;
        }
      } catch (err) {
        failCount++;
      }
    }
    
    console.log('\n📊 สรุปผลการอัดเดต:');
    console.log('═══════════════════════════════════');
    console.log(`อัดเดตสำเร็จ: ${successCount} คน`);
    console.log(`ล้มเหลว/ไม่พบ: ${failCount} คน`);
    console.log('═══════════════════════════════════');
    
    if (updates.length > 0 && updates.length <= 15) {
      console.log('\n🎯 รายชื่อที่อัดเดต (ตัวอย่าง):');
      updates.slice(0, 15).forEach((u, idx) => {
        console.log(`${idx + 1}. ${u.name} (${u.class}) -> ${u.studentId}`);
      });
    }
    
    console.log('\n✅ เสร็จสิ้น!');
  } catch (err) {
    console.error('❌ เกิดข้อผิดพลาด:', err);
    process.exit(1);
  }
}

updateStudentIds();
