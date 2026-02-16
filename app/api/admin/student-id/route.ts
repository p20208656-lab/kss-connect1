import { NextResponse } from 'next/server';
import { z } from 'zod';
import { listAllUsers, assignStudentId } from '@/lib/db';

export const runtime = 'nodejs';

/**
 * ตรวจสอบว่าเป็น session ผู้ดูแลระบบ
 */
function isAdminSession(req: Request) {
  const adminId = req.headers.get('cookie')?.match(/kss_admin=([^;]+)/)?.[1];
  return !!adminId;
}

/**
 * GET /api/admin/student-id
 * ดูสถานะรหัสนักเรียนของทุกคน
 */
export async function GET(req: Request) {
  if (!isAdminSession(req)) {
    return NextResponse.json({ ok: false, message: 'ต้องเข้าสู่ระบบแอดมินก่อน' }, { status: 401 });
  }

  try {
    const users = await listAllUsers();
    const usersWithoutId = users.filter(u => !u.student_id);
    const usersWithId = users.filter(u => u.student_id);

    return NextResponse.json({
      ok: true,
      รวมทั้งสิ้น: users.length,
      มีรหัสนักเรียน: usersWithId.length,
      ไม่มีรหัสนักเรียน: usersWithoutId.length,
      ข้อมูล: {
        มีรหัสแล้ว: usersWithId.map(u => ({
          id: u.id,
          ชื่อ: `${u.first_name} ${u.last_name}`,
          รหัสนักเรียน: u.student_id,
          ห้องเรียน: u.class_code
        })),
        ยังไม่มีรหัส: usersWithoutId.map(u => ({
          id: u.id,
          ชื่อ: `${u.first_name} ${u.last_name}`,
          ห้องเรียน: u.class_code
        }))
      }
    });
  } catch (err) {
    return NextResponse.json({ ok: false, message: 'เกิดข้อผิดพลาด' }, { status: 500 });
  }
}

/**
 * POST /api/admin/student-id
 * กำหนดรหัสนักเรียนให้ผู้ใช้
 * Body: { userId?: number } หรือ { assignToAll: true }
 */
export async function POST(req: Request) {
  if (!isAdminSession(req)) {
    return NextResponse.json({ ok: false, message: 'ต้องเข้าสู่ระบบแอดมินก่อน' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const AssignSchema = z.object({
      userId: z.number().int().positive().optional(),
      assignToAll: z.boolean().optional()
    });

    const parsed = AssignSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({
        ok: false,
        message: 'ข้อมูลไม่ถูกต้อง'
      }, { status: 400 });
    }

    const { userId, assignToAll } = parsed.data;
    const users = await listAllUsers();

    if (userId) {
      // กำหนดให้คนเดียว
      const user = users.find(u => u.id === userId);
      if (!user) {
        return NextResponse.json({
          ok: false,
          message: 'ไม่พบผู้ใช้'
        }, { status: 404 });
      }

      if (user.student_id) {
        return NextResponse.json({
          ok: false,
          message: 'ผู้ใช้นี้มีรหัสนักเรียนแล้ว'
        }, { status: 409 });
      }

      const studentId = await assignStudentId(userId);
      return NextResponse.json({
        ok: true,
        userId,
        ชื่อ: `${user.first_name} ${user.last_name}`,
        รหัสนักเรียน: studentId,
        message: 'กำหนดรหัสนักเรียนสำเร็จ'
      });
    } else if (assignToAll) {
      // กำหนดให้ทุกคนที่ยังไม่มีรหัส
      const usersToUpdate = users.filter(u => !u.student_id);
      const results: any[] = [];

      for (const user of usersToUpdate) {
        try {
          const studentId = await assignStudentId(user.id);
          results.push({
            userId: user.id,
            ชื่อ: `${user.first_name} ${user.last_name}`,
            รหัสนักเรียน: studentId,
            สถานะ: 'สำเร็จ'
          });
        } catch (err) {
          results.push({
            userId: user.id,
            ชื่อ: `${user.first_name} ${user.last_name}`,
            สถานะ: 'ล้มเหลว'
          });
        }
      }

      const successful = results.filter(r => r.สถานะ === 'สำเร็จ').length;
      const failed = results.filter(r => r.สถานะ === 'ล้มเหลว').length;

      return NextResponse.json({
        ok: true,
        message: `กำหนดรหัสนักเรียนเสร็จสิ้น (สำเร็จ: ${successful}, ล้มเหลว: ${failed})`,
        รวม: usersToUpdate.length,
        สำเร็จ: successful,
        ล้มเหลว: failed,
        รายละเอียด: results
      });
    } else {
      return NextResponse.json({
        ok: false,
        message: 'กรุณาระบุ userId หรือ assignToAll'
      }, { status: 400 });
    }
  } catch (err: any) {
    console.error('ข้อผิดพลาดในการกำหนดรหัสนักเรียน:', err);
    return NextResponse.json({
      ok: false,
      message: 'เกิดข้อผิดพลาด'
    }, { status: 500 });
  }
}
