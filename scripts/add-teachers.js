// Script เพิ่มครูหลายคนไป Turso
const { createClient } = require('@libsql/client');
const bcrypt = require('bcryptjs');

const teachers = [
  { first_name: 'วันวิสาข์', last_name: 'สุขภัคพงศ์' },
  { first_name: 'โสรวีร์', last_name: 'แช่มชื่น' },
  { first_name: 'ลดาวัลย์', last_name: 'บัวนาค' },
  { first_name: 'ธัญลักษณ์', last_name: 'แก้วจัง' },
  { first_name: 'พิชิต', last_name: 'ทองนุ้ย' },
  { first_name: 'อุไรวรรณ', last_name: 'พูลทรัพย์' },
  { first_name: 'วิชาญ', last_name: 'ฝอยทอง' },
  { first_name: 'ปิยะนุช', last_name: 'พินโท' },
  { first_name: 'ศดานันท์', last_name: 'ดอนสมพงษ์' },
  { first_name: 'ภาณุพงศ์', last_name: 'กมลจิตรุ่งเรือง' },
  { first_name: 'สุริวิภา', last_name: 'สุปัญญาพงศ์' },
  { first_name: 'วัชรินทร์', last_name: 'สุพรหมมา' },
  { first_name: 'เจนจิรา', last_name: 'วงศ์ทอง' },
  { first_name: 'สุทธิดา', last_name: 'เพชรนารายณ์' },
  { first_name: 'อัสมะ', last_name: 'ยะเอะ' },
  { first_name: 'ณฐิยา', last_name: 'ทองสงค์' },
  { first_name: 'วรพล', last_name: 'ธานีรัตน์' },
  { first_name: 'ประพิณพร', last_name: 'ฉิมเรือง' },
  { first_name: 'พิกุลทอง', last_name: 'ศิริประภา' },
  { first_name: 'ศศิตา', last_name: 'รัตนมุณี' },
  { first_name: 'กรรศิภรณ์', last_name: 'เปาะทอง' },
  { first_name: 'ธัชญาณี', last_name: 'รุ่งรัตนกุลศรี' },
  { first_name: 'มะรุสดี', last_name: 'มะลี' },
  { first_name: 'ณัฐวัตร', last_name: 'อินทจักร' },
  { first_name: 'เบญจมาศ', last_name: 'เกื้อเส้ง' },
  { first_name: 'กฤษกานต์', last_name: 'ว่างกฤษ' },
  { first_name: 'บุณยาพร', last_name: 'หอมจันทร์' },
  { first_name: 'รังสิมันต์', last_name: 'หวังสุด' },
  { first_name: 'ณัฐริกา', last_name: 'ทุ่มทวน' },
  { first_name: 'ปราณปริยา', last_name: 'ไตรภูมิ' },
  { first_name: 'อดินันท์', last_name: 'หมัดหมัน' },
  { first_name: 'ธันย์ชนก', last_name: 'แก้วสวัสดิ์' },
  { first_name: 'วุฒิชัย', last_name: 'ลักษณะพรมราช' },
  { first_name: 'ราโมนา', last_name: 'ร่าหนิ' },
  { first_name: 'ธนากิต', last_name: 'ปิยศทิพย์' },
  { first_name: 'วุฒิพงศ์', last_name: 'วงศ์ทอง' },
  { first_name: 'สุนิสา', last_name: 'ขุนสังข์' },
  { first_name: 'ภิสรรค์', last_name: 'แย้มโสพิศ' },
  { first_name: 'วิทยา', last_name: 'ทองมาก' },
];

const DEFAULT_PASSWORD = '123456';

async function main() {
  const url = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;

  if (!url || !authToken) {
    console.log('❌ กรุณาตั้งค่า TURSO_DATABASE_URL และ TURSO_AUTH_TOKEN');
    process.exit(1);
  }

  console.log('🔗 กำลังเชื่อมต่อ Turso...');
  const client = createClient({ url, authToken });

  // Hash password
  console.log('🔐 กำลัง hash password...');
  const passwordHash = await bcrypt.hash(DEFAULT_PASSWORD, 10);

  console.log(`\n📝 กำลังเพิ่มครู ${teachers.length} คน...\n`);

  let success = 0;
  let skipped = 0;

  for (const teacher of teachers) {
    try {
      // ตรวจสอบว่ามีอยู่แล้วหรือไม่
      const existing = await client.execute({
        sql: 'SELECT id FROM teachers WHERE first_name = ? AND last_name = ?',
        args: [teacher.first_name, teacher.last_name]
      });

      if (existing.rows.length > 0) {
        console.log(`⏭️  ${teacher.first_name} ${teacher.last_name} - มีอยู่แล้ว`);
        skipped++;
        continue;
      }

      // เพิ่มครูใหม่
      await client.execute({
        sql: `INSERT INTO teachers (first_name, last_name, password_hash, created_at) 
              VALUES (?, ?, ?, datetime('now'))`,
        args: [teacher.first_name, teacher.last_name, passwordHash]
      });

      console.log(`✅ ${teacher.first_name} ${teacher.last_name}`);
      success++;
    } catch (e) {
      console.log(`❌ ${teacher.first_name} ${teacher.last_name} - Error: ${e.message}`);
    }
  }

  // สรุป
  const result = await client.execute('SELECT COUNT(*) as count FROM teachers');
  
  console.log('\n' + '='.repeat(50));
  console.log(`📊 สรุป:`);
  console.log(`   ✅ เพิ่มสำเร็จ: ${success} คน`);
  console.log(`   ⏭️  ข้าม (มีอยู่แล้ว): ${skipped} คน`);
  console.log(`   📚 ครูทั้งหมดในระบบ: ${result.rows[0].count} คน`);
  console.log('='.repeat(50));
  console.log(`\n🔑 รหัสผ่านเริ่มต้น: ${DEFAULT_PASSWORD}`);
  console.log('💡 ครูสามารถเข้าสู่ระบบด้วย ชื่อ + นามสกุล + รหัสผ่าน');

  client.close();
}

main().catch(console.error);
