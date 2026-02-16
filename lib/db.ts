import { createClient, Client } from '@libsql/client';

// ============================================================================
// DATABASE CLIENT - Supports both local SQLite and Turso for Vercel
// ============================================================================

let db: Client | null = null;

function getDb(): Client {
  if (!db) {
    const url = process.env.TURSO_DATABASE_URL || 'file:./data/kss.db';
    const authToken = process.env.TURSO_AUTH_TOKEN;

    db = createClient({
      url,
      authToken: authToken || undefined,
    });

    console.log(`Database connected: ${url.startsWith('libsql://') ? 'Turso' : 'Local SQLite'}`);
  }
  return db;
}

// ============================================================================
// SCHEMA INITIALIZATION
// ============================================================================

let initialized = false;

async function initializeDatabase() {
  if (initialized) return;
  
  const client = getDb();
  
  try {
    await client.executeMultiple(`
      CREATE TABLE IF NOT EXISTS logins (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        class_code TEXT NOT NULL,
        created_at TEXT NOT NULL
      );
      
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        student_id TEXT UNIQUE,
        class_code TEXT NOT NULL,
        password_hash TEXT NOT NULL,
        role TEXT DEFAULT 'student',
        created_at TEXT NOT NULL,
        UNIQUE(first_name, last_name, class_code)
      );
      
      CREATE TABLE IF NOT EXISTS events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT,
        event_date TEXT NOT NULL,
        created_at TEXT NOT NULL
      );
      
      CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        body TEXT NOT NULL,
        recipient_user_id INTEGER,
        sender_user_id INTEGER,
        is_read INTEGER DEFAULT 0,
        created_at TEXT NOT NULL
      );
      
      CREATE TABLE IF NOT EXISTS reports (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        detail TEXT,
        image_url TEXT,
        user_id INTEGER,
        created_at TEXT NOT NULL
      );
      
      CREATE TABLE IF NOT EXISTS admins (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        created_at TEXT NOT NULL
      );
      
      CREATE TABLE IF NOT EXISTS dress_code (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        image_url TEXT,
        created_at TEXT NOT NULL
      );
      
      CREATE TABLE IF NOT EXISTS schedules (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        type TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        date TEXT,
        created_at TEXT NOT NULL
      );
      
      CREATE TABLE IF NOT EXISTS announcements (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        priority TEXT DEFAULT 'normal',
        image_url TEXT,
        created_at TEXT NOT NULL
      );
      
      CREATE TABLE IF NOT EXISTS teachers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        teacher_id TEXT,
        password_hash TEXT NOT NULL,
        created_at TEXT NOT NULL,
        UNIQUE(first_name, last_name)
      );
      
      CREATE TABLE IF NOT EXISTS ai_knowledge (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        question TEXT NOT NULL,
        answer TEXT NOT NULL,
        keywords TEXT,
        category TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
    `);
    
    initialized = true;
    console.log('Database schema initialized');
  } catch (err: any) {
    console.error('Database initialization error:', err);
    // If tables exist, that's fine
    if (!err.message?.includes('already exists')) {
      throw err;
    }
    initialized = true;
  }
}

// Ensure DB is initialized before any operation
async function ensureInitialized() {
  if (!initialized) {
    await initializeDatabase();
  }
}

// ============================================================================
// ฟังก์ชันสร้างรหัสนักเรียน
// ============================================================================

/**
 * สร้างรหัสนักเรียน 5 ตัวเลขโดยอัตโนมัติ
 * ตัวอย่าง: 00001, 00002, 00003...
 */
export async function generateStudentId(): Promise<string> {
  await ensureInitialized();
  
  // หา student_id ที่มากที่สุดแล้ว
  const result = await getDb().execute({
    sql: `SELECT MAX(CAST(student_id AS INTEGER)) as max_id FROM users WHERE student_id REGEXP '^[0-9]{5}$'`
  });
  
  let maxId = Number(result.rows[0]?.max_id || 0);
  const newId = maxId + 1;
  
  // แปลงเป็น 5 ตัวเลข (เติมศูนย์นำหน้า)
  return String(newId).padStart(5, '0');
}

/**
 * กำหนดรหัสนักเรียนให้ผู้ใช้
 */
