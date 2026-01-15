"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Swal from "sweetalert2";

export default function TeacherInfo() {
  const [profile, setProfile] = useState<{ firstName: string; lastName: string; teacherId?: number } | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  // Only show on teacher pages (not login)
  const isTeacherPage = pathname?.startsWith('/teacher') && !pathname?.includes('/login');

  useEffect(() => {
    const loadProfile = () => {
      try {
        const raw = localStorage.getItem("kss_teacher");
        if (raw) {
          const parsed = JSON.parse(raw);
          // Handle old format (just teacherId string) - force re-login
          if (typeof parsed === 'string' || typeof parsed === 'number' || !parsed.firstName) {
            // Old format detected, clear localStorage AND cookie, then redirect
            localStorage.removeItem("kss_teacher");
            // Clear cookie by calling logout API
            fetch("/api/teacher/logout", { method: "POST" }).then(() => {
              window.location.href = "/teacher/login";
            });
            setProfile(null);
            return;
          }
          setProfile(parsed);
        } else {
          // No localStorage but might have cookie - check and clear if on teacher page
          if (isTeacherPage) {
            const hasCookie = document.cookie.includes("kss_teacher=");
            if (hasCookie) {
              // Cookie exists but no valid localStorage - force logout
              fetch("/api/teacher/logout", { method: "POST" }).then(() => {
                window.location.href = "/teacher/login";
              });
            }
          }
          setProfile(null);
        }
      } catch {
        // If JSON parse fails, it's old format - clear it
        localStorage.removeItem("kss_teacher");
        fetch("/api/teacher/logout", { method: "POST" }).then(() => {
          window.location.href = "/teacher/login";
        });
        setProfile(null);
      }
    };

    // Initial load and refresh on route change
    loadProfile();

    // Listen for custom updates
    const onProfileUpdated = () => loadProfile();
    window.addEventListener("kss:teacher-updated", onProfileUpdated);

    return () => {
      window.removeEventListener("kss:teacher-updated", onProfileUpdated);
    };
  }, [pathname, isTeacherPage]);

  const handleLogout = async () => {
    await fetch("/api/teacher/logout", { method: "POST" });
    try {
      localStorage.removeItem("kss_teacher");
    } catch {}
    window.dispatchEvent(new Event("kss:teacher-updated"));
    router.push("/teacher/login");
  };

  const handleChangePassword = async () => {
    const { value: formValues } = await Swal.fire({
      title: '🔐 เปลี่ยนรหัสผ่าน',
      html: `
        <div class="space-y-4 text-left">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">รหัสผ่านใหม่</label>
            <input id="swal-new-password" type="password" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="อย่างน้อย 4 ตัวอักษร">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">ยืนยันรหัสผ่านใหม่</label>
            <input id="swal-confirm-password" type="password" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="กรอกรหัสผ่านอีกครั้ง">
          </div>
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonColor: '#2563eb',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'เปลี่ยนรหัสผ่าน',
      cancelButtonText: 'ยกเลิก',
      width: 400,
      preConfirm: () => {
        const newPassword = (document.getElementById('swal-new-password') as HTMLInputElement).value;
        const confirmPassword = (document.getElementById('swal-confirm-password') as HTMLInputElement).value;
        
        if (!newPassword || newPassword.length < 4) {
          Swal.showValidationMessage('รหัสผ่านต้องมีอย่างน้อย 4 ตัวอักษร');
          return false;
        }
        if (newPassword !== confirmPassword) {
          Swal.showValidationMessage('รหัสผ่านไม่ตรงกัน');
          return false;
        }
        return { newPassword, confirmPassword };
      }
    });

    if (formValues && profile) {
      try {
        const res = await fetch('/api/teacher/reset-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            firstName: profile.firstName,
            lastName: profile.lastName,
            newPassword: formValues.newPassword,
            confirmPassword: formValues.confirmPassword
          })
        });

        const data = await res.json();
        if (data.ok) {
          await Swal.fire({
            icon: 'success',
            title: 'สำเร็จ!',
            text: 'เปลี่ยนรหัสผ่านเรียบร้อยแล้ว',
            confirmButtonColor: '#2563eb'
          });
        } else {
          await Swal.fire({
            icon: 'error',
            title: 'ผิดพลาด',
            text: data.message || 'ไม่สามารถเปลี่ยนรหัสผ่านได้',
            confirmButtonColor: '#2563eb'
          });
        }
      } catch {
        await Swal.fire({
          icon: 'error',
          title: 'ผิดพลาด',
          text: 'ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้',
          confirmButtonColor: '#2563eb'
        });
      }
    }
  };

  const handleShowAccountInfo = () => {
    if (!profile) return;
    
    Swal.fire({
      title: '📋 ข้อมูลบัญชีครู',
      html: `
        <div class="text-left space-y-3">
          <div class="border-b pb-2">
            <p class="text-sm text-gray-600 font-semibold">ชื่อ-นามสกุล</p>
            <p class="text-lg font-bold text-gray-900">${profile.firstName} ${profile.lastName}</p>
          </div>
          <div class="border-b pb-2">
            <p class="text-sm text-gray-600 font-semibold">ประเภทบัญชี</p>
            <p class="text-lg font-bold text-blue-600">👨‍🏫 ครู</p>
          </div>
          <div class="pt-2">
            <button id="btn-change-password" class="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium">
              🔐 เปลี่ยนรหัสผ่าน
            </button>
          </div>
        </div>
      `,
      confirmButtonColor: '#2563eb',
      confirmButtonText: 'ปิด',
      width: 400,
      didOpen: () => {
        const btn = document.getElementById('btn-change-password');
        if (btn) {
          btn.addEventListener('click', () => {
            Swal.close();
            handleChangePassword();
          });
        }
      }
    });
  };

  // Only show on teacher pages
  if (!isTeacherPage || !profile) return null;

  return (
    <>
      {/* Mobile Version */}
      <div className="sm:hidden w-full flex items-center justify-end">
        <div className="flex-1 flex items-center gap-0.5 px-3 py-2 bg-white/15 backdrop-blur-md rounded-2xl border border-white/20 cursor-pointer hover:bg-white/20 transition-all" onClick={handleShowAccountInfo}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleLogout();
            }}
            className="h-8 px-2 text-white bg-white/15 hover:bg-white/25 rounded-lg transition-all border border-white/25 hover:border-white/35 flex items-center justify-center"
            title="ออกจากระบบ"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>

          <div className="flex-1 flex flex-col leading-tight text-white font-semibold text-sm text-right pr-2">
            <span>👨‍🏫 {profile.firstName}</span>
            <span className="text-xs text-white/90">{profile.lastName}</span>
          </div>
        </div>
      </div>

      {/* Desktop Version */}
      <div className="hidden sm:flex items-center gap-3">
        <div 
          className="flex items-center gap-3 px-4 py-2 bg-white/15 backdrop-blur-md rounded-full border border-white/20 cursor-pointer hover:bg-white/20 transition-all"
          onClick={handleShowAccountInfo}
          title="คลิกเพื่อดูข้อมูลบัญชี"
        >
          <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center">
            <span className="text-sm">👨‍🏫</span>
          </div>
          <span className="text-base text-white font-semibold leading-tight">
            {profile.firstName} {profile.lastName}
          </span>
        </div>
        <button
          onClick={handleLogout}
          className="h-10 px-3 text-white bg-white/15 hover:bg-white/25 rounded-lg transition-all border border-white/25 hover:border-white/35 flex items-center justify-center"
          title="ออกจากระบบ"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        </button>
      </div>
    </>
  );
}
