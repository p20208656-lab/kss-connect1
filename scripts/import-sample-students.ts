import { createClient } from '@libsql/client';

// เชื่อมต่อฐานข้อมูล
const db = createClient({
  url: process.env.TURSO_DATABASE_URL || 'file:./data/kss.db',
  authToken: process.env.TURSO_AUTH_TOKEN || undefined,
});

/**
 * ข้อมูลนักเรียนที่ต้องใส่ลงในฐานข้อมูล
 */
const studentsData = [
  { grade: 'ม.1', room: 1, studentId: '06541', firstName: 'ทัตเทพ', lastName: 'เรือนงาม' },
  { grade: 'ม.1', room: 1, studentId: '06542', firstName: 'บรรณสรณ์', lastName: 'ผันแปรจิต' },
  { grade: 'ม.1', room: 1, studentId: '06546', firstName: 'พิชญุตม์', lastName: 'ศรีพูล' },
  { grade: 'ม.1', room: 1, studentId: '06548', firstName: 'วรโชติ', lastName: 'มากดี' },
  { grade: 'ม.1', room: 1, studentId: '06551', firstName: 'พงศกร', lastName: 'ผิวนิล' },
  { grade: 'ม.1', room: 1, studentId: '06554', firstName: 'เกียรติบดินทร์', lastName: 'แจ่มกลาง' },
  { grade: 'ม.1', room: 1, studentId: '06555', firstName: 'ศยุภัฑฐ์', lastName: 'โสตวัย' },
  { grade: 'ม.1', room: 1, studentId: '06556', firstName: 'ภัทรวิทย์', lastName: 'คงรอด' },
  { grade: 'ม.1', room: 1, studentId: '06557', firstName: 'คุณธรรม', lastName: 'พรหมทองสุข' },
  { grade: 'ม.1', room: 1, studentId: '06566', firstName: 'เดชฤทธิ์', lastName: 'สอนขำ' },
];

async function importStudents() {
  try {
    console.log('📥 กำลังนำเข้าข้อมูลนักเรียน...\n');

    let successCount = 0;
    let skipCount = 0;

    for (const student of studentsData) {
      const classCode = `${student.grade}/${student.room}`;

      try {
        // ตรวจสอบว่ามีนักเรียนคนนี้อยู่แล้วหรือไม่
        const existing = await db.execute({
          sql: 'SELECT id FROM users WHERE first_name = ? AND last_name = ? AND class_code = ?',
          args: [student.firstName, student.lastName, classCode]
        });

        if (existing.rows.length > 0) {
          const userId = Number(existing.rows[0].id);
          // อัปเดตรหัสนักเรียน
          await db.execute({
            sql: 'UPDATE users SET student_id = ? WHERE id = ?',
            args: [student.studentId, userId]
          });
          console.log(`✏️  อัปเดต: ${student.firstName} ${student.lastName} (${student.studentId})`);
          skipCount++;
        } else {
          // สร้างนักเรียนใหม่
          await db.execute({
            sql: 'INSERT INTO users (first_name, last_name, student_id, class_code, password_hash, created_at) VALUES (?, ?, ?, ?, ?, ?)',
            args: [
              student.firstName,
              student.lastName,
              student.studentId,
              classCode,
              'temp_hash', // รหัสผ่านชั่วคราว
              new Date().toISOString()
            ]
          });
          console.log(`➕ เพิ่มใหม่: ${student.firstName} ${student.lastName} (${student.studentId})`);
          successCount++;
        }
      } catch (err: any) {
        console.log(`❌ ข้อผิดพลาด: ${student.firstName} ${student.lastName} - ${err.message}`);
      }
    }

    console.log(`\n✅ เสร็จสิ้น:`);
    console.log(`   ✏️  อัปเดต: ${skipCount} คน`);
    console.log(`   ➕ เพิ่มใหม่: ${successCount} คน`);
  } catch (err) {
    console.error('❌ ข้อผิดพลาด:', err);
    process.exit(1);
  }
}

// รันสคริปต์
importStudents().then(() => {
  process.exit(0);
});
