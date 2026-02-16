import { createClient } from '@libsql/client';

// เชื่อมต่อฐานข้อมูล
const db = createClient({
  url: process.env.TURSO_DATABASE_URL || 'file:./data/kss.db',
  authToken: process.env.TURSO_AUTH_TOKEN || undefined,
});

/**
 * แปลงรหัสนักเรียนให้มี 0 นำหน้าให้เป็น 5 หลัก
 * เช่น: 6541 -> 06541, 5964 -> 05964
 */
async function updateStudentIdsWithLeadingZeros() {
  try {
    console.log('🔍 กำลังตรวจสอบรหัสนักเรียน...');

    // ดึงรหัสนักเรียนทั้งหมด
    const result = await db.execute(
      'SELECT id, student_id FROM users ORDER BY id'
    );

    const updates: Array<{ userId: number; oldId: string; newId: string }> = [];

    // ตรวจสอบและเตรียมอัปเดต
    for (const row of result.rows) {
      const userId = Number(row.id);
      const currentId = row.student_id ? String(row.student_id) : null;

      if (!currentId) {
        console.log(`⚠️  ID ${userId}: ไม่มีรหัสนักเรียน`);
        continue;
      }

      // ถ้าเป็นตัวเลข ให้เติมศูนย์นำหน้า
      if (/^\d+$/.test(currentId)) {
        const newId = currentId.padStart(5, '0');

        if (currentId !== newId) {
          updates.push({ userId, oldId: currentId, newId });
          console.log(`✏️  ID ${userId}: ${currentId} -> ${newId}`);
        } else {
          console.log(`✅ ID ${userId}: ${newId} (ถูกต้องแล้ว)`);
        }
      } else {
        console.log(`❌ ID ${userId}: ${currentId} (ไม่ใช่ตัวเลข)`);
      }
    }

    if (updates.length === 0) {
      console.log('\n✅ รหัสนักเรียนทั้งหมดถูกต้องแล้ว (มี 0 นำหน้า)');
      return;
    }

    console.log(`\n📝 กำลังอัปเดต ${updates.length} รหัส...`);

    // อัปเดตรหัสนักเรียน
    for (const update of updates) {
      await db.execute({
        sql: 'UPDATE users SET student_id = ? WHERE id = ?',
        args: [update.newId, update.userId]
      });
    }

    console.log(`✅ อัปเดตสำเร็จ! ${updates.length} รหัสนักเรียน`);

    // แสดงสรุป
    const updatedResult = await db.execute(
      'SELECT COUNT(*) as total, COUNT(CASE WHEN student_id IS NOT NULL THEN 1 END) as withId FROM users'
    );
    const stats = updatedResult.rows[0];
    console.log(`\n📊 สรุป:`);
    console.log(`   รวมนักเรียน: ${stats.total}`);
    console.log(`   มีรหัสนักเรียน: ${stats.withId}`);
  } catch (err) {
    console.error('❌ ข้อผิดพลาด:', err);
    process.exit(1);
  }
}

// รันสคริปต์
updateStudentIdsWithLeadingZeros().then(() => {
  process.exit(0);
});
