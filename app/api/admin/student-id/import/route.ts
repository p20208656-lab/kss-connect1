import { NextResponse } from 'next/server';
import { z } from 'zod';
import { listAllUsers } from '@/lib/db';
import { getDb } from '@/lib/db';

export const runtime = 'nodejs';

/**
 * ตรวจสอบว่าเป็น session ผู้ดูแลระบบ
 */
function isAdminSession(req: Request) {
  const adminId = req.headers.get('cookie')?.match(/kss_admin=([^;]+)/)?.[1];
  return !!adminId;
}

/**
 * POST /api/admin/student-id/import
 * นำเข้าและอัพเดตรหัสนักเรียนจากข้อมูล
 * Body: { students: [{ studentId: string, firstName: string, lastName: string }, ...] }
 */
export async function POST(req: Request) {
  if (!isAdminSession(req)) {
    return NextResponse.json({ ok: false, message: 'ต้องเข้าสู่ระบบแอดมินก่อน' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const ImportSchema = z.object({
      students: z.array(z.object({
        studentId: z.string().regex(/^\d{4,5}$/, 'รหัสนักเรียนต้องเป็นตัวเลข 4-5 หลัก'),
        firstName: z.string().min(1),
        lastName: z.string().min(1)
      }))
    });

    const parsed = ImportSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({
        ok: false,
        message: 'ข้อมูลไม่ถูกต้อง',
        errors: parsed.error.flatten()
      }, { status: 400 });
    }

    const { students } = parsed.data;
    const db = getDb();
    const existingUsers = await listAllUsers();
    const results: any[] = [];
    let updated = 0;
    let notFound = 0;
    let alreadyHas = 0;

    // ลูปผ่านข้อมูลแต่ละคน
    for (const student of students) {
      try {
        // ค้นหาผู้ใช้จากชื่อและนามสกุล
        const user = existingUsers.find(u => 
          u.first_name.trim().toLowerCase() === student.firstName.trim().toLowerCase() &&
          u.last_name.trim().toLowerCase() === student.lastName.trim().toLowerCase()
        );

        if (!user) {
          notFound++;
          results.push({
            studentId: student.studentId,
            ชื่อ: `${student.firstName} ${student.lastName}`,
            สถานะ: 'ไม่พบ',
            หมายเหตุ: 'ไม่มีผู้ใช้ที่ตรงกัน'
          });
          continue;
        }

        // ตรวจสอบว่ามีรหัสแล้วหรือไม่
        if (user.student_id) {
          alreadyHas++;
          results.push({
            studentId: student.studentId,
            ชื่อ: `${student.firstName} ${student.lastName}`,
            สถานะ: 'มีแล้ว',
            รหัสเดิม: user.student_id,
            หมายเหตุ: 'ข้ามการอัพเดต'
          });
          continue;
        }

        // อัพเดตรหัสนักเรียน
        await db.execute({
          sql: 'UPDATE users SET student_id = ? WHERE id = ?',
          args: [student.studentId, user.id]
        });

        updated++;
        results.push({
          studentId: student.studentId,
          ชื่อ: `${student.firstName} ${student.lastName}`,
          สถานะ: 'อัพเดตสำเร็จ'
        });

      } catch (error: any) {
        results.push({
          studentId: student.studentId,
          ชื่อ: `${student.firstName} ${student.lastName}`,
          สถานะ: 'เกิดข้อผิดพลาด',
          หมายเหตุ: error.message
        });
      }
    }

    return NextResponse.json({
      ok: true,
      message: `นำเข้าข้อมูลเสร็จสิ้น (อัพเดต: ${updated}, ไม่พบ: ${notFound}, มีแล้ว: ${alreadyHas})`,
      สรุป: {
        รวม: students.length,
        อัพเดตสำเร็จ: updated,
        ไม่พบผู้ใช้: notFound,
        มีรหัสแล้ว: alreadyHas
      },
      รายละเอียด: results
    });

  } catch (error: any) {
    console.error('❌ ข้อผิดพลาดในการนำเข้าข้อมูล:', error);
    return NextResponse.json({
      ok: false,
      message: 'เกิดข้อผิดพลาด: ' + error.message
    }, { status: 500 });
  }
}