export async function assignStudentId(userId: number): Promise<string> {
  await ensureInitialized();
  const studentId = await generateStudentId();
  
  try {
    await getDb().execute({
      sql: 'UPDATE users SET student_id = ? WHERE id = ? AND student_id IS NULL',
      args: [studentId, userId]
    });
    return studentId;
  } catch (err: any) {
    // ถ้าเกิดข้อผิดพลาด หลองสร้าง ID ใหม่อีกครั้ง
    if (err.message?.includes('UNIQUE')) {
      return assignStudentId(userId);
    }
    throw err;
  }
}

// ============================================================================
// ฟังก์ชันเข้าสู่ระบบ
// ============================================================================

export async function insertLogin(firstName: string, lastName: string, classCode: string) {
  await ensureInitialized();
  const createdAt = new Date().toISOString();
  const result = await getDb().execute({
    sql: 'INSERT INTO logins (first_name, last_name, class_code, created_at) VALUES (?, ?, ?, ?)',
    args: [firstName.trim(), lastName.trim(), classCode.trim(), createdAt]
  });
  return { id: Number(result.lastInsertRowid), createdAt };
}

// ============================================================================
// ฟังก์ชันจัดการผู้ใช้
// ============================================================================

export async function findUser(firstName: string, lastName: string, classCode: string) {
  await ensureInitialized();
  const result = await getDb().execute({
    sql: 'SELECT id, first_name, last_name, student_id, class_code, password_hash, created_at FROM users WHERE first_name = ? AND last_name = ? AND class_code = ?',
    args: [firstName.trim(), lastName.trim(), classCode.trim()]
  });
  if (result.rows.length === 0) return undefined;
  const row = result.rows[0];
  return {
    id: Number(row.id),
    first_name: String(row.first_name),
    last_name: String(row.last_name),
    student_id: row.student_id ? String(row.student_id) : null,
    class_code: String(row.class_code),
    password_hash: String(row.password_hash),
    created_at: String(row.created_at)
  };
}

export async function findUsersByName(firstName: string, lastName: string) {
  await ensureInitialized();
  const result = await getDb().execute({
    sql: 'SELECT id, first_name, last_name, student_id, class_code, password_hash, created_at FROM users WHERE first_name = ? AND last_name = ?',
    args: [firstName.trim(), lastName.trim()]
  });
  return result.rows.map(row => ({
    id: Number(row.id),
    first_name: String(row.first_name),
    last_name: String(row.last_name),
    student_id: row.student_id ? String(row.student_id) : null,
    class_code: String(row.class_code),
    password_hash: String(row.password_hash),
    created_at: String(row.created_at)
  }));
}

export async function createUser(firstName: string, lastName: string, classCode: string, passwordHash: string) {
  await ensureInitialized();
  const createdAt = new Date().toISOString();
  const studentId = await generateStudentId();
  
  const result = await getDb().execute({
    sql: 'INSERT INTO users (first_name, last_name, student_id, class_code, password_hash, created_at) VALUES (?, ?, ?, ?, ?, ?)',
    args: [firstName.trim(), lastName.trim(), studentId, classCode.trim(), passwordHash, createdAt]
  });
  return { id: Number(result.lastInsertRowid), studentId, createdAt };
}

export async function listAllUsers() {
  await ensureInitialized();
  const result = await getDb().execute(
    'SELECT id, first_name, last_name, student_id, class_code, password_hash, role, created_at FROM users ORDER BY first_name ASC, last_name ASC'
  );
  return result.rows.map(row => ({
    id: Number(row.id),
    first_name: String(row.first_name),
    last_name: String(row.last_name),
    student_id: row.student_id ? String(row.student_id) : null,
    class_code: String(row.class_code),
    password_hash: String(row.password_hash),
    role: String(row.role || 'student'),
    created_at: String(row.created_at)
  }));
}

export async function updateUserRole(userId: number, role: string) {
  await ensureInitialized();
  return getDb().execute({
    sql: 'UPDATE users SET role = ? WHERE id = ?',
    args: [role, userId]
  });
}

export async function deleteUser(userId: number) {
  await ensureInitialized();
  return getDb().execute({
    sql: 'DELETE FROM users WHERE id = ?',
    args: [userId]
  });
}

export async function getUserById(userId: number) {
  await ensureInitialized();
  const result = await getDb().execute({
    sql: 'SELECT id, first_name, last_name, student_id, class_code FROM users WHERE id = ?',
    args: [userId]
  });
  if (result.rows.length === 0) return undefined;
  const row = result.rows[0];
  return {
    id: Number(row.id),
    first_name: String(row.first_name),
    last_name: String(row.last_name),
    student_id: row.student_id ? String(row.student_id) : null,
    class_code: String(row.class_code)
  };
}

