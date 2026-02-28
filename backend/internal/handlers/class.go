package handlers

import (
	"database/sql"
	"strings"

	"github.com/gofiber/fiber/v2"

	"be_school/internal/models"
)

func RegisterClassRoutes(router fiber.Router, db *sql.DB) {
	r := router.Group("/classes")
	r.Get("/", getClasses(db))
	r.Get("/:id", getClass(db))
	r.Get("/:id/students", getClassStudents(db))
	r.Post("/", createClass(db))
	r.Put("/:id", updateClass(db))
	r.Delete("/:id", deleteClass(db))
}

// getClasses godoc
// @Summary     List semua kelas
// @Description Ambil semua data kelas beserta nama wali kelas
// @Tags        Classes
// @Produce     json
// @Success     200 {object}  models.Response
// @Router      /classes [get]
func getClasses(db *sql.DB) fiber.Handler {
	return func(c *fiber.Ctx) error {
		rows, err := db.Query(`
			SELECT cl.id, cl.name, cl.grade_level, cl.homeroom_teacher_id, cl.created_at, cl.updated_at,
				t.full_name as teacher_name
			FROM classes cl
			LEFT JOIN teachers t ON cl.homeroom_teacher_id = t.id
			ORDER BY cl.grade_level, cl.name
		`)
		if err != nil {
			return c.Status(500).JSON(models.Response{Success: false, Message: err.Error()})
		}
		defer rows.Close()

		classes := []models.ClassWithTeacher{}
		for rows.Next() {
			var cl models.ClassWithTeacher
			err := rows.Scan(&cl.ID, &cl.Name, &cl.GradeLevel, &cl.HomeroomTeacherID,
				&cl.CreatedAt, &cl.UpdatedAt, &cl.HomeroomTeacherName)
			if err != nil {
				continue
			}
			classes = append(classes, cl)
		}

		return c.JSON(models.Response{Success: true, Data: classes})
	}
}

// getClass godoc
// @Summary     Detail kelas
// @Tags        Classes
// @Produce     json
// @Param       id  path      string  true  "Class UUID"
// @Success     200 {object}  models.Response
// @Failure     404 {object}  models.Response
// @Router      /classes/{id} [get]
func getClass(db *sql.DB) fiber.Handler {
	return func(c *fiber.Ctx) error {
		id := c.Params("id")

		var cl models.ClassWithTeacher
		err := db.QueryRow(`
			SELECT cl.id, cl.name, cl.grade_level, cl.homeroom_teacher_id, cl.created_at, cl.updated_at,
				t.full_name as teacher_name
			FROM classes cl
			LEFT JOIN teachers t ON cl.homeroom_teacher_id = t.id
			WHERE cl.id = $1
		`, id).Scan(&cl.ID, &cl.Name, &cl.GradeLevel, &cl.HomeroomTeacherID,
			&cl.CreatedAt, &cl.UpdatedAt, &cl.HomeroomTeacherName)

		if err == sql.ErrNoRows {
			return c.Status(404).JSON(models.Response{Success: false, Message: "Class not found"})
		}
		if err != nil {
			return c.Status(500).JSON(models.Response{Success: false, Message: err.Error()})
		}

		return c.JSON(models.Response{Success: true, Data: cl})
	}
}

// getClassStudents godoc
// @Summary     Daftar siswa dalam kelas
// @Description Ambil semua siswa yang terdaftar di kelas tertentu
// @Tags        Classes
// @Produce     json
// @Param       id  path      string  true  "Class UUID"
// @Success     200 {object}  models.Response
// @Router      /classes/{id}/students [get]
func getClassStudents(db *sql.DB) fiber.Handler {
	return func(c *fiber.Ctx) error {
		id := c.Params("id")

		rows, err := db.Query(`
			SELECT id, student_number, full_name, email, gender, date_of_birth, phone, photo_url, class_id, enrollment_date, created_at, updated_at
			FROM students WHERE class_id = $1 ORDER BY full_name
		`, id)
		if err != nil {
			return c.Status(500).JSON(models.Response{Success: false, Message: err.Error()})
		}
		defer rows.Close()

		students := []models.Student{}
		for rows.Next() {
			var s models.Student
			rows.Scan(&s.ID, &s.StudentNumber, &s.FullName, &s.Email, &s.Gender,
				&s.DateOfBirth, &s.Phone, &s.PhotoURL, &s.ClassID, &s.EnrollmentDate, &s.CreatedAt, &s.UpdatedAt)
			students = append(students, s)
		}

		return c.JSON(models.Response{Success: true, Data: students})
	}
}

