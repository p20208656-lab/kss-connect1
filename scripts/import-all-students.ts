import { createClient } from '@libsql/client';

// เชื่อมต่อฐานข้อมูล
const db = createClient({
  url: process.env.TURSO_DATABASE_URL || 'file:./data/kss.db',
  authToken: process.env.TURSO_AUTH_TOKEN || undefined,
});

/**
 * ข้อมูลนักเรียนทั้งหมด (จากตารางที่ให้มา)
 */
const allStudentsData = [
  // ม.1/1
  { grade: 'ม.1', room: 1, studentId: '06541', firstName: 'ทัตเทพ', lastName: 'เรือนงาม' },
  { grade: 'ม.1', room: 1, studentId: '06542', firstName: 'บรรณสรณ์', lastName: 'ผันแปรจิต' },
  { grade: 'ม.1', room: 1, studentId: '06546', firstName: 'พิชญุตม์', lastName: 'ศรีพูล' },
  { grade: 'ม.1', room: 1, studentId: '06548', firstName: 'วรโชติ', lastName: 'มากดี' },
  { grade: 'ม.1', room: 1, studentId: '06551', firstName: 'พงศกร', lastName: 'ผิวนิล' },
  { grade: 'ม.1', room: 1, studentId: '06554', firstName: 'เกียรติบดินทร์', lastName: 'แจ่มกลาง' },
  { grade: 'ม.1', room: 1, studentId: '06555', firstName: 'ศยุภัฑฐ์', lastName: 'โสตวัย' },
  { grade: 'ม.1', room: 1, studentId: '06556', firstName: 'ภัทรวิทย์', lastName: 'คงรอด' },
  { grade: 'ม.1', room: 1, studentId: '06557', firstName: 'คุณธรรม', lastName: 'พรหมทองสุข' },
  { grade: 'ม.1', room: 1, studentId: '06566', firstName: 'เดชฤทธิ์', lastName: 'สอนขำ' },
  { grade: 'ม.1', room: 1, studentId: '06567', firstName: 'ภูมินทร์', lastName: 'บุญทัน' },
  { grade: 'ม.1', room: 1, studentId: '06568', firstName: 'สหัศชัย', lastName: 'นนทะนำ' },
  { grade: 'ม.1', room: 1, studentId: '06535', firstName: 'รสริน', lastName: 'บัวนาค' },
  { grade: 'ม.1', room: 1, studentId: '06536', firstName: 'กานต์ธิดา', lastName: 'จูเซ่ง' },
  { grade: 'ม.1', room: 1, studentId: '06537', firstName: 'เปรมณพิชญ์', lastName: 'วาณิชย์เจริญ' },
  { grade: 'ม.1', room: 1, studentId: '06538', firstName: 'คุณัญญา', lastName: 'ทิศรักษ์' },
  { grade: 'ม.1', room: 1, studentId: '06539', firstName: 'ทัชรินทร์', lastName: 'ใจกว้าง' },
  { grade: 'ม.1', room: 1, studentId: '06543', firstName: 'กุสุมา', lastName: 'กองจะโปะ' },
  { grade: 'ม.1', room: 1, studentId: '06544', firstName: 'สุชานันท์', lastName: 'เจนเขตกิจ' },
  { grade: 'ม.1', room: 1, studentId: '06545', firstName: 'กัญญพัชร', lastName: 'เผือกผ่อง' },
  { grade: 'ม.1', room: 1, studentId: '06547', firstName: 'อารยา', lastName: 'สิทธา' },
  { grade: 'ม.1', room: 1, studentId: '06549', firstName: 'พรลภัส', lastName: 'อนุอินทร์' },
  { grade: 'ม.1', room: 1, studentId: '06550', firstName: 'ลัลล์ลลิล', lastName: 'ชูจันทร์' },
  { grade: 'ม.1', room: 1, studentId: '06552', firstName: 'ธนภรณ์', lastName: 'ใจดี' },
  { grade: 'ม.1', room: 1, studentId: '06553', firstName: 'ปิ่นมณี', lastName: 'ดอกไม้หอม' },
  { grade: 'ม.1', room: 1, studentId: '06558', firstName: 'รัติยา', lastName: 'รักสุวรรณ์' },
  { grade: 'ม.1', room: 1, studentId: '06559', firstName: 'นนทพร', lastName: 'สัญจร' },
  { grade: 'ม.1', room: 1, studentId: '06560', firstName: 'มะลิ', lastName: 'ศรีประสิทธิ์' },
  { grade: 'ม.1', room: 1, studentId: '06561', firstName: 'ศศิมัณฑมน', lastName: 'แก้วทอง' },
  { grade: 'ม.1', room: 1, studentId: '06562', firstName: 'อริยะ', lastName: 'พิริยสถิต' },
  { grade: 'ม.1', room: 1, studentId: '06563', firstName: 'ไดมอนด์', lastName: 'จิวเอลรี' },
  { grade: 'ม.1', room: 1, studentId: '06564', firstName: 'สุธินันท์', lastName: 'พิศแก้ว' },
  { grade: 'ม.1', room: 1, studentId: '06565', firstName: 'ภัทราวดี', lastName: 'ทองแท้' },
  { grade: 'ม.1', room: 1, studentId: '06569', firstName: 'อลิสา', lastName: 'บุญถาวร' },

  // ม.1/2
  { grade: 'ม.1', room: 2, studentId: '06575', firstName: 'ณพงค์', lastName: 'สมหวัง' },
  { grade: 'ม.1', room: 2, studentId: '06576', firstName: 'ภาณุวัฒน์', lastName: 'ศุภวิจิตานนท์' },
  { grade: 'ม.1', room: 2, studentId: '06587', firstName: 'ศตคุณ', lastName: 'คงศรีทอง' },
  { grade: 'ม.1', room: 2, studentId: '06594', firstName: 'ธนภูมิ', lastName: 'หมุนขำ' },
  { grade: 'ม.1', room: 2, studentId: '06598', firstName: 'ยศพล', lastName: 'พรหมกวนุกูล' },
  { grade: 'ม.1', room: 2, studentId: '06599', firstName: 'ก้องเกียรติ', lastName: 'นาทอง' },
  { grade: 'ม.1', room: 2, studentId: '06600', firstName: 'ธีระพงษ์', lastName: 'เรืองโรจน์' },
  { grade: 'ม.1', room: 2, studentId: '06601', firstName: 'องคะรัชต์', lastName: 'พันธ์ศิริ' },
  { grade: 'ม.1', room: 2, studentId: '06604', firstName: 'แจ็ค', lastName: 'ลี' },
  { grade: 'ม.1', room: 2, studentId: '06597', firstName: 'ธนกร', lastName: 'ทองศรี' },
  { grade: 'ม.1', room: 2, studentId: '06573', firstName: 'ธัญญาภรณ์', lastName: 'สระกอบแก้ว' },
  { grade: 'ม.1', room: 2, studentId: '06574', firstName: 'พรนภา', lastName: 'แสงอ่อน' },
  { grade: 'ม.1', room: 2, studentId: '06570', firstName: 'สุพิชญา', lastName: 'พิศแก้ว' },
  { grade: 'ม.1', room: 2, studentId: '06577', firstName: 'สิริมา', lastName: 'นุชไตรราช' },
  { grade: 'ม.1', room: 2, studentId: '06578', firstName: 'อรภานัฐถา', lastName: 'สุนทอง' },
  { grade: 'ม.1', room: 2, studentId: '06579', firstName: 'นริสสรา', lastName: 'ศรีทองกุล' },
  { grade: 'ม.1', room: 2, studentId: '06581', firstName: 'ช่อผกา', lastName: 'พรหมสนิท' },
  { grade: 'ม.1', room: 2, studentId: '06582', firstName: 'ภูรีดา', lastName: 'ทิพย์มงคล' },
  { grade: 'ม.1', room: 2, studentId: '06583', firstName: 'ประกายดาว', lastName: 'จันทร์อินทร์' },
  { grade: 'ม.1', room: 2, studentId: '06584', firstName: 'นวพร', lastName: 'สมหวัง' },
  { grade: 'ม.1', room: 2, studentId: '06586', firstName: 'อาทิตยา', lastName: 'ไทยปาน' },
  { grade: 'ม.1', room: 2, studentId: '06589', firstName: 'สาธิตา', lastName: 'รอดศรี' },
  { grade: 'ม.1', room: 2, studentId: '06590', firstName: 'พุธฐรัตน์', lastName: 'ก่อเกิด' },
  { grade: 'ม.1', room: 2, studentId: '06591', firstName: 'นุสรา', lastName: 'สายเสมา' },
  { grade: 'ม.1', room: 2, studentId: '06580', firstName: 'วิชญาดา', lastName: 'ทองปัน' },
  { grade: 'ม.1', room: 2, studentId: '06593', firstName: 'ศจีนันท์', lastName: 'ทองช่วยทิพย์' },
  { grade: 'ม.1', room: 2, studentId: '06585', firstName: 'สิราวรรณ', lastName: 'ใหมแก้ว' },
  { grade: 'ม.1', room: 2, studentId: '06602', firstName: 'กัลยาภรณ์', lastName: 'แก้วท่าพยา' },
  { grade: 'ม.1', room: 2, studentId: '06588', firstName: 'ยิ่งลักษณ์', lastName: 'แคทรีน เอสเตส' },
  { grade: 'ม.1', room: 2, studentId: '06603', firstName: 'ศิรประภา', lastName: 'คลิ้งสวัสดิ์' },
  { grade: 'ม.1', room: 2, studentId: '06595', firstName: 'กาญจนวรรณ', lastName: 'เงินบำรุง' },

  // ม.1/3
  { grade: 'ม.1', room: 3, studentId: '06605', firstName: 'วิศรุต', lastName: 'บัวเกตุ' },
  { grade: 'ม.1', room: 3, studentId: '06607', firstName: 'ฉัตรชัย', lastName: 'อรุณรังษี' },
  { grade: 'ม.1', room: 3, studentId: '06608', firstName: 'ภาคิน', lastName: 'สมหวัง' },
  { grade: 'ม.1', room: 3, studentId: '06610', firstName: 'อานัส', lastName: 'พุทธพงษ์' },
  { grade: 'ม.1', room: 3, studentId: '06612', firstName: 'อานนท์', lastName: 'โสเจยยะ' },
  { grade: 'ม.1', room: 3, studentId: '06614', firstName: 'นนทพงศ์', lastName: 'รัตนเสนศรี' },
  { grade: 'ม.1', room: 3, studentId: '06617', firstName: 'พุฒิพัชร', lastName: 'ชูเชิด' },
  { grade: 'ม.1', room: 3, studentId: '06619', firstName: 'กิตติภณ', lastName: 'จันทร์ศรีนาค' },
  { grade: 'ม.1', room: 3, studentId: '06624', firstName: 'ภาณพัช', lastName: 'ผลกุศล' },
  { grade: 'ม.1', room: 3, studentId: '06625', firstName: 'ศุกลวัฒน์', lastName: 'แก้วบุญตา' },
  { grade: 'ม.1', room: 3, studentId: '06626', firstName: 'ภัคพล', lastName: 'คงบุญ' },
  { grade: 'ม.1', room: 3, studentId: '06627', firstName: 'เทพบดินทร์', lastName: 'มิตรแสง' },
  { grade: 'ม.1', room: 3, studentId: '06628', firstName: 'ภาคิณ', lastName: 'ใจสว่าง' },
  { grade: 'ม.1', room: 3, studentId: '06633', firstName: 'บารมี', lastName: 'โชติช่วง' },
  { grade: 'ม.1', room: 3, studentId: '06632', firstName: 'นัทธพงค์', lastName: 'แหวนหรุ่น' },
  { grade: 'ม.1', room: 3, studentId: '06630', firstName: 'ภูชล', lastName: 'วาณิชย์เจริญ' },
  { grade: 'ม.1', room: 3, studentId: '06606', firstName: 'เทพทัต', lastName: 'ทิพสอน' },
  { grade: 'ม.1', room: 3, studentId: '06609', firstName: 'ปฐมพร', lastName: 'จิระประดิษฐ์ผล' },
  { grade: 'ม.1', room: 3, studentId: '06611', firstName: 'พิมพ์ลภัส', lastName: 'หมื่นวัน' },
  { grade: 'ม.1', room: 3, studentId: '06615', firstName: 'ศิรินทิพย์', lastName: 'อ่องสอาด' },
  { grade: 'ม.1', room: 3, studentId: '06616', firstName: 'ปพิชยา', lastName: 'จันทองเดช' },
  { grade: 'ม.1', room: 3, studentId: '06618', firstName: 'ธมลวรรณ', lastName: 'เพชรเจริญ' },
  { grade: 'ม.1', room: 3, studentId: '06620', firstName: 'จิรัชญา', lastName: 'หนูแก้ว' },
  { grade: 'ม.1', room: 3, studentId: '06621', firstName: 'พลอยไพลิน', lastName: 'พึ่งปาน' },
  { grade: 'ม.1', room: 3, studentId: '06622', firstName: 'พลอยพิชชา', lastName: 'ศรีทองกุล' },
  { grade: 'ม.1', room: 3, studentId: '06623', firstName: 'สสิธร', lastName: 'บัวชื่น' },
  { grade: 'ม.1', room: 3, studentId: '06629', firstName: 'นันทิยา', lastName: 'คงปราณ' },
  { grade: 'ม.1', room: 3, studentId: '06634', firstName: 'มณีรัตน์', lastName: 'นิลพงศ์' },
  { grade: 'ม.1', room: 3, studentId: '06631', firstName: 'ญาณิศา', lastName: 'สุขสนิท' },

  // ม.1/4
  { grade: 'ม.1', room: 4, studentId: '06637', firstName: 'สิทธิกร', lastName: 'บุตรรักษา' },
  { grade: 'ม.1', room: 4, studentId: '06638', firstName: 'ญาณวุฒิ', lastName: 'ทิแก้ว' },
  { grade: 'ม.1', room: 4, studentId: '06641', firstName: 'ชิณวุฒิ', lastName: 'ช่วงชุณห์ส่อง' },
  { grade: 'ม.1', room: 4, studentId: '06642', firstName: 'อาทิตย์', lastName: 'คร้ามสมุทร' },
  { grade: 'ม.1', room: 4, studentId: '06643', firstName: 'ชาญวิทย์', lastName: 'ทองจันทร์' },
  { grade: 'ม.1', room: 4, studentId: '06644', firstName: 'ณัฐชนัน', lastName: 'ศรีทองกุล' },
  { grade: 'ม.1', room: 4, studentId: '06647', firstName: 'พนา', lastName: 'ศรีทองกุล' },
  { grade: 'ม.1', room: 4, studentId: '06649', firstName: 'ศิวกร', lastName: 'ห้งเขียบ' },
  { grade: 'ม.1', room: 4, studentId: '06653', firstName: 'โรจนภัส', lastName: 'ยอดราช' },
  { grade: 'ม.1', room: 4, studentId: '06655', firstName: 'พงษกร', lastName: 'พรหมชนะ' },
  { grade: 'ม.1', room: 4, studentId: '06656', firstName: 'นนทวัฒน์', lastName: 'มณีพงค์' },
  { grade: 'ม.1', room: 4, studentId: '06657', firstName: 'ภานุสรณ์', lastName: 'เจริญรูป' },
  { grade: 'ม.1', room: 4, studentId: '06658', firstName: 'ธนวิชญ์', lastName: 'อรแพทย์' },
  { grade: 'ม.1', room: 4, studentId: '06660', firstName: 'มงคล', lastName: 'บุญพันธ์' },
  { grade: 'ม.1', room: 4, studentId: '06661', firstName: 'กันตวิชญ์', lastName: 'พ่วงแสง' },
  { grade: 'ม.1', room: 4, studentId: '06663', firstName: 'ภานุพงษ์', lastName: 'ใหญ่ยิ่ง' },
  { grade: 'ม.1', room: 4, studentId: '06652', firstName: 'เอกพล', lastName: 'ฮั่นวิริยะนนท์' },
  { grade: 'ม.1', room: 4, studentId: '06650', firstName: 'อภิวัฒน์', lastName: 'พรหมณี' },
  { grade: 'ม.1', room: 4, studentId: '06648', firstName: 'ยุทธนา', lastName: 'พรหมเจริญ' },
  { grade: 'ม.1', room: 4, studentId: '06635', firstName: 'กมลชนก', lastName: 'เพิ่มพูล' },
  { grade: 'ม.1', room: 4, studentId: '06639', firstName: 'ศิริญาพร', lastName: 'น้ำพี้' },
  { grade: 'ม.1', room: 4, studentId: '06636', firstName: 'สุภะวรรณ', lastName: 'นอร์ริส' },
  { grade: 'ม.1', room: 4, studentId: '06640', firstName: 'อนันตพร', lastName: 'ชูช่วย' },
  { grade: 'ม.1', room: 4, studentId: '06646', firstName: 'นฤมล', lastName: 'รักชาติ' },
  { grade: 'ม.1', room: 4, studentId: '06651', firstName: 'กนกวรรณ', lastName: 'ทองเพชร' },
  { grade: 'ม.1', room: 4, studentId: '06654', firstName: 'เสาวนี', lastName: 'ภู่ไพบูลย์' },
  { grade: 'ม.1', room: 4, studentId: '06659', firstName: 'ภาคินี', lastName: 'ปัตถาติ' },
  { grade: 'ม.1', room: 4, studentId: '06662', firstName: 'กัญญพัชร', lastName: 'เฟือสุวรรณ' },
  { grade: 'ม.1', room: 4, studentId: '06645', firstName: 'พิมพ์ชนก', lastName: 'ล้มศักดิ์' },

  // ม.1/5
  { grade: 'ม.1', room: 5, studentId: '26670', firstName: 'ชวนนท์', lastName: 'ศรีทิพย์' },
  { grade: 'ม.1', room: 5, studentId: '06705', firstName: 'พรรค์ปคัณภ์', lastName: 'เงินเย็น' },
  { grade: 'ม.1', room: 5, studentId: '06666', firstName: 'จิตติพัฒน์', lastName: 'ไชยวาริน' },
  { grade: 'ม.1', room: 5, studentId: '06667', firstName: 'เกียรติศักดิ์', lastName: 'ธงชัย' },
  { grade: 'ม.1', room: 5, studentId: '06672', firstName: 'หัตถพุทธ', lastName: 'วารีวนิช' },
  { grade: 'ม.1', room: 5, studentId: '06673', firstName: 'ภูมิพัฒน์', lastName: 'ยานะนวล' },
  { grade: 'ม.1', room: 5, studentId: '06674', firstName: 'พัชรพล', lastName: 'ทองปน' },
  { grade: 'ม.1', room: 5, studentId: '06676', firstName: 'พงษกร', lastName: 'นุ่นแก้ว' },
  { grade: 'ม.1', room: 5, studentId: '06677', firstName: 'วีระศักดิ์', lastName: 'ทองนวล' },
  { grade: 'ม.1', room: 5, studentId: '06678', firstName: 'ภัทรชัย', lastName: 'ศรีเผือก' },
  { grade: 'ม.1', room: 5, studentId: '06684', firstName: 'นันทภัทร', lastName: 'สุวรรณโณ' },
  { grade: 'ม.1', room: 5, studentId: '06680', firstName: 'ณัฏฐวัฒน์', lastName: 'บรรดาศักดิ์' },
  { grade: 'ม.1', room: 5, studentId: '06681', firstName: 'ภูพิพัฒน์', lastName: 'ธรรมศรี' },
  { grade: 'ม.1', room: 5, studentId: '06682', firstName: 'พัสกร', lastName: 'สิงห์งอย' },
  { grade: 'ม.1', room: 5, studentId: '06685', firstName: 'สุทธิคราม', lastName: 'เพ็ชรพรม' },
  { grade: 'ม.1', room: 5, studentId: '06679', firstName: 'สิทธิชัย', lastName: 'โมร์จ' },
  { grade: 'ม.1', room: 5, studentId: '06671', firstName: 'เดชภูมินท์', lastName: 'กุลศรี' },
  { grade: 'ม.1', room: 5, studentId: '06668', firstName: 'ภัสรพงศ์', lastName: 'เกื้อสกุล' },
  { grade: 'ม.1', room: 5, studentId: '06720', firstName: 'ธาราวดี', lastName: 'หอแก้ว' },
  { grade: 'ม.1', room: 5, studentId: '06710', firstName: 'สรัลพร', lastName: 'ธรรมสวัสดิ์' },
  { grade: 'ม.1', room: 5, studentId: '06664', firstName: 'อาริยา', lastName: 'ใจรังษี' },
  { grade: 'ม.1', room: 5, studentId: '06665', firstName: 'พิยดา', lastName: 'ชัยพล' },
  { grade: 'ม.1', room: 5, studentId: '06669', firstName: 'เมย์ ซู', lastName: 'เจซซาด' },
  { grade: 'ม.1', room: 5, studentId: '06675', firstName: 'เกตน์นิภา', lastName: 'แซ่ตัง' },
  { grade: 'ม.1', room: 5, studentId: '06687', firstName: 'ญารวี', lastName: 'แสงศรี' },
  { grade: 'ม.1', room: 5, studentId: '06683', firstName: 'ทิพวรรณ', lastName: 'ท่อนสัน' },
  { grade: 'ม.1', room: 5, studentId: '06686', firstName: 'เชลซี', lastName: 'คาร์' },
  { grade: 'ม.1', room: 5, studentId: '06722', firstName: 'ปาณิสรา', lastName: 'ใจมั่น' },
  { grade: 'ม.1', room: 5, studentId: '06761', firstName: 'อุษา', lastName: '-' },
  { grade: 'ม.1', room: 5, studentId: '06731', firstName: 'สุทัตตา', lastName: 'จันโท' },
  { grade: 'ม.1', room: 5, studentId: '06733', firstName: 'ตุลยดา', lastName: 'อนุอินทร์' },
  { grade: 'ม.1', room: 5, studentId: '06727', firstName: 'กรกันยา', lastName: 'พรหมเจริญ' },
  { grade: 'ม.1', room: 5, studentId: '06726', firstName: 'วรดา', lastName: 'ศรีกล่ำ' },
  { grade: 'ม.1', room: 5, studentId: '06734', firstName: 'สุปวีณ์', lastName: 'ฝางเกตุ' },

  // ม.2/1
  { grade: 'ม.2', room: 1, studentId: '06330', firstName: 'ธนพัฒน์', lastName: 'อารีรักษ์' },
  { grade: 'ม.2', room: 1, studentId: '06332', firstName: 'สรายุทธ', lastName: 'โคตรพันธ์' },
  { grade: 'ม.2', room: 1, studentId: '06339', firstName: 'ธนภัทร', lastName: 'ทองทรัพย์' },
  { grade: 'ม.2', room: 1, studentId: '06341', firstName: 'วายุ', lastName: 'สิทธยางกูร' },
  { grade: 'ม.2', room: 1, studentId: '06346', firstName: 'ณรงค์ฤทธิ์', lastName: 'ลิ้มสุวรรณ' },
  { grade: 'ม.2', room: 1, studentId: '06355', firstName: 'บัณฑวิชญ์', lastName: 'บรูน' },
  { grade: 'ม.2', room: 1, studentId: '06358', firstName: 'วีรภัทร', lastName: 'หมั่นคง' },
  { grade: 'ม.2', room: 1, studentId: '06331', firstName: 'ชยุต', lastName: 'เพ็ญพริ้ง' },
  { grade: 'ม.2', room: 1, studentId: '06334', firstName: 'กิตติกร', lastName: 'ฤทธิกัน' },
  { grade: 'ม.2', room: 1, studentId: '06353', firstName: 'พงศกร', lastName: 'เถาว์รินทร์' },
  { grade: 'ม.2', room: 1, studentId: '06336', firstName: 'พิริยะ', lastName: 'พรหมเดช' },
  { grade: 'ม.2', room: 1, studentId: '06340', firstName: 'สิทธิพงศ์', lastName: 'เนตรรักษ์' },
  { grade: 'ม.2', room: 1, studentId: '06333', firstName: 'พรทิพย์', lastName: 'พลคุ้ม' },
  { grade: 'ม.2', room: 1, studentId: '06335', firstName: 'ภัทรวรรณ', lastName: 'ไล้สม' },
  { grade: 'ม.2', room: 1, studentId: '06338', firstName: 'นภัสสร', lastName: 'เขียวแต้ม' },
  { grade: 'ม.2', room: 1, studentId: '06345', firstName: 'ลลิตภัทร', lastName: 'เรืองโรจน์' },
  { grade: 'ม.2', room: 1, studentId: '06347', firstName: 'สุวพิชญ์', lastName: 'บุญประเสริฐ' },
  { grade: 'ม.2', room: 1, studentId: '06348', firstName: 'ณิชารัชต์', lastName: 'โสมล' },
  { grade: 'ม.2', room: 1, studentId: '06351', firstName: 'วริษฐา', lastName: 'รักษ์แดง' },
  { grade: 'ม.2', room: 1, studentId: '06352', firstName: 'สุวิมล', lastName: 'ภูสง่า' },
  { grade: 'ม.2', room: 1, studentId: '06356', firstName: 'นันท์นภัส', lastName: 'หนูนวล' },
  { grade: 'ม.2', room: 1, studentId: '06357', firstName: 'สิริภักดิ์', lastName: 'ชุมแดง' },
  { grade: 'ม.2', room: 1, studentId: '06329', firstName: 'วิปัญญา', lastName: 'ทะทำมัง' },
  { grade: 'ม.2', room: 1, studentId: '06337', firstName: 'ณัฏฐณิชา', lastName: 'สุวรรณสังข์' },
  { grade: 'ม.2', room: 1, studentId: '06342', firstName: 'ทักษอร', lastName: 'สุทธิ์ทอง' },
  { grade: 'ม.2', room: 1, studentId: '06343', firstName: 'พิมพ์ระวี', lastName: 'เตชะนนท์' },
  { grade: 'ม.2', room: 1, studentId: '06344', firstName: 'ภัทราพร', lastName: 'โชคคณาพิทักษ์' },
  { grade: 'ม.2', room: 1, studentId: '06350', firstName: 'เกวลิน', lastName: 'เกื้อสกุล' },
  { grade: 'ม.2', room: 1, studentId: '06349', firstName: 'ญานิศา', lastName: 'ทิพย์หมัด' },

  // ม.2/2
  { grade: 'ม.2', room: 2, studentId: '06394', firstName: 'อดิศร', lastName: 'เข็มต้น' },
  { grade: 'ม.2', room: 2, studentId: '06392', firstName: 'อดิเทพ', lastName: 'พรหมจินดา' },
  { grade: 'ม.2', room: 2, studentId: '06378', firstName: 'ธนรัช', lastName: 'ธนวนิชนาม' },
  { grade: 'ม.2', room: 2, studentId: '06377', firstName: 'ธนนันท์', lastName: 'ตามขมิ้น' },
  { grade: 'ม.2', room: 2, studentId: '06372', firstName: 'ณัฐพงค์', lastName: 'สุขเกษม' },
  { grade: 'ม.2', room: 2, studentId: '06369', firstName: 'ธนวัฒน์', lastName: 'บัวชื่น' },
  { grade: 'ม.2', room: 2, studentId: '06365', firstName: 'ธนกูล', lastName: 'บุญไสย' },
  { grade: 'ม.2', room: 2, studentId: '06359', firstName: 'นฤเบศร์', lastName: 'ศรีพรหมวรรณ' },
  { grade: 'ม.2', room: 2, studentId: '06360', firstName: 'สหรัฐ', lastName: 'ครึกครื้นจิตร์' },
  { grade: 'ม.2', room: 2, studentId: '06393', firstName: 'ณัฐพงษ์', lastName: 'พิมเสน' },
  { grade: 'ม.2', room: 2, studentId: '06416', firstName: 'ณัฐสุต', lastName: 'สิมขาว' },
  { grade: 'ม.2', room: 2, studentId: '06370', firstName: 'พชรพล', lastName: 'รัตนะพงศ์' },
  { grade: 'ม.2', room: 2, studentId: '06438', firstName: 'คฑาวุธ', lastName: 'นาคสวัสดิ์' },
  { grade: 'ม.2', room: 2, studentId: '06445', firstName: 'ภูมิพัฒศาสน์', lastName: 'บุษยะชีวิน' },
  { grade: 'ม.2', room: 2, studentId: '06390', firstName: 'รุ่งไพลิน', lastName: 'ถาวรมาศ' },
  { grade: 'ม.2', room: 2, studentId: '06388', firstName: 'ปลิวลดา', lastName: 'สุวรรณพันธ์' },
  { grade: 'ม.2', room: 2, studentId: '06387', firstName: 'นัยนา', lastName: 'สงสวัสดิ์' },
  { grade: 'ม.2', room: 2, studentId: '06384', firstName: 'ศศิราพร', lastName: 'ดาวรัตน์' },
  { grade: 'ม.2', room: 2, studentId: '06381', firstName: 'กิติยา', lastName: 'ยอดดี' },
  { grade: 'ม.2', room: 2, studentId: '06376', firstName: 'กฤตยาณี', lastName: 'ทองศรีเกตุ' },
  { grade: 'ม.2', room: 2, studentId: '06375', firstName: 'ดวงกมล', lastName: 'สุขมา' },
  { grade: 'ม.2', room: 2, studentId: '06373', firstName: 'วรรดิตา', lastName: 'หาญพนม' },
  { grade: 'ม.2', room: 2, studentId: '06366', firstName: 'บุณยพร', lastName: 'เรืองศรี' },
  { grade: 'ม.2', room: 2, studentId: '06361', firstName: 'อัจจิมา', lastName: 'เทย์เลอร์' },
  { grade: 'ม.2', room: 2, studentId: '06362', firstName: 'ดวงกมล', lastName: 'ไชมน' },
  { grade: 'ม.2', room: 2, studentId: '06364', firstName: 'กัญญาภัทร', lastName: 'คงปล้อง' },
  { grade: 'ม.2', room: 2, studentId: '06404', firstName: 'อรฤทัย', lastName: 'จันลาย' },
  { grade: 'ม.2', room: 2, studentId: '06368', firstName: 'ปภาวรินทร์', lastName: 'ไกรวงค์' },
  { grade: 'ม.2', room: 2, studentId: '06401', firstName: 'ญาตินันท์', lastName: 'แสนคำ' },
  { grade: 'ม.2', room: 2, studentId: '06408', firstName: 'ปภาดา', lastName: 'นาทันริ' },
  { grade: 'ม.2', room: 2, studentId: '06399', firstName: 'มณีกรณ์', lastName: 'แซ่อึ้ง' },
  { grade: 'ม.2', room: 2, studentId: '06379', firstName: 'พิมพกานต์', lastName: 'เกื้อสกุล' },
  { grade: 'ม.2', room: 2, studentId: '06367', firstName: 'รุ่งนภา', lastName: 'พิมงาม' },

  // ม.2/3
  { grade: 'ม.2', room: 3, studentId: '06386', firstName: 'กันติทัต', lastName: 'เพชรอาวุธ' },
  { grade: 'ม.2', room: 3, studentId: '06382', firstName: 'แฮรรี่', lastName: 'ไวน์เบอร์ท' },
  { grade: 'ม.2', room: 3, studentId: '06380', firstName: 'อดิศร', lastName: 'คุ้มรัตน์' },
  { grade: 'ม.2', room: 3, studentId: '06363', firstName: 'ธีรเดช', lastName: 'เทียนทอง' },
  { grade: 'ม.2', room: 3, studentId: '06410', firstName: 'ภานุมาส', lastName: 'แก้วกันรัตน์' },
  { grade: 'ม.2', room: 3, studentId: '06420', firstName: 'ทิฮา ซอว์', lastName: 'ไม่มีนามสกุล' },
  { grade: 'ม.2', room: 3, studentId: '06425', firstName: 'ธวัชชัย', lastName: 'พูลสวัสดิ์' },
  { grade: 'ม.2', room: 3, studentId: '06428', firstName: 'สุรเดช', lastName: 'เครือโสม' },
  { grade: 'ม.2', room: 3, studentId: '06505', firstName: 'ภัทรพล', lastName: 'อิทธิอนันต์กุล' },
  { grade: 'ม.2', room: 3, studentId: '06411', firstName: 'อดิเทพ', lastName: 'ลัมศักดิ์' },
  { grade: 'ม.2', room: 3, studentId: '06406', firstName: 'จิรทีปต์', lastName: 'พุทเส้ง' },
  { grade: 'ม.2', room: 3, studentId: '06436', firstName: 'อัสนี', lastName: 'พรมมานอก' },
  { grade: 'ม.2', room: 3, studentId: '06444', firstName: 'วรวุฒิ', lastName: 'พรหมจารย์' },
  { grade: 'ม.2', room: 3, studentId: '06447', firstName: 'คุณากร', lastName: 'สองเมือง' },
  { grade: 'ม.2', room: 3, studentId: '06449', firstName: 'ชนวีร์', lastName: 'ยืนนาน' },
  { grade: 'ม.2', room: 3, studentId: '06452', firstName: 'จตุรงค์', lastName: 'คงปล้อง' },
  { grade: 'ม.2', room: 3, studentId: '06458', firstName: 'มาร์ซซิโม่', lastName: 'มาร์ซ็อคคี' },
  { grade: 'ม.2', room: 3, studentId: '06461', firstName: 'จักริน', lastName: 'เรืองจันทร์' },
  { grade: 'ม.2', room: 3, studentId: '06414', firstName: 'ณเดช', lastName: 'ไม่ปรากฏนามสกุล' },
  { grade: 'ม.2', room: 3, studentId: '06395', firstName: 'ชญานิษฐ์', lastName: 'คงปล้อง' },
  { grade: 'ม.2', room: 3, studentId: '06391', firstName: 'พริมพิชา', lastName: 'สุตมา' },
  { grade: 'ม.2', room: 3, studentId: '06398', firstName: 'กนกขวัญ', lastName: 'ห่อวุ้น' },
  { grade: 'ม.2', room: 3, studentId: '06396', firstName: 'โสรยา', lastName: 'ผลประดิษฐ์' },
  { grade: 'ม.2', room: 3, studentId: '06400', firstName: 'กัณฐมณี', lastName: 'สำราญสิทธิ์' },
  { grade: 'ม.2', room: 3, studentId: '06402', firstName: 'วิรุณรัตน์', lastName: 'สังขวิศิษฐ์' },
  { grade: 'ม.2', room: 3, studentId: '06403', firstName: 'กชกร', lastName: 'เหล็กผา' },
  { grade: 'ม.2', room: 3, studentId: '06405', firstName: 'นฤมล', lastName: 'วัฒนปักษ์' },
  { grade: 'ม.2', room: 3, studentId: '06415', firstName: 'จิรัชยา', lastName: 'ชิตเพชร' },
  { grade: 'ม.2', room: 3, studentId: '06417', firstName: 'สุรัสวดี', lastName: 'โพธิปิยาวรรณ' },
  { grade: 'ม.2', room: 3, studentId: '06419', firstName: 'พฤกษา', lastName: 'ธนวนิชนาม' },
  { grade: 'ม.2', room: 3, studentId: '06422', firstName: 'ปิ่นทิพย์', lastName: 'คำดวง' },
  { grade: 'ม.2', room: 3, studentId: '06424', firstName: 'กัญญารัตน์', lastName: 'ฮั่นวิริยะนนท์' },
  { grade: 'ม.2', room: 3, studentId: '06430', firstName: 'วริศรา', lastName: 'สุขอนันต์' },
  { grade: 'ม.2', room: 3, studentId: '06397', firstName: 'ชาลิสา อัลลียาห์', lastName: 'ออร์วิน' },

  // ม.2/4
  { grade: 'ม.2', room: 4, studentId: '06385', firstName: 'สิริชัย', lastName: 'ช่วยฤกษ์' },
  { grade: 'ม.2', room: 4, studentId: '06374', firstName: 'สุกฤตา', lastName: 'รัตนรักษ์' },
  { grade: 'ม.2', room: 4, studentId: '06409', firstName: 'ฌเณศ', lastName: 'ยงยุทธ' },
  { grade: 'ม.2', room: 4, studentId: '06412', firstName: 'รสานนท์', lastName: 'ขวัญราช' },
  { grade: 'ม.2', room: 4, studentId: '06421', firstName: 'ภูมิภัทร', lastName: 'ชูกลิ่น' },
  { grade: 'ม.2', room: 4, studentId: '06483', firstName: 'ณันธวัฒน์', lastName: 'ศรีชนะ' },
  { grade: 'ม.2', room: 4, studentId: '06427', firstName: 'ประภัสส์รพงษ์', lastName: 'จันทร์สน' },
  { grade: 'ม.2', room: 4, studentId: '06413', firstName: 'ปุณณวิช', lastName: 'แหวนหรุ่น' },
  { grade: 'ม.2', room: 4, studentId: '06418', firstName: 'สิทธิพล', lastName: 'สายสุวรรณ์' },
  { grade: 'ม.2', room: 4, studentId: '06433', firstName: 'ศิวรินทร์', lastName: 'ชูสุวรรณ' },
  { grade: 'ม.2', room: 4, studentId: '06432', firstName: 'นริศ', lastName: 'พินพันธ์ุ' },
  { grade: 'ม.2', room: 4, studentId: '06435', firstName: 'ชัยธวัช', lastName: 'หนูรักษ์' },
  { grade: 'ม.2', room: 4, studentId: '06439', firstName: 'ธนภัทร', lastName: 'เกื้อสกุล' },
  { grade: 'ม.2', room: 4, studentId: '06443', firstName: 'ธวัชชัย', lastName: 'บัวสมุย' },
  { grade: 'ม.2', room: 4, studentId: '06446', firstName: 'ปวีณ', lastName: 'ไกรสตรี' },
  { grade: 'ม.2', room: 4, studentId: '06451', firstName: 'ภาคภูมิ', lastName: 'จันทร์สถิต' },
  { grade: 'ม.2', room: 4, studentId: '06454', firstName: 'สุพงศ์ธัช', lastName: 'โชตวัน' },
  { grade: 'ม.2', room: 4, studentId: '06455', firstName: 'อนาวินทร์', lastName: 'พรมทัน' },
  { grade: 'ม.2', room: 4, studentId: '06456', firstName: 'สุรชาติ', lastName: 'พูลสวัสดิ์' },
  { grade: 'ม.2', room: 4, studentId: '06457', firstName: 'อภิเชษฐ์', lastName: 'เกื้อสกุล' },
  { grade: 'ม.2', room: 4, studentId: '06462', firstName: 'ณัฐพงศ์', lastName: 'ภาคน้อย' },
  { grade: 'ม.2', room: 4, studentId: '06464', firstName: 'ภูริวัฒน์', lastName: 'ดุจจานุทัศน์' },
  { grade: 'ม.2', room: 4, studentId: '06429', firstName: 'อนันญา', lastName: 'นอกกระโทก' },
  { grade: 'ม.2', room: 4, studentId: '06431', firstName: 'จิราพร', lastName: 'ขุนรักษ์' },
  { grade: 'ม.2', room: 4, studentId: '06434', firstName: 'ณฐพร', lastName: 'สีชมภู' },
  { grade: 'ม.2', room: 4, studentId: '06437', firstName: 'พัชราภา', lastName: 'กลไกล' },
  { grade: 'ม.2', room: 4, studentId: '06440', firstName: 'กาญ่า', lastName: 'บูเกียริ' },
  { grade: 'ม.2', room: 4, studentId: '06442', firstName: 'นนทพร', lastName: 'ตุ้มทอง' },
  { grade: 'ม.2', room: 4, studentId: '06450', firstName: 'ณัฎฐยาวรรณ', lastName: 'ของดี' },
  { grade: 'ม.2', room: 4, studentId: '06453', firstName: 'อันธิกา', lastName: 'ทองศรีเกตุ' },
  { grade: 'ม.2', room: 4, studentId: '06459', firstName: 'พิชญาภา', lastName: 'ชูราช' },
  { grade: 'ม.2', room: 4, studentId: '06460', firstName: 'นันท์ชญาน์', lastName: 'ศรีทองกุล' },
  { grade: 'ม.2', room: 4, studentId: '06463', firstName: 'พิชญาภา', lastName: 'พยัคฆ์ฤทธิ์' },

  // ม.2/5
  { grade: 'ม.2', room: 5, studentId: '06423', firstName: 'เจษฎา', lastName: 'ยังนึก' },
  { grade: 'ม.2', room: 5, studentId: '06513', firstName: 'วิทรัตน์', lastName: 'จันทะคำแพง' },
  { grade: 'ม.2', room: 5, studentId: '06465', firstName: 'ทัศกร', lastName: 'อุดมรัตน์' },
  { grade: 'ม.2', room: 5, studentId: '06466', firstName: 'ยิ่งยศ', lastName: 'เมืองทอง' },
  { grade: 'ม.2', room: 5, studentId: '06467', firstName: 'สุรเดช', lastName: 'วีแก้ว' },
  { grade: 'ม.2', room: 5, studentId: '06477', firstName: 'ภาณุพงศ์', lastName: 'สุขเกษม' },
  { grade: 'ม.2', room: 5, studentId: '06475', firstName: 'อธิวัฒน์', lastName: 'หมั่นคง' },
  { grade: 'ม.2', room: 5, studentId: '06471', firstName: 'นนทฤกษ์', lastName: 'แซ่ด่าน' },
  { grade: 'ม.2', room: 5, studentId: '06480', firstName: 'วรากร', lastName: 'แซ่ขวย' },
  { grade: 'ม.2', room: 5, studentId: '06481', firstName: 'ธีราวัฒน์', lastName: 'ลอยพรม' },
  { grade: 'ม.2', room: 5, studentId: '06482', firstName: 'รัชตะ', lastName: 'จีนไทย' },
  { grade: 'ม.2', room: 5, studentId: '06484', firstName: 'กิจติพงษ์', lastName: 'เที่ยงทัด' },
  { grade: 'ม.2', room: 5, studentId: '06473', firstName: 'อนุภัทร', lastName: 'รักขะนาม' },
  { grade: 'ม.2', room: 5, studentId: '06485', firstName: 'รพีภัทร', lastName: 'ถาวระ' },
  { grade: 'ม.2', room: 5, studentId: '06486', firstName: 'เมธาสิทธิ์', lastName: 'มะโร' },
  { grade: 'ม.2', room: 5, studentId: '06469', firstName: 'ณัฐพงศ์', lastName: 'ศรีทองกุล' },
  { grade: 'ม.2', room: 5, studentId: '06476', firstName: 'อรรถพล', lastName: 'โกดี' },
  { grade: 'ม.2', room: 5, studentId: '06531', firstName: 'วาทิตต์', lastName: 'อินทร์ทอง' },
  { grade: 'ม.2', room: 5, studentId: '06532', firstName: 'เอกราช', lastName: 'อ่อนประทุม' },
  { grade: 'ม.2', room: 5, studentId: '06708', firstName: 'ธนดล', lastName: 'ศิริศักดิ์วัฒนา' },
  { grade: 'ม.2', room: 5, studentId: '06169', firstName: 'เจา', lastName: 'อานุก' },
  { grade: 'ม.2', room: 5, studentId: '06709', firstName: 'ภาณุวัฒน์', lastName: 'เทศนอก' },
  { grade: 'ม.2', room: 5, studentId: '06707', firstName: 'ปฏวี', lastName: 'สาสอน' },
  { grade: 'ม.2', room: 5, studentId: '06732', firstName: 'ยศพล', lastName: 'บรรจงเมือง' },
  { grade: 'ม.2', room: 5, studentId: '06191', firstName: 'สุภาพร', lastName: 'นาสวัสดิ์' },
  { grade: 'ม.2', room: 5, studentId: '06524', firstName: 'กัญญดา', lastName: 'รื่นหอม' },
  { grade: 'ม.2', room: 5, studentId: '06468', firstName: 'ปราณปรียา', lastName: 'กระนิระพันธ์' },
  { grade: 'ม.2', room: 5, studentId: '06478', firstName: 'พอลล่า', lastName: 'ลี' },
  { grade: 'ม.2', room: 5, studentId: '06479', firstName: 'ณัฐชยา', lastName: 'บำรุงศรี' },
  { grade: 'ม.2', room: 5, studentId: '06472', firstName: 'เบญญาภา', lastName: 'เผ่าอินจันทร์' },
  { grade: 'ม.2', room: 5, studentId: '06474', firstName: 'เมธาวี', lastName: 'ช้างนรินทร์' },
  { grade: 'ม.2', room: 5, studentId: '06448', firstName: 'มยุรฉัตร', lastName: 'บุญรอด' },
  { grade: 'ม.2', room: 5, studentId: '06714', firstName: 'ศศิประภา', lastName: 'แซ่โส้ว' },
  { grade: 'ม.2', room: 5, studentId: '06697', firstName: 'สิริรัตน์', lastName: 'อินทร์แก้ว' },
  { grade: 'ม.2', room: 5, studentId: '06696', firstName: 'กันต์ธรา', lastName: 'คชายนต์' },
  { grade: 'ม.2', room: 5, studentId: '06700', firstName: 'ศศิวิมล', lastName: 'ชินวงค์' },
  { grade: 'ม.2', room: 5, studentId: '06706', firstName: 'วิไลวรรณ', lastName: 'พิทักษา' },
  { grade: 'ม.2', room: 5, studentId: '06717', firstName: 'พิชญาภา', lastName: 'เลิศล้ำ' },
  { grade: 'ม.2', room: 5, studentId: '06719', firstName: 'พิชญา', lastName: 'นาชะนาง' },
  { grade: 'ม.2', room: 5, studentId: '06713', firstName: 'รุฮานีย์', lastName: 'สุขเดโช' },
  { grade: 'ม.2', room: 5, studentId: '06354', firstName: 'ธัญญภัสร์', lastName: 'ปาปะนัย' },
];