export async function updateUserPassword(userId: number, newPasswordHash: string) {
  await ensureInitialized();
  return getDb().execute({
    sql: 'UPDATE users SET password_hash = ? WHERE id = ?',
    args: [newPasswordHash, userId]
  });
}

/**
 * อัปเดตรหัสนักเรียนของผู้ใช้
 */
export async function updateUserStudentId(userId: number, studentId: string) {
  await ensureInitialized();
  return getDb().execute({
    sql: 'UPDATE users SET student_id = ? WHERE id = ?',
    args: [studentId, userId]
  });
}

// ============================================================================
// ฟังก์ชันจัดการอีเวนต์
// ============================================================================

export async function insertEvent(title: string, description: string, eventDate: string) {
  await ensureInitialized();
  const createdAt = new Date().toISOString();
  const result = await getDb().execute({
    sql: 'INSERT INTO events (title, description, event_date, created_at) VALUES (?, ?, ?, ?)',
    args: [title.trim(), description.trim(), eventDate, createdAt]
  });
  return { id: Number(result.lastInsertRowid), createdAt };
}

export async function listEvents() {
  await ensureInitialized();
  const result = await getDb().execute(
    'SELECT id, title, description, event_date as eventDate, created_at as createdAt FROM events ORDER BY event_date ASC'
  );
  return result.rows.map(row => ({
    id: Number(row.id),
    title: String(row.title),
    description: String(row.description || ''),
    eventDate: String(row.eventDate),
    createdAt: String(row.createdAt)
  }));
}

export async function updateEvent(id: number, title: string, description: string, eventDate: string) {
  await ensureInitialized();
  return getDb().execute({
    sql: 'UPDATE events SET title = ?, description = ?, event_date = ? WHERE id = ?',
    args: [title.trim(), description.trim(), eventDate, id]
  });
}

export async function deleteEvent(id: number) {
  await ensureInitialized();
  return getDb().execute({
    sql: 'DELETE FROM events WHERE id = ?',
    args: [id]
  });
}

// ============================================================================
// MESSAGE FUNCTIONS
// ============================================================================

export async function insertMessage(body: string) {
  await ensureInitialized();
  const createdAt = new Date().toISOString();
  const result = await getDb().execute({
    sql: 'INSERT INTO messages (body, created_at) VALUES (?, ?)',
    args: [body.trim(), createdAt]
  });
  return { id: Number(result.lastInsertRowid), createdAt };
}

export async function insertAnonymousMessage(body: string, recipientUserId: number, senderUserId?: number) {
  await ensureInitialized();
  const createdAt = new Date().toISOString();
  const result = await getDb().execute({
    sql: 'INSERT INTO messages (body, recipient_user_id, sender_user_id, created_at) VALUES (?, ?, ?, ?)',
    args: [body.trim(), recipientUserId, senderUserId ?? null, createdAt]
  });
  return { id: Number(result.lastInsertRowid), createdAt };
}

export async function listInbox(recipientUserId: number) {
  await ensureInitialized();
  const result = await getDb().execute({
    sql: 'SELECT id, body, is_read as isRead, created_at as createdAt FROM messages WHERE recipient_user_id = ? ORDER BY created_at DESC',
    args: [recipientUserId]
  });
  return result.rows.map(row => ({
    id: Number(row.id),
    body: String(row.body),
    isRead: Number(row.isRead || 0),
    createdAt: String(row.createdAt)
  }));
}

export async function listAllMessagesDetailed() {
  await ensureInitialized();
  const result = await getDb().execute(`
    SELECT
      m.id,
      m.body,
      m.is_read as isRead,
      m.created_at as createdAt,
      ru.first_name || ' ' || ru.last_name as recipientName,
      ru.class_code as recipientClass,
      su.first_name || ' ' || su.last_name as senderName,
      su.class_code as senderClass
    FROM messages m
    LEFT JOIN users ru ON ru.id = m.recipient_user_id
    LEFT JOIN users su ON su.id = m.sender_user_id
    ORDER BY m.created_at DESC
  `);
  return result.rows.map(row => ({
    id: Number(row.id),
    body: String(row.body),
    isRead: Number(row.isRead || 0),
    createdAt: String(row.createdAt),
    recipientName: row.recipientName ? String(row.recipientName) : null,
    recipientClass: row.recipientClass ? String(row.recipientClass) : null,
    senderName: row.senderName ? String(row.senderName) : null,
    senderClass: row.senderClass ? String(row.senderClass) : null
  }));
}