// createClass godoc
// @Summary     Buat kelas baru
// @Tags        Classes
// @Accept      json
// @Produce     json
// @Param       body  body      models.CreateClassRequest  true  "Data kelas"
// @Success     201   {object}  models.Response
// @Failure     400   {object}  models.Response
// @Router      /classes [post]
func createClass(db *sql.DB) fiber.Handler {
	return func(c *fiber.Ctx) error {
		var req models.CreateClassRequest
		if err := c.BodyParser(&req); err != nil {
			return c.Status(400).JSON(models.Response{Success: false, Message: "Invalid request body"})
		}

		if strings.TrimSpace(req.Name) == "" {
			return c.Status(400).JSON(models.Response{Success: false, Message: "name is required"})
		}

		var id string
		err := db.QueryRow(`
			INSERT INTO classes (name, grade_level, homeroom_teacher_id)
			VALUES ($1, NULLIF($2,''), NULLIF($3,'')::UUID)
			RETURNING id
		`, req.Name, req.GradeLevel, req.HomeroomTeacherID).Scan(&id)

		if err != nil {
			return c.Status(500).JSON(models.Response{Success: false, Message: err.Error()})
		}

		return c.Status(201).JSON(models.Response{Success: true, Message: "Class created", Data: fiber.Map{"id": id}})
	}
}

// updateClass godoc
// @Summary     Update kelas
// @Tags        Classes
// @Accept      json
// @Produce     json
// @Param       id    path      string                     true  "Class UUID"
// @Param       body  body      models.CreateClassRequest  true  "Data yang diupdate"
// @Success     200   {object}  models.Response
// @Router      /classes/{id} [put]
func updateClass(db *sql.DB) fiber.Handler {
	return func(c *fiber.Ctx) error {
		id := c.Params("id")

		var req models.CreateClassRequest
		if err := c.BodyParser(&req); err != nil {
			return c.Status(400).JSON(models.Response{Success: false, Message: "Invalid request body"})
		}

		_, err := db.Exec(`
			UPDATE classes SET
				name = COALESCE(NULLIF($1,''), name),
				grade_level = COALESCE(NULLIF($2,''), grade_level),
				homeroom_teacher_id = COALESCE(NULLIF($3,'')::UUID, homeroom_teacher_id),
				updated_at = CURRENT_TIMESTAMP
			WHERE id = $4
		`, req.Name, req.GradeLevel, req.HomeroomTeacherID, id)

		if err != nil {
			return c.Status(500).JSON(models.Response{Success: false, Message: err.Error()})
		}

		return c.JSON(models.Response{Success: true, Message: "Class updated"})
	}
}

// deleteClass godoc
// @Summary     Hapus kelas
// @Tags        Classes
// @Produce     json
// @Param       id  path      string  true  "Class UUID"
// @Success     200 {object}  models.Response
// @Failure     404 {object}  models.Response
// @Router      /classes/{id} [delete]
func deleteClass(db *sql.DB) fiber.Handler {
	return func(c *fiber.Ctx) error {
		id := c.Params("id")

		result, err := db.Exec(`DELETE FROM classes WHERE id = $1`, id)
		if err != nil {
			return c.Status(500).JSON(models.Response{Success: false, Message: err.Error()})
		}

		rows, _ := result.RowsAffected()
		if rows == 0 {
			return c.Status(404).JSON(models.Response{Success: false, Message: "Class not found"})
		}

		return c.JSON(models.Response{Success: true, Message: "Class deleted"})
	}
}
