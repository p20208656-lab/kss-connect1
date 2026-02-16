/**
 * สคริปต์อัปเดตรหัสนักเรียนให้มีศูนย์นำหน้า
 * รูปแบบ: CCHHSS
 * CC = ชั้น (01-06)
 * HH = ห้อง (01-05)
 * SS = ลำดับที่ (01-99)
 * 
 * ตัวอย่าง: 010101 = ม.1/1 ลำดับที่ 1
 */

import { listAllUsers, updateUserStudentId } from '@/lib/db';

// ข้อมูลนักเรียนที่ต้องอัปเดต
const studentData = `ชั้น	ห้อง	เลขประจำตัวนักเรียน	ชื่อ	นามสกุล
ม.1	1	6541	ทัตเทพ	เรือนงาม
ม.1	1	6542	บรรณสรณ์	ผันแปรจิต
ม.1	1	6546	พิชญุตม์	ศรีพูล
ม.1	1	6548	วรโชติ	มากดี`;

interface StudentRecord {
  className: string;
  roomNumber: number;
  oldStudentId: string;
  firstName: string;
  lastName: string;
}

/**
 * แปลงชั้นเป็นตัวเลข
 */
function getGradeNumber(className: string): number {
  const match = className.match(/ม\.(\d)/);
  return match ? parseInt(match[1]) : 0;
}

/**
 * สร้างรหัสนักเรียนใหม่
 * รูปแบบ: CCHHSS (6 หลัก)
 */
function generateNewStudentId(
  gradeNumber: number,
  roomNumber: number,
  sequenceNumber: number
): string {
  const grade = String(gradeNumber).padStart(2, '0');
  const room = String(roomNumber).padStart(2, '0');
  const sequence = String(sequenceNumber).padStart(2, '0');
  return `${grade}${room}${sequence}`;
}

/**
 * ฟังก์ชันหลักในการอัปเดต
 */
async function updateStudentIds() {
  try {
    console.log('🎓 เริ่มอัปเดตรหัสนักเรียน...\n');

    // ดึงข้อมูลผู้ใช้ทั้งหมด
    const users = await listAllUsers();

    // จัดกลุ่มผู้ใช้ตามชั้นและห้อง
    const groupedByClass: {
      [key: string]: typeof users;
    } = {};

    for (const user of users) {
      // ค้นหาชั้นและห้องจากชื่อต้องตรวจสอบจากข้อมูลอื่น
      // สำหรับตอนนี้จะใช้ class_code
      const key = user.class_code;
      if (!groupedByClass[key]) {
        groupedByClass[key] = [];
      }
      groupedByClass[key].push(user);
    }

    console.log(`📊 พบทั้งหมด ${users.length} นักเรียน`);
    console.log(`📚 จากนั้นหมวดหมู่ ${Object.keys(groupedByClass).length} ห้อง\n`);

    // อัปเดตรหัสสำหรับแต่ละห้อง
    let totalUpdated = 0;

    for (const classCode of Object.keys(groupedByClass).sort()) {
      const classUsers = groupedByClass[classCode];
      
      // แยกชั้นและห้อง
      const match = classCode.match(/ม\.(\d)\/(\d)/);
      if (!match) {
        console.warn(`⚠️  ไม่สามารถแยกชั้นห้องจาก: ${classCode}`);
        continue;
      }

      const gradeNumber = parseInt(match[1]);
      const roomNumber = parseInt(match[2]);

      console.log(`\n📝 ${classCode} (${classUsers.length} คน)`);

      // อัปเดตแต่ละนักเรียนในห้อง
      for (let i = 0; i < classUsers.length; i++) {
        const user = classUsers[i];
        const sequenceNumber = i + 1;
        const newStudentId = generateNewStudentId(
          gradeNumber,
          roomNumber,
          sequenceNumber
        );

        // อัปเดตในฐานข้อมูล
        try {
          await updateUserStudentId(user.id, newStudentId);
          console.log(
            `  ✅ ${user.first_name} ${user.last_name}: ${user.student_id || 'ไม่มี'} → ${newStudentId}`
          );
          totalUpdated++;
        } catch (err) {
          console.error(
            `  ❌ ล้มเหลว: ${user.first_name} ${user.last_name}`
          );
        }
      }
    }

    console.log(`\n\n✨ อัปเดตสำเร็จทั้งหมด ${totalUpdated} นักเรียน!`);
  } catch (err) {
    console.error('❌ ข้อผิดพลาด:', err);
    process.exit(1);
  }
}

// รัน
updateStudentIds();
