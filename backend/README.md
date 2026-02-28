# 🏫 School BE — Backend API

Backend REST API untuk sistem manajemen sekolah, dibangun dengan **Go + Fiber + PostgreSQL (Neon)**.

---

## 🛠️ Tech Stack

| Teknologi | Kegunaan |
|-----------|----------|
| [Go 1.21+](https://go.dev) | Bahasa pemrograman utama |
| [Fiber v2](https://gofiber.io) | HTTP Framework (mirip Express.js) |
| [PostgreSQL](https://neon.tech) | Database (hosted di Neon) |
| [lib/pq](https://github.com/lib/pq) | PostgreSQL driver untuk Go |
| [swaggo/swag](https://github.com/swaggo/swag) | Auto-generate Swagger/OpenAPI docs |
| [bcrypt](https://pkg.go.dev/golang.org/x/crypto/bcrypt) | Hashing password |
| [godotenv](https://github.com/joho/godotenv) | Load environment variables dari `.env` |

---

## 📁 Struktur Folder

```
be_school/
├── cmd/
│   └── api/
│       └── main.go                    ← Entry point server
├── docs/
│   ├── docs.go                        ← Auto-generated Swagger
│   ├── swagger.json
│   └── swagger.yaml
├── internal/
│   ├── db/
│   │   └── db.go                      ← Koneksi database
│   ├── models/
│   │   └── models.go                  ← Struct / tipe data
│   └── handlers/
│       ├── admin.go                   ← CRUD admin + login
│       ├── teacher.go                 ← CRUD guru
│       ├── class.go                   ← CRUD kelas
│       ├── student.go                 ← CRUD siswa
│       ├── subject.go                 ← CRUD mata pelajaran
│       └── schedule_assignment.go     ← CRUD jadwal & penugasan
├── .env.example                       ← Template environment variables
├── .gitignore
├── api.http                           ← File testing API (JetBrains)
├── go.mod
├── go.sum
└── README.md
```

---

## ⚙️ Environment Variables

Buat file `.env` di root folder (jangan di-commit ke Git!):

```env
DATABASE_URL=postgresql://USER:PASSWORD@HOST/DBNAME?sslmode=require
PORT=3000
```

| Variable | Keterangan |
|----------|------------|
| `DATABASE_URL` | Connection string PostgreSQL (dari Neon dashboard) |
| `PORT` | Port server (default: 3000) |

> **Cara dapat DATABASE_URL:** Buka [Neon Dashboard](https://console.neon.tech) → pilih project → klik **Connect** → aktifkan **Connection pooling** → copy connection string

---

## 🚀 Cara Install & Setup

### 1. Prerequisites
- [Go 1.21+](https://go.dev/dl/)
- [Git](https://git-scm.com)

### 2. Clone repository
```bash
git clone https://github.com/Lananuranf-RockNRoll/be_school.git
cd be_school
```

### 3. Setup environment
```bash
cp .env.example .env
```
Isi `DATABASE_URL` dengan connection string dari Neon.

### 4. Install dependencies
```bash
go mod tidy
```

### 5. Install swag CLI (untuk Swagger docs)
```bash
go install github.com/swaggo/swag/cmd/swag@latest
```

### 6. Generate Swagger docs
```bash
swag init -g cmd/api/main.go --output docs
```

### 7. Jalankan server
```bash
go run cmd/api/main.go
```

Server berjalan di: `http://localhost:3000`  
Swagger UI: `http://localhost:3000/swagger/`

---

## 📌 Daftar Endpoint

Base URL: `http://localhost:3000/api/v1`

### 🔐 Admin
| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/admins` | List semua admin |
| POST | `/admins` | Buat admin baru |
| POST | `/admins/login` | Login admin |
| DELETE | `/admins/:id` | Hapus admin |

---

### 👨‍🏫 Teachers (Guru)
| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/teachers` | List semua guru |
| GET | `/teachers/:id` | Detail guru |
| POST | `/teachers` | Tambah guru baru |
| PUT | `/teachers/:id` | Update guru |
| DELETE | `/teachers/:id` | Hapus guru |

**Query params:** `?search=nama&page=1&limit=10`

---

### 🏫 Classes (Kelas)
| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/classes` | List semua kelas |
| GET | `/classes/:id` | Detail kelas |
| GET | `/classes/:id/students` | Daftar siswa dalam kelas |
| POST | `/classes` | Tambah kelas baru |
| PUT | `/classes/:id` | Update kelas |
| DELETE | `/classes/:id` | Hapus kelas |

---

### 👨‍🎓 Students (Siswa)
| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/students` | List semua siswa |
| GET | `/students/:id` | Detail siswa |
| POST | `/students` | Tambah siswa baru |
| PUT | `/students/:id` | Update siswa |
| DELETE | `/students/:id` | Hapus siswa |

**Query params:** `?search=nama&class_id=UUID&page=1&limit=10`

---

### 📚 Subjects (Mata Pelajaran)
| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/subjects` | List semua mapel |
| GET | `/subjects/:id` | Detail mapel |
| POST | `/subjects` | Tambah mapel baru |
| PUT | `/subjects/:id` | Update mapel |
| DELETE | `/subjects/:id` | Hapus mapel |

---

### 📋 Assignments (Penugasan Guru)
| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/assignments` | List semua penugasan |
| POST | `/assignments` | Buat penugasan baru |
| DELETE | `/assignments/:id` | Hapus penugasan |

**Query params:** `?teacher_id=UUID&class_id=UUID`

---

### 🗓️ Schedules (Jadwal)
| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/schedules` | List semua jadwal |
| GET | `/schedules/:id` | Detail jadwal |
| POST | `/schedules` | Buat jadwal baru |
| PUT | `/schedules/:id` | Update jadwal |
| DELETE | `/schedules/:id` | Hapus jadwal |

**Query params:** `?class_id=UUID&teacher_id=UUID`  
**day_of_week:** 1=Senin, 2=Selasa, 3=Rabu, 4=Kamis, 5=Jumat, 6=Sabtu, 7=Minggu

---

## 🔗 Cara Konek ke Frontend (React)

### 1. Buat file `.env` di project React
```env
REACT_APP_API_URL=http://localhost:3000/api/v1
```

### 2. Contoh fetch biasa
```javascript
const response = await fetch(`${process.env.REACT_APP_API_URL}/students`);
const data = await response.json();
```

### 3. Contoh login
```javascript
const response = await fetch(`${process.env.REACT_APP_API_URL}/admins/login`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'admin@school.com', password: 'password123' })
});
const data = await response.json();
```

### 4. Contoh dengan Axios
```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  headers: { 'Content-Type': 'application/json' }
});

// Get semua siswa
const { data } = await api.get('/students');

// Tambah siswa baru
const { data } = await api.post('/students', {
  student_number: 'STD001',
  full_name: 'Andi Pratama',
  class_id: 'uuid-kelas'
});
```

> 💡 Swagger UI tersedia di `http://localhost:3000/swagger/` untuk dokumentasi lengkap dan try out semua endpoint secara interaktif.

---

## 📝 Format Response

### Success
```json
{
  "success": true,
  "message": "Student created",
  "data": { "id": "uuid-xxx" }
}
```

### Paginated
```json
{
  "success": true,
  "data": [],
  "total": 100,
  "page": 1,
  "limit": 10
}
```

### Error
```json
{
  "success": false,
  "message": "Student not found"
}
```