/**
 * ฟังก์ชันแปลงรหัสให้มี 0 นำหน้า 5 หลัก
 */
function formatStudentId(id: string): string {
  // ลบตัวเลขที่ไม่ใช่ตัวเลข
  const numOnly = id.replace(/[^0-9]/g, '');
  // เติมศูนย์นำหน้า
  return numOnly.padStart(5, '0');
}

async function importAllStudents() {
  try {
    console.log('📥 กำลังนำเข้าข้อมูลนักเรียนทั้งหมด...\n');

    let successCount = 0;
    let updateCount = 0;
    let errorCount = 0;

    // ประมวลผลข้อมูลแต่ละคน
    for (const student of allStudentsData) {
      const classCode = `${student.grade}/${student.room}`;
      const formattedStudentId = formatStudentId(student.studentId);

      try {
        // ตรวจสอบว่ามีนักเรียนคนนี้อยู่แล้วหรือไม่
        const existing = await db.execute({
          sql: 'SELECT id FROM users WHERE first_name = ? AND last_name = ? AND class_code = ?',
          args: [student.firstName, student.lastName, classCode]
        });

        if (existing.rows.length > 0) {
          // อัปเดตรหัสนักเรียน
          const userId = Number(existing.rows[0].id);
          await db.execute({
            sql: 'UPDATE users SET student_id = ? WHERE id = ?',
            args: [formattedStudentId, userId]
          });
          updateCount++;
        } else {
          // สร้างนักเรียนใหม่
          await db.execute({
            sql: 'INSERT INTO users (first_name, last_name, student_id, class_code, password_hash, created_at) VALUES (?, ?, ?, ?, ?, ?)',
            args: [
              student.firstName,
              student.lastName,
              formattedStudentId,
              classCode,
              'temp_hash',
              new Date().toISOString()
            ]
          });
          successCount++;
        }

        // แสดงความคืบหน้าทุก 50 คน
        const total = successCount + updateCount;
        if (total % 50 === 0) {
          console.log(`✓ ประมวลผลแล้ว ${total} คน...`);
        }
      } catch (err: any) {
        errorCount++;
        console.log(`❌ ${student.firstName} ${student.lastName}: ${err.message}`);
      }
    }

    console.log(`\n✅ เสร็จสิ้น:`);
    console.log(`   ➕ เพิ่มใหม่: ${successCount} คน`);
    console.log(`   ✏️  อัปเดต: ${updateCount} คน`);
    console.log(`   ❌ ข้อผิดพลาด: ${errorCount} คน`);
    console.log(`   📊 รวม: ${successCount + updateCount + errorCount} คน`);
  } catch (err) {
    console.error('❌ ข้อผิดพลาดร้ายแรง:', err);
    process.exit(1);
  }
}

// รันสคริปต์
importAllStudents().then(() => {
  process.exit(0);
});
