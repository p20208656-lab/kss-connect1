import { NextResponse } from 'next/server';
import { insertSchedule } from '@/lib/db';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    // Simple check - in production you'd want proper auth
    const authHeader = request.headers.get('Authorization');
    if (authHeader !== 'Bearer secret-init-key') {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Sample schedules data
    const schedules = [
      { type: 'class', title: 'เปิดภาคเรียน', description: 'เริ่มต้นภาคเรียนที่ 1', date: '2024-05-16' },
      { type: 'exam', title: 'สอบกลางภาค', description: 'สอบกลางภาคเรียนที่ 1', date: '2024-07-22' },
    ];

    let count = 0;
    for (const s of schedules) {
      await insertSchedule(s.type, s.title, s.description, s.date);
      count++;
    }

    return NextResponse.json({ 
      ok: true, 
      message: `✅ สำเร็จ! เพิ่มข้อมูลตารางเรียน ${count} รายการ`,
      count 
    });
  } catch (error: any) {
    console.error('Initialization error:', error);
    return NextResponse.json(
      { ok: false, error: error.message },
      { status: 500 }
    );
  }
}
