// Script เพิ่มนักเรียนหลายคนไป Turso (ตั้งรหัสเริ่มต้น 123456)
const { createClient } = require('@libsql/client');
const bcrypt = require('bcryptjs');

const DEFAULT_PASSWORD = '123456';

// ข้อมูลนักเรียน: grade (ชั้น), room (ห้อง), first_name, last_name
const students = [
  { grade: 1, room: 1, first_name: 'ทัตเทพ', last_name: 'เรือนงาม' },
  { grade: 1, room: 1, first_name: 'บรรณสรณ์', last_name: 'ผันแปรจิต' },
  { grade: 1, room: 1, first_name: 'พิชญุตม์', last_name: 'ศรีพูล' },
  { grade: 1, room: 1, first_name: 'วรโชติ', last_name: 'มากดี' },
  { grade: 1, room: 1, first_name: 'พงศกร', last_name: 'ผิวนิล' },
  { grade: 1, room: 1, first_name: 'เกียรติบดินทร์', last_name: 'แจ่มกลาง' },
  { grade: 1, room: 1, first_name: 'ศยุภัฑฐ์', last_name: 'โสตวัย' },
  { grade: 1, room: 1, first_name: 'ภัทรวิทย์', last_name: 'คงรอด' },
  { grade: 1, room: 1, first_name: 'คุณธรรม', last_name: 'พรหมทองสุข' },
  { grade: 1, room: 1, first_name: 'เดชฤทธิ์', last_name: 'สอนขำ' },
  { grade: 1, room: 1, first_name: 'ภูมินทร์', last_name: 'บุญทัน' },
  { grade: 1, room: 1, first_name: 'สหัศชัย', last_name: 'นนทะนำ' },
  { grade: 1, room: 1, first_name: 'รสริน', last_name: 'บัวนาค' },
  { grade: 1, room: 1, first_name: 'กานต์ธิดา', last_name: 'จูเซ่ง' },
  { grade: 1, room: 1, first_name: 'เปรมณพิชญ์', last_name: 'วาณิชย์เจริญ' },
  { grade: 1, room: 1, first_name: 'คุณัญญา', last_name: 'ทิศรักษ์' },
  { grade: 1, room: 1, first_name: 'ทัชรินทร์', last_name: 'ใจกว้าง' },
  { grade: 1, room: 1, first_name: 'กุสุมา', last_name: 'กองจะโปะ' },
  { grade: 1, room: 1, first_name: 'สุชานันท์', last_name: 'เจนเขตกิจ' },
  { grade: 1, room: 1, first_name: 'กัญญพัชร', last_name: 'เผือกผ่อง' },
  { grade: 1, room: 1, first_name: 'อารยา', last_name: 'สิทธา' },
  { grade: 1, room: 1, first_name: 'พรลภัส', last_name: 'อนุอินทร์' },
  { grade: 1, room: 1, first_name: 'ลัลล์ลลิล', last_name: 'ชูจันทร์' },
  { grade: 1, room: 1, first_name: 'ธนภรณ์', last_name: 'ใจดี' },
  { grade: 1, room: 1, first_name: 'ปิ่นมณี', last_name: 'ดอกไม้หอม' },
  { grade: 1, room: 1, first_name: 'รัติยา', last_name: 'รักสุวรรณ์' },
  { grade: 1, room: 1, first_name: 'นนทพร', last_name: 'สัญจร' },
  { grade: 1, room: 1, first_name: 'มะลิ', last_name: 'ศรีประสิทธิ์' },
  { grade: 1, room: 1, first_name: 'ศศิมัณฑมน', last_name: 'แก้วทอง' },
  { grade: 1, room: 1, first_name: 'อริยะ', last_name: 'พิริยสถิต' },
  { grade: 1, room: 1, first_name: 'ไดมอนด์', last_name: 'จิวเอลรี' },
  { grade: 1, room: 1, first_name: 'สุธินันท์', last_name: 'พิศแก้ว' },
  { grade: 1, room: 1, first_name: 'ภัทราวดี', last_name: 'ทองแท้' },
  { grade: 1, room: 1, first_name: 'อลิสา', last_name: 'บุญถาวร' },
  { grade: 1, room: 2, first_name: 'ณพงค์', last_name: 'สมหวัง' },
  { grade: 1, room: 2, first_name: 'ภาณุวัฒน์', last_name: 'ศุภวิจิตานนท์' },
  { grade: 1, room: 2, first_name: 'ศตคุณ', last_name: 'คงศรีทอง' },
  { grade: 1, room: 2, first_name: 'ธนภูมิ', last_name: 'หมุนขำ' },
  { grade: 1, room: 2, first_name: 'ยศพล', last_name: 'พรหมกวนุกูล' },
  { grade: 1, room: 2, first_name: 'ก้องเกียรติ', last_name: 'นาทอง' },
  { grade: 1, room: 2, first_name: 'ธีระพงษ์', last_name: 'เรืองโรจน์' },
  { grade: 1, room: 2, first_name: 'องคะรัชต์', last_name: 'พันธ์ศิริ' },
  { grade: 1, room: 2, first_name: 'แจ็ค', last_name: 'ลี' },
  { grade: 1, room: 2, first_name: 'ธนกร', last_name: 'ทองศรี' },
  { grade: 1, room: 2, first_name: 'ธัญญาภรณ์', last_name: 'สระกอบแก้ว' },
  { grade: 1, room: 2, first_name: 'พรนภา', last_name: 'แสงอ่อน' },
  { grade: 1, room: 2, first_name: 'สุพิชญา', last_name: 'พิศแก้ว' },
  { grade: 1, room: 2, first_name: 'สิริมา', last_name: 'นุชไตรราช' },
  { grade: 1, room: 2, first_name: 'อรภานัฐถา', last_name: 'สุนทอง' },
  { grade: 1, room: 2, first_name: 'นริสสรา', last_name: 'ศรีทองกุล' },
  { grade: 1, room: 2, first_name: 'ช่อผกา', last_name: 'พรหมสนิท' },
  { grade: 1, room: 2, first_name: 'ภูรีดา', last_name: 'ทิพย์มงคล' },
  { grade: 1, room: 2, first_name: 'ประกายดาว', last_name: 'จันทร์อินทร์' },
  { grade: 1, room: 2, first_name: 'นวพร', last_name: 'สมหวัง' },
  { grade: 1, room: 2, first_name: 'อาทิตยา', last_name: 'ไทยปาน' },
  { grade: 1, room: 2, first_name: 'สาธิตา', last_name: 'รอดศรี' },
  { grade: 1, room: 2, first_name: 'พุธฐรัตน์', last_name: 'ก่อเกิด' },
  { grade: 1, room: 2, first_name: 'นุสรา', last_name: 'สายเสมา' },
  { grade: 1, room: 2, first_name: 'วิชญาดา', last_name: 'ทองปัน' },
  { grade: 1, room: 2, first_name: 'ศจีนันท์', last_name: 'ทองช่วยทิพย์' },
  { grade: 1, room: 2, first_name: 'สิราวรรณ', last_name: 'ใหมแก้ว' },
  { grade: 1, room: 2, first_name: 'กัลยาภรณ์', last_name: 'แก้วท่าพยา' },
  { grade: 1, room: 2, first_name: 'ยิ่งลักษณ์', last_name: 'แคทรีน เอสเตส' },
  { grade: 1, room: 2, first_name: 'ศิรประภา', last_name: 'คลิ้งสวัสดิ์' },
  { grade: 1, room: 2, first_name: 'กาญจนวรรณ', last_name: 'เงินบำรุง' },
  { grade: 1, room: 3, first_name: 'วิศรุต', last_name: 'บัวเกตุ' },
  { grade: 1, room: 3, first_name: 'ฉัตรชัย', last_name: 'อรุณรังษี' },
  { grade: 1, room: 3, first_name: 'ภาคิน', last_name: 'สมหวัง' },
  { grade: 1, room: 3, first_name: 'อานัส', last_name: 'พุทธพงษ์' },
  { grade: 1, room: 3, first_name: 'อานนท์', last_name: 'โสเจยยะ' },
  { grade: 1, room: 3, first_name: 'นนทพงศ์', last_name: 'รัตนเสนศรี' },
  { grade: 1, room: 3, first_name: 'พุฒิพัชร', last_name: 'ชูเชิด' },
  { grade: 1, room: 3, first_name: 'กิตติภณ', last_name: 'จันทร์ศรีนาค' },
  { grade: 1, room: 3, first_name: 'ภาณพัช', last_name: 'ผลกุศล' },
  { grade: 1, room: 3, first_name: 'ศุกลวัฒน์', last_name: 'แก้วบุญตา' },
  { grade: 1, room: 3, first_name: 'ภัคพล', last_name: 'คงบุญ' },
  { grade: 1, room: 3, first_name: 'เทพบดินทร์', last_name: 'มิตรแสง' },
  { grade: 1, room: 3, first_name: 'ภาคิณ', last_name: 'ใจสว่าง' },
  { grade: 1, room: 3, first_name: 'บารมี', last_name: 'โชติช่วง' },
  { grade: 1, room: 3, first_name: 'นัทธพงค์', last_name: 'แหวนหรุ่น' },
  { grade: 1, room: 3, first_name: 'ภูชล', last_name: 'วาณิชย์เจริญ' },
  { grade: 1, room: 3, first_name: 'เทพทัต', last_name: 'ทิพสอน' },
  { grade: 1, room: 3, first_name: 'ปฐมพร', last_name: 'จิระประดิษฐ์ผล' },
  { grade: 1, room: 3, first_name: 'พิมพ์ลภัส', last_name: 'หมื่นวัน' },
  { grade: 1, room: 3, first_name: 'ศิรินทิพย์', last_name: 'อ่องสอาด' },
  { grade: 1, room: 3, first_name: 'ปพิชยา', last_name: 'จันทองเดช' },
  { grade: 1, room: 3, first_name: 'ธมลวรรณ', last_name: 'เพชรเจริญ' },
  { grade: 1, room: 3, first_name: 'จิรัชญา', last_name: 'หนูแก้ว' },
  { grade: 1, room: 3, first_name: 'พลอยไพลิน', last_name: 'พึ่งปาน' },
  { grade: 1, room: 3, first_name: 'พลอยพิชชา', last_name: 'ศรีทองกุล' },
  { grade: 1, room: 3, first_name: 'สสิธร', last_name: 'บัวชื่น' },
  { grade: 1, room: 3, first_name: 'นันทิยา', last_name: 'คงปราณ' },
  { grade: 1, room: 3, first_name: 'มณีรัตน์', last_name: 'นิลพงศ์' },
  { grade: 1, room: 3, first_name: 'ญาณิศา', last_name: 'สุขสนิท' },
  { grade: 1, room: 4, first_name: 'สิทธิกร', last_name: 'บุตรรักษา' },
  { grade: 1, room: 4, first_name: 'ญาณวุฒิ', last_name: 'ทิแก้ว' },
  { grade: 1, room: 4, first_name: 'ชิณวุฒิ', last_name: 'ช่วงชุณห์ส่อง' },
  { grade: 1, room: 4, first_name: 'อาทิตย์', last_name: 'คร้ามสมุทร' },
  { grade: 1, room: 4, first_name: 'ชาญวิทย์', last_name: 'ทองจันทร์' },
  { grade: 1, room: 4, first_name: 'ณัฐชนัน', last_name: 'ศรีทองกุล' },
  { grade: 1, room: 4, first_name: 'พนา', last_name: 'ศรีทองกุล' },
  { grade: 1, room: 4, first_name: 'ศิวกร', last_name: 'ห้งเขียบ' },
  { grade: 1, room: 4, first_name: 'โรจนภัส', last_name: 'ยอดราช' },
  { grade: 1, room: 4, first_name: 'พงษกร', last_name: 'พรหมชนะ' },
  { grade: 1, room: 4, first_name: 'นนทวัฒน์', last_name: 'มณีพงค์' },
  { grade: 1, room: 4, first_name: 'ภานุสรณ์', last_name: 'เจริญรูป' },
  { grade: 1, room: 4, first_name: 'ธนวิชญ์', last_name: 'อรแพทย์' },
  { grade: 1, room: 4, first_name: 'มงคล', last_name: 'บุญพันธ์' },
  { grade: 1, room: 4, first_name: 'กันตวิชญ์', last_name: 'พ่วงแสง' },
  { grade: 1, room: 4, first_name: 'ภานุพงษ์', last_name: 'ใหญ่ยิ่ง' },
  { grade: 1, room: 4, first_name: 'เอกพล', last_name: 'ฮั่นวิริยะนนท์' },
  { grade: 1, room: 4, first_name: 'อภิวัฒน์', last_name: 'พรหมณี' },
  { grade: 1, room: 4, first_name: 'ยุทธนา', last_name: 'พรหมเจริญ' },
  { grade: 1, room: 4, first_name: 'กมลชนก', last_name: 'เพิ่มพูล' },
  { grade: 1, room: 4, first_name: 'ศิริญาพร', last_name: 'น้ำพี้' },
  { grade: 1, room: 4, first_name: 'สุภะวรรณ', last_name: 'นอร์ริส' },
  { grade: 1, room: 4, first_name: 'อนันตพร', last_name: 'ชูช่วย' },
  { grade: 1, room: 4, first_name: 'นฤมล', last_name: 'รักชาติ' },
  { grade: 1, room: 4, first_name: 'กนกวรรณ', last_name: 'ทองเพชร' },
  { grade: 1, room: 4, first_name: 'เสาวนี', last_name: 'ภู่ไพบูลย์' },
  { grade: 1, room: 4, first_name: 'ภาคินี', last_name: 'ปัตถาติ' },
  { grade: 1, room: 4, first_name: 'กัญญพัชร', last_name: 'เฟือสุวรรณ' },
  { grade: 1, room: 4, first_name: 'พิมพ์ชนก', last_name: 'ล้มศักดิ์' },
  { grade: 1, room: 5, first_name: 'ชวนนท์', last_name: 'ศรีทิพย์' },
  { grade: 1, room: 5, first_name: 'พรรค์ปคัณภ์', last_name: 'เงินเย็น' },
  { grade: 1, room: 5, first_name: 'จิตติพัฒน์', last_name: 'ไชยวาริน' },
  { grade: 1, room: 5, first_name: 'เกียรติศักดิ์', last_name: 'ธงชัย' },
  { grade: 1, room: 5, first_name: 'หัตถพุทธ', last_name: 'วารีวนิช' },
  { grade: 1, room: 5, first_name: 'ภูมิพัฒน์', last_name: 'ยานะนวล' },
  { grade: 1, room: 5, first_name: 'พัชรพล', last_name: 'ทองปน' },
  { grade: 1, room: 5, first_name: 'พงษกร', last_name: 'นุ่นแก้ว' },
  { grade: 1, room: 5, first_name: 'วีระศักดิ์', last_name: 'ทองนวล' },
  { grade: 1, room: 5, first_name: 'ภัทรชัย', last_name: 'ศรีเผือก' },
  { grade: 1, room: 5, first_name: 'นันทภัทร', last_name: 'สุวรรณโณ' },
  { grade: 1, room: 5, first_name: 'ณัฏฐวัฒน์', last_name: 'บรรดาศักดิ์' },
  { grade: 1, room: 5, first_name: 'ภูพิพัฒน์', last_name: 'ธรรมศรี' },
  { grade: 1, room: 5, first_name: 'พัสกร', last_name: 'สิงห์งอย' },
  { grade: 1, room: 5, first_name: 'สุทธิคราม', last_name: 'เพ็ชรพรม' },
  { grade: 1, room: 5, first_name: 'สิทธิชัย', last_name: 'โมร์จ' },
  { grade: 1, room: 5, first_name: 'เดชภูมินท์', last_name: 'กุลศรี' },
  { grade: 1, room: 5, first_name: 'ภัสรพงศ์', last_name: 'เกื้อสกุล' },
  { grade: 1, room: 5, first_name: 'ธาราวดี', last_name: 'หอแก้ว' },
  { grade: 1, room: 5, first_name: 'สรัลพร', last_name: 'ธรรมสวัสดิ์' },
  { grade: 1, room: 5, first_name: 'อาริยา', last_name: 'ใจรังษี' },
  { grade: 1, room: 5, first_name: 'พิยดา', last_name: 'ชัยพล' },
  { grade: 1, room: 5, first_name: 'เมย์ ซู', last_name: 'เจซซาด' },
  { grade: 1, room: 5, first_name: 'เกตน์นิภา', last_name: 'แซ่ตัง' },
  { grade: 1, room: 5, first_name: 'ญารวี', last_name: 'แสงศรี' },
  { grade: 1, room: 5, first_name: 'ทิพวรรณ', last_name: 'ท่อนสัน' },
  { grade: 1, room: 5, first_name: 'เชลซี', last_name: 'คาร์' },
  { grade: 1, room: 5, first_name: 'ปาณิสรา', last_name: 'ใจมั่น' },
  { grade: 1, room: 5, first_name: 'อุษา', last_name: '-' },
  { grade: 1, room: 5, first_name: 'สุทัตตา', last_name: 'จันโท' },
  { grade: 1, room: 5, first_name: 'ตุลยดา', last_name: 'อนุอินทร์' },
  { grade: 1, room: 5, first_name: 'กรกันยา', last_name: 'พรหมเจริญ' },
  { grade: 1, room: 5, first_name: 'วรดา', last_name: 'ศรีกล่ำ' },
  { grade: 1, room: 5, first_name: 'สุปวีณ์', last_name: 'ฝางเกตุ' },
  // ... ข้อมูลชั้น ม.2 - ม.6 ตามรายการที่ผู้ใช้ให้มา ...
];

