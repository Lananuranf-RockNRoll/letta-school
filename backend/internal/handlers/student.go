package handlers

import (
	"database/sql"
	"strings"

	"github.com/gofiber/fiber/v2"

	"be_school/internal/models"
)

func RegisterStudentRoutes(router fiber.Router, db *sql.DB) {
	r := router.Group("/students")
	r.Get("/", getStudents(db))
	r.Get("/:id", getStudent(db))
	r.Post("/", createStudent(db))
	r.Put("/:id", updateStudent(db))
	r.Delete("/:id", deleteStudent(db))
}

// getStudents godoc
// @Summary     List semua siswa
// @Description Ambil semua data siswa, bisa filter by nama / kelas
// @Tags        Students
// @Produce     json
// @Param       search    query  string  false  "Cari berdasarkan nama"
// @Param       class_id  query  string  false  "Filter berdasarkan UUID kelas"
// @Param       page      query  int     false  "Halaman (default: 1)"
// @Param       limit     query  int     false  "Jumlah per halaman (default: 10)"
// @Success     200  {object}  models.PaginatedResponse
// @Failure     500  {object}  models.Response
// @Router      /students [get]
func getStudents(db *sql.DB) fiber.Handler {
	return func(c *fiber.Ctx) error {
		search := c.Query("search", "")
		classID := c.Query("class_id", "")
		page := c.QueryInt("page", 1)
		limit := c.QueryInt("limit", 10)
		offset := (page - 1) * limit

		query := `
			SELECT s.id, s.student_number, s.full_name, s.email, s.gender, s.date_of_birth,
				s.phone, s.photo_url, s.class_id, s.enrollment_date, s.created_at, s.updated_at,
				c.name as class_name
			FROM students s
			LEFT JOIN classes c ON s.class_id = c.id
			WHERE ($1 = '' OR s.full_name ILIKE '%' || $1 || '%')
			AND ($2 = '' OR s.class_id::TEXT = $2)
			ORDER BY s.full_name
			LIMIT $3 OFFSET $4
		`

		rows, err := db.Query(query, search, classID, limit, offset)
		if err != nil {
			return c.Status(500).JSON(models.Response{Success: false, Message: err.Error()})
		}
		defer rows.Close()

		students := []models.StudentWithClass{}
		for rows.Next() {
			var s models.StudentWithClass
			err := rows.Scan(&s.ID, &s.StudentNumber, &s.FullName, &s.Email, &s.Gender,
				&s.DateOfBirth, &s.Phone, &s.PhotoURL, &s.ClassID, &s.EnrollmentDate,
				&s.CreatedAt, &s.UpdatedAt, &s.ClassName)
			if err != nil {
				continue
			}
			students = append(students, s)
		}

		var total int
		db.QueryRow(`SELECT COUNT(*) FROM students WHERE ($1 = '' OR full_name ILIKE '%' || $1 || '%') AND ($2 = '' OR class_id::TEXT = $2)`, search, classID).Scan(&total)

		return c.JSON(models.PaginatedResponse{
			Success: true,
			Data:    students,
			Total:   total,
			Page:    page,
			Limit:   limit,
		})
	}
}

// getStudent godoc
// @Summary     Detail siswa
// @Description Ambil data siswa berdasarkan ID
// @Tags        Students
// @Produce     json
// @Param       id  path      string  true  "Student UUID"
// @Success     200 {object}  models.Response
// @Failure     404 {object}  models.Response
// @Router      /students/{id} [get]
func getStudent(db *sql.DB) fiber.Handler {
	return func(c *fiber.Ctx) error {
		id := c.Params("id")

		var s models.StudentWithClass
		err := db.QueryRow(`
			SELECT s.id, s.student_number, s.full_name, s.email, s.gender, s.date_of_birth,
				s.phone, s.photo_url, s.class_id, s.enrollment_date, s.created_at, s.updated_at,
				c.name as class_name
			FROM students s
			LEFT JOIN classes c ON s.class_id = c.id
			WHERE s.id = $1
		`, id).Scan(&s.ID, &s.StudentNumber, &s.FullName, &s.Email, &s.Gender,
			&s.DateOfBirth, &s.Phone, &s.PhotoURL, &s.ClassID, &s.EnrollmentDate,
			&s.CreatedAt, &s.UpdatedAt, &s.ClassName)

		if err == sql.ErrNoRows {
			return c.Status(404).JSON(models.Response{Success: false, Message: "Student not found"})
		}
		if err != nil {
			return c.Status(500).JSON(models.Response{Success: false, Message: err.Error()})
		}

		return c.JSON(models.Response{Success: true, Data: s})
	}
}

