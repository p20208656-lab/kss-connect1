export default function Loading() {
  return (
    <div className="page-bg min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        {/* Spinner */}
        <div className="relative">
          <div className="w-16 h-16 border-4 border-school-200 rounded-full"></div>
          <div className="absolute top-0 left-0 w-16 h-16 border-4 border-school-600 rounded-full border-t-transparent animate-spin"></div>
        </div>
        
        {/* Loading Text */}
        <div className="text-center">
          <p className="text-lg font-medium text-school-700">กำลังโหลด...</p>
          <p className="text-sm text-gray-500">กรุณารอสักครู่</p>
        </div>
      </div>
    </div>
  );
}