export async function markMessageAsRead(messageId: number, recipientUserId: number) {
  await ensureInitialized();
  return getDb().execute({
    sql: 'UPDATE messages SET is_read = 1 WHERE id = ? AND recipient_user_id = ?',
    args: [messageId, recipientUserId]
  });
}

export async function deleteMessage(messageId: number, recipientUserId: number) {
  await ensureInitialized();
  return getDb().execute({
    sql: 'DELETE FROM messages WHERE id = ? AND recipient_user_id = ?',
    args: [messageId, recipientUserId]
  });
}

export async function deleteMessageById(messageId: number) {
  await ensureInitialized();
  return getDb().execute({
    sql: 'DELETE FROM messages WHERE id = ?',
    args: [messageId]
  });
}

export async function countUnreadMessages(recipientUserId: number) {
  await ensureInitialized();
  try {
    const result = await getDb().execute({
      sql: 'SELECT COUNT(*) as count FROM messages WHERE recipient_user_id = ? AND is_read = 0',
      args: [recipientUserId]
    });
    return Number(result.rows[0]?.count || 0);
  } catch (err) {
    console.error('Error counting unread messages:', err);
    return 0;
  }
}

// ============================================================================
// CLASS FUNCTIONS
// ============================================================================

export async function listClasses() {
  await ensureInitialized();
  const result = await getDb().execute(
    'SELECT DISTINCT class_code as classCode FROM users ORDER BY class_code ASC'
  );
  return result.rows.map(row => ({
    classCode: String(row.classCode)
  }));
}

export async function listUsersByClassCode(classCode: string) {
  await ensureInitialized();
  const result = await getDb().execute({
    sql: 'SELECT id, first_name as firstName, last_name as lastName FROM users WHERE class_code = ? ORDER BY first_name ASC, last_name ASC',
    args: [classCode]
  });
  return result.rows.map(row => ({
    id: Number(row.id),
    firstName: String(row.firstName),
    lastName: String(row.lastName)
  }));
}

// ============================================================================
// REPORT FUNCTIONS
// ============================================================================

export async function insertReport(title: string, detail: string, imageUrl?: string) {
  await ensureInitialized();
  const createdAt = new Date().toISOString();
  const result = await getDb().execute({
    sql: 'INSERT INTO reports (title, detail, image_url, created_at) VALUES (?, ?, ?, ?)',
    args: [title.trim(), detail.trim(), imageUrl || null, createdAt]
  });
  return { id: Number(result.lastInsertRowid), createdAt };
}

export async function listAllReports() {
  await ensureInitialized();
  const result = await getDb().execute(
    'SELECT id, title, detail, image_url as imageUrl, created_at as createdAt FROM reports ORDER BY created_at DESC'
  );
  return result.rows.map(row => ({
    id: Number(row.id),
    title: String(row.title),
    detail: String(row.detail || ''),
    imageUrl: row.imageUrl ? String(row.imageUrl) : null,
    createdAt: String(row.createdAt)
  }));
}

export async function deleteReport(id: number) {
  await ensureInitialized();
  return getDb().execute({
    sql: 'DELETE FROM reports WHERE id = ?',
    args: [id]
  });
}

// ============================================================================
// ADMIN FUNCTIONS
// ============================================================================

export async function findAdmin(username: string) {
  await ensureInitialized();
  const result = await getDb().execute({
    sql: 'SELECT id, username, password_hash, created_at FROM admins WHERE username = ?',
    args: [username.trim()]
  });
  if (result.rows.length === 0) return undefined;
  const row = result.rows[0];
  return {
    id: Number(row.id),
    username: String(row.username),
    password_hash: String(row.password_hash),
    created_at: String(row.created_at)
  };
}

export async function createAdmin(username: string, passwordHash: string) {
  await ensureInitialized();
  const createdAt = new Date().toISOString();
  const result = await getDb().execute({
    sql: 'INSERT INTO admins (username, password_hash, created_at) VALUES (?, ?, ?)',
    args: [username.trim(), passwordHash, createdAt]
  });
  return { id: Number(result.lastInsertRowid), createdAt };
}

// ============================================================================
// DRESS CODE FUNCTIONS
// ============================================================================

