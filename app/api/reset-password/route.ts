import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { findUser, updateUserPassword } from '@/lib/db';

export const runtime = 'nodejs';

const resetSchema = z.object({
  firstName: z.string().min(1, 'กรุณากรอกชื่อ'),
  lastName: z.string().min(1, 'กรุณากรอกนามสกุล'),
  classCode: z.string().min(1, 'กรุณาเลือกห้องเรียน'),
  newPassword: z.string().min(4, 'รหัสผ่านต้องมีอย่างน้อย 4 ตัวอักษร'),
  confirmPassword: z.string().min(1, 'กรุณายืนยันรหัสผ่าน'),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = resetSchema.safeParse(body);
    
    if (!parsed.success) {
      return NextResponse.json({ 
        ok: false, 
        message: parsed.error.issues[0]?.message || 'ข้อมูลไม่ถูกต้อง' 
      }, { status: 400 });
    }

    const { firstName, lastName, classCode, newPassword, confirmPassword } = parsed.data;

    // Check if passwords match
    if (newPassword !== confirmPassword) {
      return NextResponse.json({ 
        ok: false, 
        message: 'รหัสผ่านไม่ตรงกัน' 
      }, { status: 400 });
    }

    // Find user
    const user = await findUser(firstName, lastName, classCode);
    if (!user) {
      return NextResponse.json({ 
        ok: false, 
        message: 'ไม่พบข้อมูลนักเรียน กรุณาตรวจสอบชื่อ-นามสกุลและห้องเรียน' 
      }, { status: 404 });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const newPasswordHash = await bcrypt.hash(newPassword, salt);

    // Update password
    await updateUserPassword(user.id, newPasswordHash);

    return NextResponse.json({ 
      ok: true, 
      message: 'รีเซ็ตรหัสผ่านสำเร็จ' 
    });
  } catch (error: any) {
    console.error('Reset password error:', error);
    return NextResponse.json({ 
      ok: false, 
      message: 'เกิดข้อผิดพลาดในระบบ' 
    }, { status: 500 });
  }
}
