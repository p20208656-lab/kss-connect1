// Cookie configuration utility
// Note: httpOnly: false is required for client-side auth checks in middleware
// In production, consider using NextAuth.js or similar for better security

export const isProduction = process.env.NODE_ENV === 'production';

export const cookieConfig = {
  user: {
    name: 'kss_user',
    options: {
      httpOnly: false, // Required for client-side checks
      secure: isProduction,
      sameSite: 'lax' as const,
      path: '/',
      maxAge: 60 * 60 * 24 * 30, // 30 days (reduced from 180)
    },
  },
  admin: {
    name: 'kss_admin',
    options: {
      httpOnly: false, // Required for client-side checks
      secure: isProduction,
      sameSite: 'lax' as const,
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days (more secure for admin)
    },
  },
  teacher: {
    name: 'kss_teacher',
    options: {
      httpOnly: false, // Required for client-side checks
      secure: isProduction,
      sameSite: 'lax' as const,
      path: '/',
      maxAge: 60 * 60 * 24 * 14, // 14 days
    },
  },
};

// Helper to clear cookie
export const clearCookieOptions = {
  path: '/',
  maxAge: 0,
};
