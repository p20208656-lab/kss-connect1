import { NextResponse } from 'next/server';
import { countUnreadMessages } from '@/lib/db';

export const runtime = 'nodejs';

export async function GET(req: Request) {
  try {
    const cookie = req.headers.get('cookie') || '';
    const userIdMatch = cookie.match(/kss_user=([^;]+)/);
    const userId = userIdMatch ? Number(userIdMatch[1]) : 0;
    
    if (!userId) {
      return NextResponse.json({ ok: false, message: 'ยังไม่ได้เข้าสู่ระบบ' }, { status: 401 });
    }
    const count = await countUnreadMessages(userId);
    return NextResponse.json({ ok: true, count });
  } catch (error: any) {
    console.error('[GET /api/messages/unread] error:', error);
    return NextResponse.json({ ok: false, message: 'เกิดข้อผิดพลาด' }, { status: 500 });
  }
}
