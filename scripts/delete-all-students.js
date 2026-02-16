const { createClient } = require('@libsql/client');

async function deleteAllStudents() {
  const url = process.env.TURSO_DATABASE_URL || 'file:./data/kss.db';
  const authToken = process.env.TURSO_AUTH_TOKEN;

  const db = createClient({
    url,
    authToken: authToken || undefined,
  });

  try {
    const countResult = await db.execute(
      "SELECT COUNT(*) AS count FROM users WHERE role = 'student'"
    );
    const total = countResult.rows[0].count;

    if (total === 0) {
      console.log('ไม่มีบัญชีนักเรียนให้ลบ');
      return;
    }

    await db.execute("DELETE FROM users WHERE role = 'student'");

    console.log(`ลบบัญชีนักเรียนทั้งหมดสำเร็จ: ${total} คน`);
  } catch (error) {
    console.error('❌ เกิดข้อผิดพลาด:', error.message);
  }
}

deleteAllStudents();