async function main() {
  const url = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;

  if (!url || !authToken) {
    console.log('❌ กรุณาตั้งค่า TURSO_DATABASE_URL และ TURSO_AUTH_TOKEN');
    process.exit(1);
  }

  const client = createClient({ url, authToken });

  const passwordHash = await bcrypt.hash(DEFAULT_PASSWORD, 10);

  let success = 0;
  let skipped = 0;

  for (const s of students) {
    const class_code = `ม.${s.grade}/${s.room}`;
    try {
      const existing = await client.execute({
        sql: 'SELECT id FROM users WHERE first_name = ? AND last_name = ? AND class_code = ?',
        args: [s.first_name, s.last_name, class_code]
      });
      if (existing.rows.length > 0) {
        console.log(`⏭️  ${s.first_name} ${s.last_name} (${class_code}) - มีอยู่แล้ว`);
        skipped++;
        continue;
      }

      await client.execute({
        sql: `INSERT INTO users (first_name, last_name, class_code, password_hash, created_at, role) 
              VALUES (?, ?, ?, ?, datetime('now'), 'student')`,
        args: [s.first_name, s.last_name, class_code, passwordHash]
      });

      console.log(`✅ เพิ่ม ${s.first_name} ${s.last_name} (${class_code})`);
      success++;
    } catch (e) {
      console.log(`❌ ${s.first_name} ${s.last_name} (${class_code}) - Error: ${e.message}`);
    }
  }

  const result = await client.execute('SELECT COUNT(*) as count FROM users');
  console.log('\n' + '='.repeat(50));
  console.log('📊 สรุป:');
  console.log(`   ✅ เพิ่มสำเร็จ: ${success} คน`);
  console.log(`   ⏭️  ข้าม: ${skipped} คน`);
  console.log(`   👥 นักเรียนทั้งหมด: ${result.rows[0].count} คน`);
  console.log('='.repeat(50));
  console.log(`\n🔑 รหัสผ่านเริ่มต้น: ${DEFAULT_PASSWORD}`);

  client.close();
}

main().catch(console.error);
