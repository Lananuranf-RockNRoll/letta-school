# 🏫 Frontend School — Admin Dashboard

Frontend untuk sistem manajemen sekolah berbasis React + TypeScript, terhubung ke [Backend School API](https://beschool-production.up.railway.app).

**Live Demo:** https://letta-school.netlify.app

---

## 🛠 Tech Stack

| Tech | Keterangan |
|------|------------|
| React 18 | UI Library |
| TypeScript | Type safety |
| Tailwind CSS | Styling |
| React Router v6 | Routing & navigation |
| Lucide React | Icon library |
| Vite | Build tool |

---

## 📁 Struktur Folder

```
src/
├── api/                    # Semua fungsi fetch ke BE
│   ├── auth.ts             # Login, logout, getUser
│   ├── admins.ts           # CRUD admin
│   ├── classes.ts          # CRUD kelas
│   ├── dashboard.ts        # Stats dashboard
│   ├── schedule.ts         # CRUD jadwal
│   ├── students.ts         # CRUD siswa
│   ├── teachers.ts         # CRUD guru
│   └── config.ts           # BASE_URL & fetchWithRetry
│
├── components/             # Reusable UI components
│   ├── AddAdminForm.tsx     # Form tambah admin
│   ├── AddClassForm.tsx     # Form tambah kelas
│   ├── AddScheduleForm.tsx  # Form tambah jadwal
│   ├── AddStudentForm.tsx   # Form tambah siswa
│   ├── AddTeacherForm.tsx   # Form tambah guru
│   ├── ScheduleModal.tsx    # Modal detail jadwal per kelas
│   ├── ScheduleTable.tsx    # Tabel daftar kelas jadwal
│   ├── StudentProfile.tsx   # Halaman detail siswa
│   └── TeacherProfile.tsx   # Halaman detail guru
│
├── layout/
│   └── Sidebar.tsx         # Sidebar navigasi (responsive)
│
├── pages/                  # Halaman utama
│   ├── Login.tsx           # Halaman login
│   ├── Dashboard.tsx       # Dashboard utama
│   ├── Students.tsx        # Manajemen siswa
│   ├── Teacher.tsx         # Manajemen guru
│   ├── Schedule.tsx        # Manajemen jadwal
│   └── Settings.tsx        # Pengaturan
│
├── routes/
│   └── Routes.tsx          # Definisi routing + protected route
│
├── types/
│   └── schedule.ts         # Type definitions untuk jadwal
│
├── App.tsx                 # Root component + BrowserRouter
├── main.tsx                # Entry point
└── index.css               # Global styles (Tailwind)
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js >= 18
- npm atau yarn

### Install & Run

```bash
# Clone repo
git clone https://github.com/Lananuranf-RockNRoll/fe_school.git
cd fe_school

# Install dependencies
npm install

# Jalankan development server
npm run dev
```

Buka browser di `http://localhost:5173`

### Build Production

```bash
npm run build
```

Output di folder `dist/`

---

## ⚙️ Environment Variables

Buat file `.env` di root project:

```env
VITE_API_URL=https://beschool-production.up.railway.app/api/v1
```

Untuk development lokal:

```env
VITE_API_URL=http://localhost:3000/api/v1
```

---

## 🔐 Authentication

Login menggunakan email & password admin. Data user disimpan di `localStorage` dengan key `admin_user`.

Semua halaman kecuali `/login` dilindungi oleh `ProtectedRoute` — jika belum login akan otomatis redirect ke `/login`.

---

## 📄 Halaman & Fitur

### Dashboard (`/`)
- Statistik total siswa, guru, dan kelas
- Quick action: tambah admin, tambah kelas, navigasi ke siswa
- Tabel 5 siswa terbaru

### Students (`/students`)
- Tabel daftar siswa dengan pagination (10/halaman)
- Search by nama atau email
- Tambah siswa baru (form popup)
- Lihat detail profil siswa
- Hapus siswa

### Teachers (`/teachers`)
- Tabel daftar guru dengan pagination
- Search by nama atau email
- Tambah guru baru (form popup)
- Lihat detail profil guru
- Hapus guru

### Schedule (`/schedule`)
- Tabel jadwal per kelas
- Tambah jadwal baru (pilih kelas, mata pelajaran, guru, hari, jam)
- Lihat detail jadwal per kelas (modal)
- Hapus jadwal per baris

---

## 🌐 API

Base URL: `https://beschool-production.up.railway.app/api/v1`

| Endpoint | Deskripsi |
|----------|-----------|
| `POST /admins/login` | Login admin |
| `GET /students` | List siswa |
| `POST /students` | Tambah siswa |
| `GET /teachers` | List guru |
| `POST /teachers` | Tambah guru |
| `GET /classes` | List kelas |
| `POST /classes` | Tambah kelas |
| `GET /schedules` | List jadwal |
| `POST /schedules` | Tambah jadwal |
| `DELETE /schedules/:id` | Hapus jadwal |

Dokumentasi lengkap BE: [be_school repo](https://github.com/Lananuranf-RockNRoll/be_school)

---

## 📱 Responsive

UI mendukung tampilan mobile, tablet, dan desktop:
- **Mobile**: Sidebar tersembunyi, buka via hamburger menu
- **Tablet**: Kolom tabel dikurangi (Email/Phone hidden)
- **Desktop**: Full layout dengan sidebar tetap

---

## 🚢 Deployment

| Service | URL |
|---------|-----|
