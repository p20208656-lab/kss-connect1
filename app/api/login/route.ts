import { NextResponse } from 'next/server';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { insertLogin, findUserByStudentId } from '@/lib/db';

export const runtime = 'nodejs';

const LoginSchema = z.object({
  studentId: z.string().min(1, 'กรุณากรอกรหัสประจำตัวนักเรียน'),
  password: z.string().min(1, 'กรุณากรอกรหัสผ่าน'),
});

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const parsed = LoginSchema.safeParse(data);
    if (!parsed.success) {
      return NextResponse.json({ ok: false, errors: parsed.error.flatten() }, { status: 400 });
    }

    const { studentId, password } = parsed.data;

    const user = await findUserByStudentId(studentId);

    if (!user) {
      return NextResponse.json({ ok: false, message: 'ไม่พบบัญชี กรุณาตรวจสอบรหัสประจำตัว' }, { status: 404 });
    }
    
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return NextResponse.json({ ok: false, message: 'รหัสผ่านไม่ถูกต้อง' }, { status: 401 });
    }
    
    const result = await insertLogin(user.first_name, user.last_name, user.class_code);
    const res = NextResponse.json({ 
      ok: true, 
      id: user.id, 
      createdAt: result.createdAt,
      userId: user.id,
      classCode: user.class_code,
      studentId: user.student_id,
      firstName: user.first_name,
      lastName: user.last_name
    });
    // Allow the client-side cookie check used for redirects
    res.cookies.set('kss_user', String(user.id), {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });
    return res;
  } catch (err) {
    return NextResponse.json({ ok: false, message: 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง' }, { status: 500 });
  }
}