export async function listDressCode() {
  await ensureInitialized();
  const result = await getDb().execute('SELECT * FROM dress_code ORDER BY created_at DESC');
  return result.rows.map(row => ({
    id: Number(row.id),
    title: String(row.title),
    description: String(row.description),
    image_url: row.image_url ? String(row.image_url) : null,
    created_at: String(row.created_at)
  }));
}

export async function insertDressCode(title: string, description: string, imageUrl?: string) {
  await ensureInitialized();
  const createdAt = new Date().toISOString();
  const result = await getDb().execute({
    sql: 'INSERT INTO dress_code (title, description, image_url, created_at) VALUES (?, ?, ?, ?)',
    args: [title.trim(), description.trim(), imageUrl || null, createdAt]
  });
  return { id: Number(result.lastInsertRowid), createdAt };
}

export async function updateDressCode(id: number, title: string, description: string, imageUrl?: string) {
  await ensureInitialized();
  return getDb().execute({
    sql: 'UPDATE dress_code SET title = ?, description = ?, image_url = ? WHERE id = ?',
    args: [title.trim(), description.trim(), imageUrl || null, id]
  });
}

export async function deleteDressCode(id: number) {
  await ensureInitialized();
  return getDb().execute({
    sql: 'DELETE FROM dress_code WHERE id = ?',
    args: [id]
  });
}

// ============================================================================
// SCHEDULE FUNCTIONS
// ============================================================================

export async function listSchedules() {
  await ensureInitialized();
  const result = await getDb().execute('SELECT * FROM schedules ORDER BY date DESC, created_at DESC');
  return result.rows.map(row => ({
    id: Number(row.id),
    type: String(row.type),
    title: String(row.title),
    description: row.description ? String(row.description) : null,
    date: row.date ? String(row.date) : null,
    created_at: String(row.created_at)
  }));
}

export async function insertSchedule(type: string, title: string, description: string, date?: string) {
  await ensureInitialized();
  const createdAt = new Date().toISOString();
  const result = await getDb().execute({
    sql: 'INSERT INTO schedules (type, title, description, date, created_at) VALUES (?, ?, ?, ?, ?)',
    args: [type, title.trim(), description.trim(), date || null, createdAt]
  });
  return { id: Number(result.lastInsertRowid), createdAt };
}

export async function updateSchedule(id: number, type: string, title: string, description: string, date?: string) {
  await ensureInitialized();
  return getDb().execute({
    sql: 'UPDATE schedules SET type = ?, title = ?, description = ?, date = ? WHERE id = ?',
    args: [type, title.trim(), description.trim(), date || null, id]
  });
}

export async function deleteSchedule(id: number) {
  await ensureInitialized();
  return getDb().execute({
    sql: 'DELETE FROM schedules WHERE id = ?',
    args: [id]
  });
}

// ============================================================================
// ANNOUNCEMENT FUNCTIONS
// ============================================================================

export async function listAnnouncements() {
  await ensureInitialized();
  try {
    const result = await getDb().execute('SELECT * FROM announcements ORDER BY created_at DESC');
    return result.rows.map(row => ({
      id: Number(row.id),
      title: String(row.title),
      content: String(row.content),
      priority: String(row.priority || 'normal'),
      image_url: row.image_url ? String(row.image_url) : null,
      created_at: String(row.created_at)
    }));
  } catch (err) {
    console.error('Error listing announcements:', err);
    return [];
  }
}

export async function insertAnnouncement(title: string, content: string, priority: string = 'normal', imageUrl: string = '') {
  await ensureInitialized();
  const createdAt = new Date().toISOString();
  const result = await getDb().execute({
    sql: 'INSERT INTO announcements (title, content, priority, image_url, created_at) VALUES (?, ?, ?, ?, ?)',
    args: [title.trim(), content.trim(), priority, imageUrl || null, createdAt]
  });
  return { id: Number(result.lastInsertRowid), createdAt };
}

export async function updateAnnouncement(id: number, title: string, content: string, priority: string, imageUrl: string = '') {
  await ensureInitialized();
  return getDb().execute({
    sql: 'UPDATE announcements SET title = ?, content = ?, priority = ?, image_url = ? WHERE id = ?',
    args: [title.trim(), content.trim(), priority, imageUrl || null, id]
  });
}

export async function deleteAnnouncement(id: number) {
  await ensureInitialized();
  return getDb().execute({
    sql: 'DELETE FROM announcements WHERE id = ?',
    args: [id]
  });
}

