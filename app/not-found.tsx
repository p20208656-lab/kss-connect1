import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="page-bg min-h-screen flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
        {/* 404 Icon */}
        <div className="mx-auto w-24 h-24 bg-school-100 rounded-full flex items-center justify-center mb-6">
          <span className="text-4xl font-bold text-school-600">404</span>
        </div>

        {/* Message */}
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          ไม่พบหน้าที่ต้องการ
        </h1>
        <p className="text-gray-600 mb-6">
          หน้าที่คุณกำลังมองหาอาจถูกย้าย ลบ หรือไม่เคยมีอยู่
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="px-6 py-3 bg-school-600 text-white rounded-lg hover:bg-school-700 transition-colors font-medium inline-block"
          >
            กลับหน้าหลัก
          </Link>
          <Link
            href="/dashboard"
            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium inline-block"
          >
            ไปแดชบอร์ด
          </Link>
        </div>
      </div>
    </div>
  );
}
