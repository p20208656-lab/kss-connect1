
'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';

interface AdminMessage {
  id: number;
  body: string;
  isRead: number;
  createdAt: string;
  recipientName: string | null;
  recipientClass: string | null;
  senderName: string | null;
  senderClass: string | null;
}

interface PendingMessage {
  id: number;
  body: string;
  createdAt: string;
}

export default function AdminMessagesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState<AdminMessage[]>([]);
  const [pendingMessages, setPendingMessages] = useState<PendingMessage[]>([]);
  const [search, setSearch] = useState('');
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'pending' | 'all'>('pending');

  useEffect(() => {
    const adminId = document.cookie
      .split('; ')
      .find((row) => row.startsWith('kss_admin='))
      ?.split('=')[1];

    if (!adminId) {
      router.push('/');
      return;
    }
    loadPendingMessages();
    loadMessages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadMessages = async () => {
    try {
      const res = await fetch('/api/admin/messages');
      const data = await res.json();
      if (data.ok) {
        setMessages(data.messages);
      }
    } catch (err) {
      console.error('Error loading messages:', err);
    }
  };

  const loadPendingMessages = async () => {
    try {
      const res = await fetch('/api/admin/messages?pending=true');
      const data = await res.json();
      if (data.ok) {
        setPendingMessages(data.messages);
      }
    } catch (err) {
      console.error('Error loading pending messages:', err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    if (!search.trim()) return messages;
    const term = search.toLowerCase();
    return messages.filter((m) =>
      [m.body, m.senderName, m.senderClass, m.recipientName, m.recipientClass]
        .filter(Boolean)
        .some((field) => String(field).toLowerCase().includes(term))
    );
  }, [messages, search]);

  const filteredPending = useMemo(() => {
    if (!search.trim()) return pendingMessages;
    const term = search.toLowerCase();
    return pendingMessages.filter((m) => m.body.toLowerCase().includes(term));
  }, [pendingMessages, search]);

  const handleApprove = async (id: number) => {
    setProcessingId(id);
    try {
      const res = await fetch('/api/admin/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action: 'approve' }),
      });
      const data = await res.json();
      if (data.ok) {
        setPendingMessages((prev) => prev.filter((m) => m.id !== id));
        Swal.fire('อนุมัติแล้ว', 'ข้อความถูกส่งไปยังผู้รับแล้ว', 'success');
        loadMessages();
      } else {
        Swal.fire('ผิดพลาด', data.message || 'อนุมัติไม่สำเร็จ', 'error');
      }
    } catch (err) {
      Swal.fire('ผิดพลาด', 'อนุมัติไม่สำเร็จ', 'error');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (id: number) => {
    const confirm = await Swal.fire({
      title: 'ปฏิเสธข้อความนี้?',
      text: 'ข้อความจะถูกลบและไม่ส่งไปยังผู้รับ',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'ปฏิเสธ',
      cancelButtonText: 'ยกเลิก',
      confirmButtonColor: '#ef4444',
    });
    if (!confirm.isConfirmed) return;

    setProcessingId(id);
    try {
      const res = await fetch('/api/admin/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action: 'reject' }),
      });
      const data = await res.json();
      if (data.ok) {
        setPendingMessages((prev) => prev.filter((m) => m.id !== id));
        Swal.fire('ปฏิเสธแล้ว', 'ข้อความถูกลบเรียบร้อย', 'success');
      } else {
        Swal.fire('ผิดพลาด', data.message || 'ปฏิเสธไม่สำเร็จ', 'error');
      }
    } catch (err) {
      Swal.fire('ผิดพลาด', 'ปฏิเสธไม่สำเร็จ', 'error');
    } finally {
      setProcessingId(null);
    }
  };

  const handleDelete = async (id: number) => {
    const confirm = await Swal.fire({
      title: 'ลบข้อความนี้?',
      text: 'การกระทำนี้ไม่สามารถย้อนกลับได้',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'ลบ',
      cancelButtonText: 'ยกเลิก',
      confirmButtonColor: '#059669',
    });
    if (!confirm.isConfirmed) return;

    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/messages?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.ok) {
        setMessages((prev) => prev.filter((m) => m.id !== id));
        Swal.fire('ลบแล้ว', '', 'success');
      } else {
        Swal.fire('ผิดพลาด', data.message || 'ลบไม่สำเร็จ', 'error');
      }
    } catch (err) {
      Swal.fire('ผิดพลาด', 'ลบไม่สำเร็จ', 'error');
    } finally {
      setDeletingId(null);
    }
  };

  const handleRefresh = () => {
    setLoading(true);
    loadPendingMessages();
    loadMessages();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-school-50">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-school-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white p-4 sm:p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => router.push('/admin')}
            className="p-2 hover:bg-school-100 rounded-lg transition-colors"
          >
            <svg className="w-6 h-6 text-school-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-school-700">✉️ จัดการข้อความ</h1>
            <p className="text-sm text-gray-900 font-bold">อนุมัติและดูข้อความทั้งหมด</p>
          </div>
        </div>

        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-4 py-2 rounded-lg font-semibold transition ${
              activeTab === 'pending' ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            รออนุมัติ ({pendingMessages.length})
          </button>
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 rounded-lg font-semibold transition ${
              activeTab === 'all' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            ข้อความทั้งหมด ({messages.length})
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-4">
            <div>
              {activeTab === 'pending' ? (
                <>
                  <h2 className="text-2xl font-semibold text-orange-600">ข้อความรออนุมัติ</h2>
                  <p className="text-sm text-gray-600">ตรวจสอบและอนุมัติข้อความก่อนส่ง (ไม่แสดงชื่อผู้ส่ง/ผู้รับ)</p>
                </>
              ) : (
                <>
                  <h2 className="text-2xl font-semibold text-green-700">ข้อความทั้งหมด</h2>
                  <p className="text-sm text-gray-600">แอดมินสามารถเห็นผู้ส่งและผู้รับได้ครบ</p>
                </>
              )}
            </div>
            <div className="flex gap-2">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="ค้นหาข้อความ..."
                className="rounded-lg border-2 border-green-300 px-3 py-2 text-sm focus:outline-none focus:border-green-500 bg-white text-gray-800 placeholder:text-gray-700 placeholder:font-semibold"
              />
              <button
                onClick={handleRefresh}
                className="p-2 rounded-lg bg-green-600 text-white hover:bg-green-700"
                aria-label="รีเฟรช"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9H9m11 11v-5h-.581m-15.357-2A8.003 8.003 0 0019.418 15H15" />
                </svg>
              </button>
            </div>
          </div>

          {activeTab === 'pending' && (
            <>
              {filteredPending.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-lg text-gray-500">ไม่มีข้อความรออนุมัติ</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredPending.map((m) => (
                    <div key={m.id} className="border-2 border-orange-200 rounded-lg p-4 bg-orange-50">
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex-1">
                          <p className="text-xs text-gray-500 mb-2">
                            {new Date(m.createdAt).toLocaleString('th-TH', { dateStyle: 'medium', timeStyle: 'short' })}
                          </p>
                          <p className="text-gray-800 whitespace-pre-wrap">{m.body}</p>
                        </div>
                        <div className="flex gap-2 flex-shrink-0">
                          <button
                            onClick={() => handleApprove(m.id)}
                            disabled={processingId === m.id}
                            className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded transition text-sm disabled:opacity-60"
                          >
                            {processingId === m.id ? '...' : 'อนุมัติ'}
                          </button>
                          <button
                            onClick={() => handleReject(m.id)}
                            disabled={processingId === m.id}
                            className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded transition text-sm disabled:opacity-60"
                          >
                            {processingId === m.id ? '...' : 'ปฏิเสธ'}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {activeTab === 'all' && (
            <>
              {filtered.length === 0 ? (
                <p className="text-sm text-gray-500">ยังไม่มีข้อความ</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-green-600 text-white">
                      <tr>
                        <th className="px-6 py-3 text-left">เวลา</th>
                        <th className="px-6 py-3 text-left">ผู้ส่ง</th>
                        <th className="px-6 py-3 text-left">ผู้รับ</th>
                        <th className="px-6 py-3 text-left">ข้อความ</th>
                        <th className="px-6 py-3 text-left">การกระทำ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map((m) => (
                        <tr key={m.id} className="border-b hover:bg-green-50 transition">
                          <td className="px-6 py-4 text-gray-700 whitespace-nowrap">
                            {new Date(m.createdAt).toLocaleString('th-TH', { dateStyle: 'medium', timeStyle: 'short' })}
                          </td>
                          <td className="px-6 py-4 text-gray-700 whitespace-nowrap font-semibold">
                            {m.senderName ? `${m.senderName} (${m.senderClass || '-'})` : '-'}
                          </td>
                          <td className="px-6 py-4 text-gray-700 whitespace-nowrap">
                            {m.recipientName ? `${m.recipientName} (${m.recipientClass || '-'})` : '-'}
                          </td>
                          <td className="px-6 py-4 text-gray-700">
                            <div className="line-clamp-2">{m.body}</div>
                          </td>
                          <td className="px-6 py-4">
                            <button
                              onClick={() => handleDelete(m.id)}
                              disabled={deletingId === m.id}
                              className="bg-red-500 hover:bg-red-600 text-white font-bold py-1 px-3 rounded transition text-sm disabled:opacity-60"
                            >
                              {deletingId === m.id ? 'กำลังลบ...' : 'ลบ'}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