// ============================================================================
// TEACHER FUNCTIONS
// ============================================================================

export async function findTeacher(firstName: string, lastName: string) {
  await ensureInitialized();
  const result = await getDb().execute({
    sql: 'SELECT id, first_name, last_name, password_hash, created_at FROM teachers WHERE first_name = ? AND last_name = ?',
    args: [firstName.trim(), lastName.trim()]
  });
  if (result.rows.length === 0) return undefined;
  const row = result.rows[0];
  return {
    id: Number(row.id),
    first_name: String(row.first_name),
    last_name: String(row.last_name),
    password_hash: String(row.password_hash),
    created_at: String(row.created_at)
  };
}

export async function createTeacher(firstName: string, lastName: string, passwordHash: string) {
  await ensureInitialized();
  const createdAt = new Date().toISOString();
  const result = await getDb().execute({
    sql: 'INSERT INTO teachers (first_name, last_name, password_hash, created_at) VALUES (?, ?, ?, ?)',
    args: [firstName.trim(), lastName.trim(), passwordHash, createdAt]
  });
  return { id: Number(result.lastInsertRowid), createdAt };
}

export async function listAllTeachers() {
  await ensureInitialized();
  const result = await getDb().execute(
    'SELECT id, first_name, last_name, created_at FROM teachers ORDER BY first_name ASC, last_name ASC'
  );
  return result.rows.map(row => ({
    id: Number(row.id),
    first_name: String(row.first_name),
    last_name: String(row.last_name),
    created_at: String(row.created_at)
  }));
}

export async function deleteTeacher(teacherId: number) {
  await ensureInitialized();
  return getDb().execute({
    sql: 'DELETE FROM teachers WHERE id = ?',
    args: [teacherId]
  });
}

export async function updateTeacherPassword(teacherId: number, newPasswordHash: string) {
  await ensureInitialized();
  return getDb().execute({
    sql: 'UPDATE teachers SET password_hash = ? WHERE id = ?',
    args: [newPasswordHash, teacherId]
  });
}

// ============================================================================
// AI KNOWLEDGE FUNCTIONS
// ============================================================================

export async function listAllAIKnowledge() {
  await ensureInitialized();
  const result = await getDb().execute('SELECT * FROM ai_knowledge ORDER BY updated_at DESC');
  return result.rows.map(row => ({
    id: Number(row.id),
    question: String(row.question),
    answer: String(row.answer),
    keywords: String(row.keywords || ''),
    category: String(row.category || ''),
    created_at: String(row.created_at),
    updated_at: String(row.updated_at)
  }));
}

export async function searchAIKnowledge(query: string) {
  await ensureInitialized();
  const searchTerm = `%${query}%`;
  const result = await getDb().execute({
    sql: `SELECT * FROM ai_knowledge WHERE question LIKE ? OR answer LIKE ? OR keywords LIKE ? ORDER BY updated_at DESC`,
    args: [searchTerm, searchTerm, searchTerm]
  });
  return result.rows.map(row => ({
    id: Number(row.id),
    question: String(row.question),
    answer: String(row.answer),
    keywords: String(row.keywords || ''),
    category: String(row.category || ''),
    created_at: String(row.created_at),
    updated_at: String(row.updated_at)
  }));
}

export async function insertAIKnowledge(question: string, answer: string, keywords: string, category: string) {
  await ensureInitialized();
  const now = new Date().toISOString();
  const result = await getDb().execute({
    sql: 'INSERT INTO ai_knowledge (question, answer, keywords, category, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
    args: [question.trim(), answer.trim(), keywords.trim(), category.trim(), now, now]
  });
  return { id: Number(result.lastInsertRowid), createdAt: now };
}

export async function updateAIKnowledge(id: number, question: string, answer: string, keywords: string, category: string) {
  await ensureInitialized();
  const now = new Date().toISOString();
  return getDb().execute({
    sql: 'UPDATE ai_knowledge SET question = ?, answer = ?, keywords = ?, category = ?, updated_at = ? WHERE id = ?',
    args: [question.trim(), answer.trim(), keywords.trim(), category.trim(), now, id]
  });
}

export async function deleteAIKnowledge(id: number) {
  await ensureInitialized();
  return getDb().execute({
    sql: 'DELETE FROM ai_knowledge WHERE id = ?',
    args: [id]
  });
}