// createStudent godoc
// @Summary     Buat siswa baru
// @Description Tambah data siswa baru ke database
// @Tags        Students
// @Accept      json
// @Produce     json
// @Param       body  body      models.CreateStudentRequest  true  "Data siswa"
// @Success     201   {object}  models.Response
// @Failure     400   {object}  models.Response
// @Failure     409   {object}  models.Response
// @Router      /students [post]
func createStudent(db *sql.DB) fiber.Handler {
	return func(c *fiber.Ctx) error {
		var req models.CreateStudentRequest
		if err := c.BodyParser(&req); err != nil {
			return c.Status(400).JSON(models.Response{Success: false, Message: "Invalid request body"})
		}

		if strings.TrimSpace(req.StudentNumber) == "" || strings.TrimSpace(req.FullName) == "" {
			return c.Status(400).JSON(models.Response{Success: false, Message: "student_number and full_name are required"})
		}

		var id string
		err := db.QueryRow(`
			INSERT INTO students (student_number, full_name, email, gender, date_of_birth, phone, photo_url, class_id, enrollment_date)
			VALUES ($1, $2, NULLIF($3,''), NULLIF($4,''), NULLIF($5,'')::DATE, NULLIF($6,''), NULLIF($7,''), NULLIF($8,'')::UUID, NULLIF($9,'')::DATE)
			RETURNING id
		`, req.StudentNumber, req.FullName, req.Email, req.Gender, req.DateOfBirth,
			req.Phone, req.PhotoURL, req.ClassID, req.EnrollmentDate).Scan(&id)

		if err != nil {
			if strings.Contains(err.Error(), "unique") {
				return c.Status(409).JSON(models.Response{Success: false, Message: "Student number already exists"})
			}
			return c.Status(500).JSON(models.Response{Success: false, Message: err.Error()})
		}

		return c.Status(201).JSON(models.Response{Success: true, Message: "Student created", Data: fiber.Map{"id": id}})
	}
}

// updateStudent godoc
// @Summary     Update siswa
// @Tags        Students
// @Accept      json
// @Produce     json
// @Param       id    path      string                       true  "Student UUID"
// @Param       body  body      models.CreateStudentRequest  true  "Data yang diupdate"
// @Success     200   {object}  models.Response
// @Router      /students/{id} [put]
func updateStudent(db *sql.DB) fiber.Handler {
	return func(c *fiber.Ctx) error {
		id := c.Params("id")

		var req models.CreateStudentRequest
		if err := c.BodyParser(&req); err != nil {
			return c.Status(400).JSON(models.Response{Success: false, Message: "Invalid request body"})
		}

		_, err := db.Exec(`
			UPDATE students SET
				full_name = COALESCE(NULLIF($1,''), full_name),
				email = COALESCE(NULLIF($2,''), email),
				gender = COALESCE(NULLIF($3,''), gender),
				date_of_birth = COALESCE(NULLIF($4,'')::DATE, date_of_birth),
				phone = COALESCE(NULLIF($5,''), phone),
				photo_url = COALESCE(NULLIF($6,''), photo_url),
				class_id = COALESCE(NULLIF($7,'')::UUID, class_id),
				updated_at = CURRENT_TIMESTAMP
			WHERE id = $8
		`, req.FullName, req.Email, req.Gender, req.DateOfBirth, req.Phone, req.PhotoURL, req.ClassID, id)

		if err != nil {
			return c.Status(500).JSON(models.Response{Success: false, Message: err.Error()})
		}

		return c.JSON(models.Response{Success: true, Message: "Student updated"})
	}
}

// deleteStudent godoc
// @Summary     Hapus siswa
// @Tags        Students
// @Produce     json
// @Param       id  path      string  true  "Student UUID"
// @Success     200 {object}  models.Response
// @Failure     404 {object}  models.Response
// @Router      /students/{id} [delete]
func deleteStudent(db *sql.DB) fiber.Handler {
	return func(c *fiber.Ctx) error {
		id := c.Params("id")

		result, err := db.Exec(`DELETE FROM students WHERE id = $1`, id)
		if err != nil {
			return c.Status(500).JSON(models.Response{Success: false, Message: err.Error()})
		}

		rows, _ := result.RowsAffected()
		if rows == 0 {
			return c.Status(404).JSON(models.Response{Success: false, Message: "Student not found"})
		}

		return c.JSON(models.Response{Success: true, Message: "Student deleted"})
	}
}
