import { NextResponse } from 'next/server';
import { deleteMessageById, listAllMessagesDetailed, listPendingMessagesAnonymous, approveMessage, rejectMessage } from '@/lib/db';

export const runtime = 'nodejs';

function isAdminSession(req: Request) {
  const adminId = req.headers.get('cookie')?.match(/kss_admin=([^;]+)/)?.[1];
  return !!adminId;
}

export async function GET(req: Request) {
  if (!isAdminSession(req)) {
    return NextResponse.json({ ok: false, message: 'ต้องเข้าสู่ระบบแอดมินก่อน' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const pending = searchParams.get('pending') === 'true';

  try {
    if (pending) {
      const messages = await listPendingMessagesAnonymous();
      return NextResponse.json({ ok: true, messages });
    } else {
      const messages = await listAllMessagesDetailed();
      return NextResponse.json({ ok: true, messages });
    }
  } catch (err) {
    console.error('[GET /api/admin/messages] error:', err);
    return NextResponse.json({ ok: false, message: 'เกิดข้อผิดพลาด' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  if (!isAdminSession(req)) {
    return NextResponse.json({ ok: false, message: 'ต้องเข้าสู่ระบบแอดมินก่อน' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { id, action } = body;

    if (!id || Number.isNaN(Number(id))) {
      return NextResponse.json({ ok: false, message: 'ต้องระบุ id ข้อความ' }, { status: 400 });
    }

    if (action === 'approve') {
      const result = await approveMessage(Number(id));
      if (result.rowsAffected === 0) {
        return NextResponse.json({ ok: false, message: 'ไม่พบข้อความที่รอการอนุมัติ' }, { status: 404 });
      }
      return NextResponse.json({ ok: true, message: 'อนุมัติข้อความเรียบร้อย' });
    } else if (action === 'reject') {
      const result = await rejectMessage(Number(id));
      if (result.rowsAffected === 0) {
        return NextResponse.json({ ok: false, message: 'ไม่พบข้อความ' }, { status: 404 });
      }
      return NextResponse.json({ ok: true, message: 'ปฏิเสธข้อความเรียบร้อย' });
    } else {
      return NextResponse.json({ ok: false, message: 'action ต้องเป็น approve หรือ reject' }, { status: 400 });
    }
  } catch (err) {
    console.error('[POST /api/admin/messages] error:', err);
    return NextResponse.json({ ok: false, message: 'เกิดข้อผิดพลาด' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  if (!isAdminSession(req)) {
    return NextResponse.json({ ok: false, message: 'ต้องเข้าสู่ระบบแอดมินก่อน' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const id = Number(searchParams.get('id'));

  if (!id || Number.isNaN(id)) {
    return NextResponse.json({ ok: false, message: 'ต้องระบุ id ข้อความ' }, { status: 400 });
  }

  try {
    const result = await deleteMessageById(id);
    if (result.rowsAffected === 0) {
      return NextResponse.json({ ok: false, message: 'ไม่พบบันทึกที่จะลบ' }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[DELETE /api/admin/messages] error:', err);
    return NextResponse.json({ ok: false, message: 'เกิดข้อผิดพลาด' }, { status: 500 });
  }
}
