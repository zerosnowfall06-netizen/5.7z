# MemeLab — แบบฝึกหัด 5.7 การเขียนโค้ด Vibe

เว็บแอป React + Vite สำหรับสร้าง Meme โดยใช้ HTML Canvas และ jsPDF ออกแบบให้ใช้งานด้วยเมาส์ได้จริง

## 1. สิ่งที่ต้องติดตั้ง

- **Node.js** เวอร์ชัน 20.19 ขึ้นไป หรือ 22.12 ขึ้นไป (แนะนำรุ่น LTS ใหม่)
- **Visual Studio Code**
- Git (สำหรับทำ branch / merge / ส่ง GitHub)

ตรวจสอบใน Terminal:

```bash
node -v
npm -v
git --version
```

## 2. วิธีเปิดโปรเจกต์บน Windows

1. แตก ZIP แล้วเปิดโฟลเดอร์ `meme-editor-react` ด้วย VS Code (`File > Open Folder`)
2. เลือก `Terminal > New Terminal`
3. พิมพ์คำสั่ง:

```bash
npm install
npm run dev
```

4. เปิดลิงก์ที่แสดงใน Terminal (โดยทั่วไป `http://localhost:5173`)

> ถ้า PowerShell ห้ามเรียก npm.ps1 ให้เปิด Terminal แบบ **Command Prompt** หรือใช้ `npm.cmd install` และ `npm.cmd run dev` แทน

## 3. วิธีใช้งาน

1. **Images** — เลือกพื้นหลังสีสำเร็จรูปหรือ Upload รูป JPG/PNG/WebP/GIF (GIF จะแสดงเฟรมแรก)
2. **Text** — กด `Add new text`, คลิกข้อความ แล้วแก้ไขเนื้อหา สี ฟอนต์ ขนาด และเส้นขอบ
3. **Stickers** — คลิก emoji ที่ต้องการ จากนั้นลากบนภาพ
4. **Filters** — ปรับ Brightness / Contrast / Saturation / Grayscale / Sepia สำหรับรูปที่อัปโหลด
5. **Layers** — คลิกชั้นที่ต้องการ เลื่อนขึ้นลง ทำสำเนา หรือลบ
6. เมื่อเลือกข้อความ/emoji สามารถแก้ไข Size, Opacity, Rotation ที่แถบด้านล่าง
7. Undo / Redo — ปุ่มมุมขวาบนของพื้นที่ทำงาน หรือกด `Ctrl+Z` / `Ctrl+Y`
8. Export PNG/PDF — ใช้ปุ่มในแถบ Export แล้วไฟล์จะดาวน์โหลดลงเครื่อง

**หมายเหตุ:** ระบบนี้เป็น editor ในเบราว์เซอร์ ไม่มี backend; การเปลี่ยนแปลงจะหายเมื่อรีเฟรชหน้า จึงควร Export ผลงานก่อนออกจากหน้า โปรแกรมไม่อัปโหลดรูปไปยังเซิร์ฟเวอร์ รองรับภาพสูงสุด 12 MB

## 4. ขั้นตอน Git Branch และ Merge ตามโจทย์

เรียกคำสั่งในโฟลเดอร์โปรเจกต์:

```bash
git init
git add .
git commit -m "Initial React Meme Editor"
git branch -M main

git checkout -b feature/meme-tools
# ทดลองแก้โค้ด เช่น ข้อความ title ใน src/App.jsx หรือ CSS แล้วบันทึก
git add .
git commit -m "Improve meme editor UI"

git checkout main
git merge feature/meme-tools
```

ตรวจสอบผล:

```bash
git log --oneline --graph --all
git branch
npm run build
```

สร้าง **repository ว่าง** ใน GitHub ก่อน (ไม่ต้องเลือกสร้าง README เพิ่ม) แล้วเปลี่ยน `YOUR_USERNAME` และ `YOUR_REPO`:

```bash
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
git push -u origin feature/meme-tools
```

ส่งลิงก์ `https://github.com/YOUR_USERNAME/YOUR_REPO` ในระบบส่งงาน

**สำคัญ:** คำสั่ง Git ข้างบนเป็นตัวอย่างการทำด้วยตัวเอง; ZIP ที่ให้ยังไม่ได้สร้าง repository บน GitHub ของผู้เรียน และยังไม่ได้ทำ branch จริง

## 5. ตรวจเช็กก่อนส่งงาน

- [ ] เพิ่มและลากข้อความได้
- [ ] เปลี่ยนฟอนต์ ขนาด สี ความโปร่งใส และเส้นขอบได้
- [ ] เพิ่ม emoji และหมุนสติกเกอร์ได้
- [ ] อัปโหลดภาพและเปลี่ยนพื้นหลังได้
- [ ] ปรับฟิลเตอร์ได้
- [ ] เปลี่ยนลำดับเลเยอร์และทำสำเนาได้
- [ ] Undo / Redo ได้
- [ ] ดาวน์โหลด PNG และ PDF ได้
- [ ] `npm run build` ผ่าน
- [ ] ทำ Git branch และ merge สำเร็จ
- [ ] Push ขึ้น GitHub และส่ง URL

## 6. โครงสร้างไฟล์

```
meme-editor-react/
├── index.html
├── package.json
├── vite.config.js
├── .gitignore
├── README.md
└── src/
    ├── main.jsx
    ├── App.jsx
    └── styles.css
```
