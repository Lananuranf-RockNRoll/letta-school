#  Dokumentasi Letta School — Sistem Manajemen Sekolah

> Dokumentasi lengkap dari A-Z untuk sistem manajemen sekolah berbasis web.  
> **URL Produksi:** https://school.lananuranf.my.id  
> **Versi:** 1.0.0  
> **Terakhir diperbarui:** Maret 2026

---

## Daftar Isi

1. [Gambaran Umum](#1-gambaran-umum)
2. [Arsitektur Sistem & Infrastruktur](#2-arsitektur-sistem--infrastruktur)
3. [Database Schema](#3-database-schema)
4. [API Endpoints (Backend Go)](#4-api-endpoints-backend-go)
5. [Frontend React (Komponen & Halaman)](#5-frontend-react-komponen--halaman)
6. [Fitur & User Guide](#6-fitur--user-guide)
7. [Deployment & CI/CD](#7-deployment--cicd)
8. [Environment Variables](#8-environment-variables)
9. [Troubleshooting](#9-troubleshooting)

---

## 1. Gambaran Umum

Letta School adalah platform manajemen sekolah berbasis web yang memudahkan pengelolaan data guru, siswa, kelas, dan jadwal pelajaran. Dilengkapi dengan AI Assistant berbasis Groq untuk membantu admin dalam mengakses informasi sekolah secara cepat.

### Tech Stack

| Layer | Teknologi |
|-------|-----------|
| Frontend | React + TypeScript + Vite + TailwindCSS |
| Backend | Go (Golang) + Fiber v2 |
| Database | PostgreSQL 16 |
| Reverse Proxy | Nginx |
| Containerization | Docker + Docker Compose |
| AI Assistant | Groq API (llama-3.3-70b-versatile) |
| Hosting | AWS EC2 |
| SSL | Let's Encrypt (Certbot) |

---

## 2. Arsitektur Sistem & Infrastruktur

### Diagram Arsitektur

```
Internet
    │
    ▼
[Nginx (Host EC2)]  ← /etc/nginx/conf.d/school.conf
    │
    ├── /api/v1/*  ──────► [school_be:3001]  (Go Backend)
    │                              │
    └── /*  ─────────────► [school_fe:5174]  (React Frontend via Nginx)
                                   
[school_be:3001]
    │
    ├── PostgreSQL ──────► [school_db:5432]  (Internal Docker Network)
    │
    └── Groq API ────────► https://api.groq.com  (External)
```

### Docker Services

| Container | Image | Port | Fungsi |
|-----------|-------|------|--------|
| `school_db` | postgres:16-alpine | Internal | Database PostgreSQL |
| `school_be` | letta-school-backend | 3001 | REST API Go |
| `school_fe` | letta-school-frontend | 5174 | React SPA via Nginx |

### Network Flow

1. User mengakses `https://school.lananuranf.my.id`
2. Nginx host EC2 menerima request
3. Request `/api/v1/*` di-proxy ke backend port 3001
4. Request lainnya di-proxy ke frontend port 5174
5. Backend berkomunikasi dengan PostgreSQL via Docker internal network
6. Backend memanggil Groq API untuk fitur AI Chat

### Struktur Direktori

```
letta-school/
├── backend/
│   ├── cmd/api/main.go          # Entry point server
│   ├── internal/
│   │   ├── db/db.go             # Koneksi database
│   │   ├── handlers/            # HTTP handlers
│   │   │   ├── admin.go
│   │   │   ├── ai.go            # AI Chat handler
│   │   │   ├── class.go
│   │   │   ├── schedule_assignment.go
│   │   │   ├── student.go
│   │   │   ├── subject.go
│   │   │   └── teacher.go
│   │   └── models/models.go     # Struct models
│   ├── Dockerfile
│   └── go.mod
├── frontend/
│   ├── src/
│   │   ├── api/                 # API client functions
│   │   ├── components/          # Reusable components
│   │   ├── layout/              # Layout components
│   │   ├── pages/               # Halaman utama
│   │   ├── routes/Routes.tsx    # React Router config
│   │   └── types/               # TypeScript types
│   ├── Dockerfile
│   └── vite.config.ts
├── nginx/nginx.conf             # Nginx config lokal
├── docker-compose.yml           # Docker Compose config
├── init.sql                     # Database schema
└── seed.sql                     # Data awal sekolah
```

---

## 3. Database Schema

### Tabel `admin_users`

| Kolom | Tipe | Keterangan |
|-------|------|------------|
| `id` | UUID | Primary key, auto-generated |
| `full_name` | VARCHAR | Nama lengkap admin |
| `email` | VARCHAR UNIQUE | Email login |
| `password_hash` | TEXT | Bcrypt hash password |
| `is_active` | BOOLEAN | Status aktif (default: true) |
| `created_at` | TIMESTAMP | Waktu dibuat |
| `updated_at` | TIMESTAMP | Waktu diperbarui |

### Tabel `teachers`

| Kolom | Tipe | Keterangan |
|-------|------|------------|
| `id` | UUID | Primary key |
| `employee_number` | VARCHAR UNIQUE | Nomor pegawai (EMP001, dst) |
| `full_name` | VARCHAR | Nama lengkap |
| `email` | VARCHAR | Email |
| `gender` | VARCHAR | Male/Female |
| `date_of_birth` | DATE | Tanggal lahir |
| `phone` | VARCHAR | Nomor telepon |
| `photo_url` | TEXT | URL foto profil |
| `bio` | TEXT | Biografi singkat |
| `created_at` | TIMESTAMP | Waktu dibuat |
| `updated_at` | TIMESTAMP | Waktu diperbarui |

### Tabel `classes`

| Kolom | Tipe | Keterangan |
|-------|------|------------|
| `id` | UUID | Primary key |
| `name` | VARCHAR UNIQUE | Nama kelas (X-A, XI-B, dst) |
| `grade_level` | VARCHAR | Tingkat (10, 11, 12) |
| `homeroom_teacher_id` | UUID | FK ke teachers |
| `created_at` | TIMESTAMP | Waktu dibuat |

### Tabel `students`

| Kolom | Tipe | Keterangan |
|-------|------|------------|
| `id` | UUID | Primary key |
| `student_number` | VARCHAR UNIQUE | Nomor siswa (STD001, dst) |
| `full_name` | VARCHAR | Nama lengkap |
| `class_id` | UUID | FK ke classes |
| `email` | VARCHAR | Email |
| `gender` | VARCHAR | Male/Female |
| `date_of_birth` | DATE | Tanggal lahir |
| `phone` | VARCHAR | Nomor telepon |
| `photo_url` | TEXT | URL foto profil |
| `enrollment_date` | DATE | Tanggal masuk |
| `created_at` | TIMESTAMP | Waktu dibuat |

### Tabel `subjects`

| Kolom | Tipe | Keterangan |
|-------|------|------------|
| `id` | UUID | Primary key |
| `name` | VARCHAR UNIQUE | Nama mata pelajaran |
| `description` | TEXT | Deskripsi |
| `created_at` | TIMESTAMP | Waktu dibuat |

**Mata pelajaran yang tersedia (14):**
Matematika, B. Indonesia, B. Inggris, IPA, IPS, Fisika, Kimia, Biologi, Seni Budaya, Olahraga, PKN, Agama, BK, Sejarah

### Tabel `class_schedules`

| Kolom | Tipe | Keterangan |
|-------|------|------------|
| `id` | UUID | Primary key |
| `class_id` | UUID | FK ke classes |
| `subject_id` | UUID | FK ke subjects |
| `teacher_id` | UUID | FK ke teachers |
| `day_of_week` | INTEGER | 1=Senin, 2=Selasa, ..., 5=Jumat |
| `start_time` | TIME | Jam mulai (07:00, dst) |
| `end_time` | TIME | Jam selesai |
| `created_at` | TIMESTAMP | Waktu dibuat |

### Tabel `teacher_assignments`

| Kolom | Tipe | Keterangan |
|-------|------|------------|
| `id` | UUID | Primary key |
| `teacher_id` | UUID | FK ke teachers |
| `class_id` | UUID | FK ke classes |
| `subject_id` | UUID | FK ke subjects |
| `created_at` | TIMESTAMP | Waktu dibuat |

### Relasi Antar Tabel

```
teachers ──< class_schedules >── classes
    │               │
    │           subjects
    │
    └── classes (homeroom_teacher_id)
    
classes ──< students
classes ──< teacher_assignments >── teachers
                    │
                subjects
```

---

## 4. API Endpoints (Backend Go)

**Base URL:** `https://school.lananuranf.my.id/api/v1`

### Authentication

#### `POST /admins/login`
Login admin.

**Request Body:**
```json
{
  "email": "admin@school.com",
  "password": "admin123"
}
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "data": {
    "id": "uuid",
    "full_name": "Admin",
    "email": "admin@school.com"
  }
}
```

#### `POST /admins`
Buat admin baru.

**Request Body:**
```json
{
  "full_name": "Admin Baru",
  "email": "admin2@school.com",
  "password": "password123"
}
```

---

### Teachers

#### `GET /teachers`
Ambil daftar guru dengan pagination dan search.

**Query Parameters:**
| Parameter | Tipe | Default | Keterangan |
|-----------|------|---------|------------|
| `search` | string | "" | Cari berdasarkan nama |
| `page` | int | 1 | Halaman |
| `limit` | int | 10 | Jumlah per halaman |

**Response:**
```json
{
  "success": true,
  "data": [...],
  "total": 188,
  "page": 1,
  "limit": 10
}
```

#### `GET /teachers/:id`
Detail guru berdasarkan UUID.

#### `POST /teachers`
Tambah guru baru.

**Request Body:**
```json
{
  "employee_number": "EMP021",
  "full_name": "Nama Guru",
  "email": "guru@school.com",
  "gender": "Male",
  "date_of_birth": "1990-01-01",
  "phone": "081234567890",
  "bio": "Biografi singkat"
}
```

#### `PUT /teachers/:id`
Update data guru.

#### `DELETE /teachers/:id`
Hapus guru.

---

### Students

#### `GET /students`
Ambil daftar siswa.

**Query Parameters:** `search`, `page`, `limit`, `class_id`

#### `GET /students/:id`
Detail siswa.

#### `POST /students`
Tambah siswa baru.

**Request Body:**
```json
{
  "student_number": "STD201",
  "full_name": "Nama Siswa",
  "class_id": "uuid-kelas",
  "email": "siswa@school.com",
  "gender": "Female",
  "date_of_birth": "2005-06-15",
  "phone": "081234567890",
  "enrollment_date": "2024-07-14"
}
```

#### `PUT /students/:id`
Update data siswa.

#### `DELETE /students/:id`
Hapus siswa.

---

### Classes

#### `GET /classes`
Ambil semua kelas.

#### `GET /classes/:id`
Detail kelas beserta daftar siswa.

#### `POST /classes`
Buat kelas baru.

**Request Body:**
```json
{
  "name": "X-E",
  "grade_level": "10",
  "homeroom_teacher_id": "uuid-guru"
}
```

#### `PUT /classes/:id`
Update kelas.

#### `DELETE /classes/:id`
Hapus kelas.

---

### Schedules

#### `GET /schedules`
Ambil semua jadwal.

**Query Parameters:** `class_id`, `day_of_week`

#### `POST /schedules`
Tambah jadwal baru.

**Request Body:**
```json
{
  "class_id": "uuid-kelas",
  "subject_id": "uuid-mapel",
  "teacher_id": "uuid-guru",
  "day_of_week": 1,
  "start_time": "07:00",
  "end_time": "08:30"
}
```

#### `DELETE /schedules/:id`
Hapus jadwal.

---

### Subjects

#### `GET /subjects`
Ambil semua mata pelajaran.

#### `POST /subjects`
Tambah mata pelajaran baru.

---

### AI Chat

#### `POST /ai/chat`
Kirim pesan ke AI assistant.

**Request Body:**
```json
{
  "message": "Tampilkan jadwal kelas X-A hari Senin",
  "history": [
    { "role": "user", "content": "pesan sebelumnya" },
    { "role": "assistant", "content": "jawaban sebelumnya" }
  ]
}
```

**Response:**
```json
{
  "reply": "Jadwal kelas X-A hari Senin adalah: ..."
}
```

---

### Health Check

#### `GET /health`
Cek status server.

**Response:**
```json
{ "status": "ok" }
```

---

## 5. Frontend React (Komponen & Halaman)

### Halaman (Pages)

#### `/login` — Login
Halaman login admin dengan form email dan password. Menyimpan JWT token ke localStorage.

#### `/` — Dashboard
Menampilkan statistik sekolah (total siswa, guru, kelas), quick action buttons, dan tabel recent students.

#### `/teachers` — Teachers
Daftar guru dengan fitur search, pagination, Export CSV, Add Teacher, dan klik untuk lihat profil detail.

#### `/students` — Students / Classes
Daftar siswa dengan fitur search, pagination, Export CSV, Add Student, dan profil detail. Menampilkan nama kelas masing-masing siswa.

#### `/schedule` — Schedule
Jadwal pelajaran per kelas. Klik kelas untuk lihat jadwal mingguan lengkap dalam modal.

#### `/features` — Features
Halaman dokumentasi fitur dengan hero banner, card fitur, dan quick start guide.

---

### Komponen (Components)

| Komponen | Fungsi |
|----------|--------|
| `AIChat.tsx` | Floating AI chat button, responsive (bottom sheet di mobile, bubble di desktop) |
| `AddTeacherForm.tsx` | Form modal tambah guru baru |
| `AddStudentForm.tsx` | Form modal tambah siswa baru |
| `AddClassForm.tsx` | Form modal tambah kelas baru |
| `AddAdminForm.tsx` | Form modal tambah admin baru |
| `AddScheduleForm.tsx` | Form modal tambah jadwal |
| `TeacherProfile.tsx` | Halaman detail profil guru |
| `StudentProfile.tsx` | Halaman detail profil siswa (responsive) |
| `ScheduleTable.tsx` | Tabel daftar kelas dengan jadwal |
| `ScheduleModal.tsx` | Modal detail jadwal mingguan per kelas |

### Layout

| Komponen | Fungsi |
|----------|--------|
| `Sidebar.tsx` | Sidebar navigasi dengan menu Dashboard, Teachers, Students, Schedule, Features, Logout. Badge "NEW" untuk Features |

### API Client (`src/api/`)

| File | Fungsi |
|------|--------|
| `auth.ts` | Login, logout, cek token, get user |
| `teachers.ts` | CRUD guru |
| `students.ts` | CRUD siswa |
| `classes.ts` | CRUD kelas |
| `subjects.ts` | Get mata pelajaran |
| `schedule.ts` | CRUD jadwal |
| `dashboard.ts` | Get statistik dashboard |
| `admins.ts` | CRUD admin |
| `axios.ts` | Axios instance dengan base URL dan auth header |
| `config.ts` | Konfigurasi API URL |

---

## 6. Fitur & User Guide

### Login
1. Buka `https://school.lananuranf.my.id`
2. Masukkan email dan password admin
3. Klik **Login**

**Default credentials:**
- Email: `admin@school.com`
- Password: `password` *(ganti setelah login pertama)*

---

### Manajemen Guru
- **Lihat daftar:** Menu **Teachers**
- **Cari guru:** Ketik nama di search bar
- **Tambah guru:** Klik **Add Teachers** → isi form → Submit
- **Lihat profil:** Klik nama/foto guru
- **Hapus guru:** Klik **Delete** di baris guru atau di halaman profil
- **Export CSV:** Klik **Export CSV** untuk download data halaman aktif

---

### Manajemen Siswa
- **Lihat daftar:** Menu **Students / Classes**
- **Cari siswa:** Ketik nama di search bar
- **Tambah siswa:** Klik **Add Students** → isi form → Submit
- **Lihat profil:** Klik nama/foto siswa
- **Hapus siswa:** Klik **Delete**
- **Export CSV:** Klik **Export CSV**

---

### Manajemen Kelas
- Kelas dibuat melalui Dashboard → **Add Classes**
- Assign wali kelas saat membuat kelas
- 12 kelas tersedia: X-A/B/C/D, XI-A/B/C/D, XII-A/B/C/D

---

### Jadwal Pelajaran
- **Lihat jadwal:** Menu **Schedule** → klik nama kelas
- **Tambah jadwal:** Klik **Add Schedule** → pilih kelas, mapel, guru, hari, jam
- **Hapus jadwal:** Di modal jadwal kelas, klik delete pada slot yang ingin dihapus

**Slot waktu standar:**
| Slot | Waktu |
|------|-------|
| 1 | 07:00 - 08:30 |
| 2 | 08:30 - 09:30 |
| 3 | 09:30 - 10:30 |
| 4 | 10:30 - 11:30 |
| 5 | 11:30 - 12:30 |

---

### AI Assistant
- Klik tombol **chat bubble** di pojok kanan bawah
- Ketik pertanyaan dan tekan Enter atau klik Send
- Contoh pertanyaan:
    - *"Tampilkan jadwal kelas X-A hari Senin"*
    - *"Kelas mana yang punya siswa terbanyak?"*
    - *"Berapa total guru di sekolah?"*
    - *"Buatkan laporan singkat statistik sekolah"*

---

### Support
- Klik tombol **Support** di pojok kiri bawah
- **Live Chat:** Terhubung ke WhatsApp admin
- **Documentation:** Link ke halaman Features

---

## 7. Deployment & CI/CD

### Prasyarat
- AWS EC2 (Amazon Linux 2023, minimal t2.micro)
- Docker & Docker Compose terinstall
- Nginx terinstall di host
- Domain dengan DNS A record mengarah ke IP EC2
- Certbot untuk SSL

### Setup Awal EC2

```bash
# Install Docker
sudo yum update -y
sudo yum install docker -y
sudo service docker start
sudo usermod -a -G docker ec2-user

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Install Nginx
sudo yum install nginx -y
sudo systemctl start nginx
sudo systemctl enable nginx

# Install Certbot
sudo yum install certbot python3-certbot-nginx -y
```

### Clone & Setup Project

```bash
cd ~
git clone https://github.com/Lananuranf-RockNRoll/letta-school.git letta-school
cd letta-school

# Buat file .env
nano .env
```

Isi `.env`:
```
DB_USER=school_user
DB_PASSWORD=password_aman
DB_NAME=school_db
PORT=3001
GROQ_API_KEY=gsk_xxxxxxxxxxxxx
```

### Konfigurasi Nginx

```bash
sudo cp school.conf /etc/nginx/conf.d/school.conf
sudo nginx -t
sudo systemctl reload nginx
```

Isi `school.conf`:
```nginx
server {
    server_name school.lananuranf.my.id;

    location /api/v1/ {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location / {
        proxy_pass http://localhost:5174;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### Setup SSL

```bash
sudo certbot --nginx -d school.lananuranf.my.id
```

### Deploy Aplikasi

```bash
docker compose up --build -d
```

### Import Data Awal

```bash
docker cp seed.sql school_db:/seed.sql
docker exec -it school_db psql -U school_user -d school_db -f /seed.sql
```

### Update Aplikasi (setelah push ke GitHub)

```bash
cd ~/letta-school
git fetch origin && git reset --hard origin/main
docker compose up --build -d
```

### Cek Status Container

```bash
docker ps
docker logs school_be --tail 20
docker logs school_fe --tail 20
docker logs school_db --tail 20
```

---

## 8. Environment Variables

### Backend (`.env` di root project)

| Variable | Keterangan | Contoh |
|----------|------------|--------|
| `DB_USER` | Username PostgreSQL | `school_user` |
| `DB_PASSWORD` | Password PostgreSQL | `password_aman` |
| `DB_NAME` | Nama database | `school_db` |
| `PORT` | Port backend | `3001` (EC2) / `3000` (lokal) |
| `GROQ_API_KEY` | API key dari console.groq.com | `gsk_xxx...` |

### Frontend (Build Args di Dockerfile)

| Variable | Keterangan | Default |
|----------|------------|---------|
| `VITE_API_URL` | Base URL API | `/api/v1` |

---

## 9. Troubleshooting

### Container tidak jalan
```bash
docker compose down
docker compose up -d
docker logs school_be --tail 50
```

### Port conflict
```bash
# Cek port yang dipakai
sudo netstat -tlnp | grep :3001
sudo netstat -tlnp | grep :5174

# Jika ada conflict, stop container yang konflik
docker ps | grep <port>
docker stop <container_name>
```

### Database tidak connect
```bash
# Cek container DB
docker logs school_db --tail 20

# Cek koneksi manual
docker exec -it school_db psql -U school_user -d school_db
```

### AI Chat error 500
```bash
# Cek API key
docker exec school_be env | grep GROQ

# Jika kosong, pastikan .env ada GROQ_API_KEY
cat .env | grep GROQ

# Restart container
docker compose up -d
```

### SSL expired
```bash
sudo certbot renew
sudo systemctl reload nginx
```

### Git pull conflict
```bash
git fetch origin
git reset --hard origin/main
docker compose up -d
```

### Disk penuh
```bash
df -h
# Bersihkan docker images yang tidak terpakai
docker system prune -a
```

---

## Seed Data

Sistem sudah dilengkapi data awal:

| Data | Jumlah |
|------|--------|
| Kelas | 12 (X-A/B/C/D, XI-A/B/C/D, XII-A/B/C/D) |
| Mata Pelajaran | 14 |
| Guru | 188 (1 guru per mapel per kelas) |
| Siswa | 200 (~16-17 per kelas) |
| Jadwal | 300 (5 hari × 5 slot × 12 kelas) |

Import seed data:
```bash
docker cp seed.sql school_db:/seed.sql
docker exec -it school_db psql -U school_user -d school_db -f /seed.sql
```

---

*Dokumentasi ini dibuat otomatis untuk proyek Letta School. Untuk pertanyaan lebih lanjut, gunakan fitur AI Chat di dalam aplikasi.*