# Deployment Guide - KSS Connect

คำแนะนำการ Deploy ระบบ KSS Connect ไปยัง Vercel

## Prerequisites

- GitHub account
- Vercel account (เชื่อมต่อกับ GitHub)
- Turso account (สำหรับ database) - https://turso.tech
- (Optional) Groq API Key สำหรับ AI Chatbot

## Step 1: Create Turso Database

### 1.1 Sign up / Login to Turso

1. ไปที่ https://turso.tech
2. สร้างบัญชีหรือ login

### 1.2 Create Database

```bash
# Install Turso CLI (Windows - use WSL or npm)
npm install -g @turso/cli

# Login
turso auth login

# Create database
turso db create kss-connect

# Get database URL
turso db show kss-connect --url
# Output: libsql://kss-connect-yourname.turso.io

# Create auth token
turso db tokens create kss-connect
# Output: your-auth-token
```

หรือผ่าน Web Dashboard:
1. ไปที่ https://app.turso.tech
2. Click "Create Database"
3. ตั้งชื่อ `kss-connect`
4. Copy Database URL และสร้าง Auth Token

## Step 2: Prepare Repository

### 2.1 Create GitHub Repository

```bash
cd path/to/kss-connect
git init
git add .
git commit -m "Initial commit - KSS Connect"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/kss-connect.git
git push -u origin main
```

### 2.2 Verify .gitignore

ตรวจสอบว่า `.gitignore` มีการตั้งค่าแล้ว:

```
.next/
node_modules/
.env.local
.env.*.local
*.log
data/*.db
```

## Step 3: Deploy to Vercel

### 3.1 Via Web Interface

1. ไปที่ https://vercel.com/dashboard
2. Click "Add New..." → "Project"
3. Import GitHub Repository
4. เลือก `kss-connect` repository
5. ตั้งค่า Environment Variables:

   | Variable | Value | Required |
   |----------|-------|----------|
   | `TURSO_DATABASE_URL` | `libsql://kss-connect-xxx.turso.io` | ✅ Yes |
   | `TURSO_AUTH_TOKEN` | `your-auth-token` | ✅ Yes |
   | `GROQ_API_KEY` | `your-groq-api-key` | Optional |

6. Click "Deploy"

### 3.2 Via Vercel CLI

```bash
npm install -g vercel
vercel login

# Set environment variables
vercel env add TURSO_DATABASE_URL
vercel env add TURSO_AUTH_TOKEN
vercel env add GROQ_API_KEY

# Deploy
vercel --prod
```

## Step 4: Initialize Database

Database schema จะถูกสร้างโดยอัตโนมัติเมื่อมีการเรียก API ครั้งแรก

## Step 5: Create Admin Account

ไปที่ `/create-admin.html` บน deployed app:

```
https://your-domain.vercel.app/create-admin.html
```

กรอกข้อมูลเพื่อสร้าง Admin account แรก

## Local Development

### Setup

```bash
# Clone repository
git clone https://github.com/YOUR_USERNAME/kss-connect.git
cd kss-connect

# Install dependencies
npm install

# Create .env.local for local development
cp .env.example .env.local
```

### Local Database (SQLite)

สำหรับ development ไม่ต้องตั้งค่า Turso - ระบบจะใช้ SQLite file อัตโนมัติ:

```env
# .env.local (leave empty for local SQLite)
# TURSO_DATABASE_URL=
# TURSO_AUTH_TOKEN=
```

### Run Development Server

```bash
npm run dev
```

เข้าถึงที่ http://localhost:3000

## Environment Variables

| Variable | Local Dev | Production | Description |
|----------|-----------|------------|-------------|
| `TURSO_DATABASE_URL` | ไม่ต้องการ | Required | Turso database URL |
| `TURSO_AUTH_TOKEN` | ไม่ต้องการ | Required | Turso auth token |
| `GROQ_API_KEY` | Optional | Optional | For AI chatbot |

## Architecture

### Database

- **Local**: SQLite file (`data/kss.db`)
- **Production**: Turso (libSQL - SQLite compatible)

### API Routes

ทุก API routes ใช้ async/await และรองรับทั้ง local SQLite และ Turso

## Troubleshooting

### Database Connection Error

**ปัญหา**: `TURSO_DATABASE_URL is not set`

**วิธีแก้**: 
1. ตรวจสอบ Environment Variables ใน Vercel Dashboard
2. Redeploy หลังจากตั้งค่า

### API Returns 500 Error

1. ตรวจสอบ Vercel Function Logs:
   - Vercel Dashboard → Project → Deployments → Function Logs

2. ตรวจสอบว่า:
   - Turso credentials ถูกต้อง
   - Database schema ถูกสร้างแล้ว

### Schema Not Created

Schema จะสร้างอัตโนมัติเมื่อมีการเรียก API ครั้งแรก ลอง:
1. เข้าหน้า login
2. หรือเรียก API endpoint ใดก็ได้

## Custom Domain

1. ไปที่ Vercel Project Settings
2. ไปที่ "Domains"
3. เพิ่ม custom domain
4. ตั้งค่า DNS records ตามคำแนะนำของ Vercel

## Backup Database

### Export จาก Turso

```bash
turso db shell kss-connect ".dump" > backup.sql
```

### Import กลับ

```bash
turso db shell kss-connect < backup.sql
```

## Support

- Turso Documentation: https://docs.turso.tech
- Vercel Documentation: https://vercel.com/docs
- Next.js Deployment: https://nextjs.org/docs/app/building-your-application/deploying
