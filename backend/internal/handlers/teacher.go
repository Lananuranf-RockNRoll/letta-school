package handlers

import (
	"database/sql"
	"strings"

	"github.com/gofiber/fiber/v2"

	"be_school/internal/models"
)

func RegisterTeacherRoutes(router fiber.Router, db *sql.DB) {
	r := router.Group("/teachers")
	r.Get("/", getTeachers(db))
	r.Get("/:id", getTeacher(db))
	r.Post("/", createTeacher(db))
	r.Put("/:id", updateTeacher(db))
	r.Delete("/:id", deleteTeacher(db))
}

// getTeachers godoc
// @Summary     List semua guru
// @Description Ambil semua data guru, bisa filter by nama dan pagination
// @Tags        Teachers
// @Produce     json
// @Param       search  query     string  false  "Cari berdasarkan nama"
// @Param       page    query     int     false  "Halaman (default: 1)"
// @Param       limit   query     int     false  "Jumlah per halaman (default: 10)"
// @Success     200     {object}  models.PaginatedResponse
// @Failure     500     {object}  models.Response
// @Router      /teachers [get]
func getTeachers(db *sql.DB) fiber.Handler {
	return func(c *fiber.Ctx) error {
		search := c.Query("search", "")
		page := c.QueryInt("page", 1)
		limit := c.QueryInt("limit", 10)
		offset := (page - 1) * limit

		query := `
			SELECT id, employee_number, full_name, email, gender, date_of_birth, phone, photo_url, bio, created_at, updated_at
			FROM teachers
			WHERE ($1 = '' OR full_name ILIKE '%' || $1 || '%')
			ORDER BY full_name
			LIMIT $2 OFFSET $3
		`

		rows, err := db.Query(query, search, limit, offset)
		if err != nil {
			return c.Status(500).JSON(models.Response{Success: false, Message: err.Error()})
		}
		defer rows.Close()

		teachers := []models.Teacher{}
		for rows.Next() {
			var t models.Teacher
			err := rows.Scan(&t.ID, &t.EmployeeNumber, &t.FullName, &t.Email, &t.Gender,
				&t.DateOfBirth, &t.Phone, &t.PhotoURL, &t.Bio, &t.CreatedAt, &t.UpdatedAt)
			if err != nil {
				continue
			}
			teachers = append(teachers, t)
		}

		// Count total
		var total int
		db.QueryRow(`SELECT COUNT(*) FROM teachers WHERE ($1 = '' OR full_name ILIKE '%' || $1 || '%')`, search).Scan(&total)

		return c.JSON(models.PaginatedResponse{
			Success: true,
			Data:    teachers,
			Total:   total,
			Page:    page,
			Limit:   limit,
		})
	}
}

// getTeacher godoc
// @Summary     Detail guru
// @Description Ambil data guru berdasarkan ID
// @Tags        Teachers
// @Produce     json
// @Param       id   path      string  true  "Teacher UUID"
// @Success     200  {object}  models.Response
// @Failure     404  {object}  models.Response
// @Router      /teachers/{id} [get]
func getTeacher(db *sql.DB) fiber.Handler {
	return func(c *fiber.Ctx) error {
		id := c.Params("id")

		var t models.Teacher
		err := db.QueryRow(`
			SELECT id, employee_number, full_name, email, gender, date_of_birth, phone, photo_url, bio, created_at, updated_at
			FROM teachers WHERE id = $1
		`, id).Scan(&t.ID, &t.EmployeeNumber, &t.FullName, &t.Email, &t.Gender,
			&t.DateOfBirth, &t.Phone, &t.PhotoURL, &t.Bio, &t.CreatedAt, &t.UpdatedAt)

		if err == sql.ErrNoRows {
			return c.Status(404).JSON(models.Response{Success: false, Message: "Teacher not found"})
		}
		if err != nil {
			return c.Status(500).JSON(models.Response{Success: false, Message: err.Error()})
		}

		return c.JSON(models.Response{Success: true, Data: t})
	}
}

// createTeacher godoc
// @Summary     Buat guru baru
// @Description Tambah data guru baru ke database
// @Tags        Teachers
// @Accept      json
// @Produce     json
// @Param       body  body      models.CreateTeacherRequest  true  "Data guru"
// @Success     201   {object}  models.Response
// @Failure     400   {object}  models.Response
// @Router      /teachers [post]
func createTeacher(db *sql.DB) fiber.Handler {
	return func(c *fiber.Ctx) error {
		var req models.CreateTeacherRequest
		if err := c.BodyParser(&req); err != nil {
			return c.Status(400).JSON(models.Response{Success: false, Message: "Invalid request body"})
		}

		if strings.TrimSpace(req.FullName) == "" {
			return c.Status(400).JSON(models.Response{Success: false, Message: "full_name is required"})
		}

		var id string
		err := db.QueryRow(`
			INSERT INTO teachers (employee_number, full_name, email, gender, date_of_birth, phone, photo_url, bio)
			VALUES (NULLIF($1,''), $2, NULLIF($3,''), NULLIF($4,''), NULLIF($5,'')::DATE, NULLIF($6,''), NULLIF($7,''), NULLIF($8,''))
			RETURNING id
		`, req.EmployeeNumber, req.FullName, req.Email, req.Gender, req.DateOfBirth,
			req.Phone, req.PhotoURL, req.Bio).Scan(&id)

		if err != nil {
			return c.Status(500).JSON(models.Response{Success: false, Message: err.Error()})
		}

		return c.Status(201).JSON(models.Response{Success: true, Message: "Teacher created", Data: fiber.Map{"id": id}})
	}
}

// updateTeacher godoc
// @Summary     Update guru
// @Description Update data guru berdasarkan ID
// @Tags        Teachers
// @Accept      json
// @Produce     json
// @Param       id    path      string                       true  "Teacher UUID"
// @Param       body  body      models.UpdateTeacherRequest  true  "Data yang diupdate"
// @Success     200   {object}  models.Response
// @Failure     400   {object}  models.Response
// @Router      /teachers/{id} [put]
func updateTeacher(db *sql.DB) fiber.Handler {
	return func(c *fiber.Ctx) error {
		id := c.Params("id")

		var req models.UpdateTeacherRequest
		if err := c.BodyParser(&req); err != nil {
			return c.Status(400).JSON(models.Response{Success: false, Message: "Invalid request body"})
		}

		_, err := db.Exec(`
			UPDATE teachers SET
				full_name = COALESCE(NULLIF($1,''), full_name),
				email = COALESCE(NULLIF($2,''), email),
				gender = COALESCE(NULLIF($3,''), gender),
				date_of_birth = COALESCE(NULLIF($4,'')::DATE, date_of_birth),
				phone = COALESCE(NULLIF($5,''), phone),
				photo_url = COALESCE(NULLIF($6,''), photo_url),
				bio = COALESCE(NULLIF($7,''), bio),
				updated_at = CURRENT_TIMESTAMP
			WHERE id = $8
		`, req.FullName, req.Email, req.Gender, req.DateOfBirth, req.Phone, req.PhotoURL, req.Bio, id)

		if err != nil {
			return c.Status(500).JSON(models.Response{Success: false, Message: err.Error()})
		}

		return c.JSON(models.Response{Success: true, Message: "Teacher updated"})
	}
}

// deleteTeacher godoc
// @Summary     Hapus guru
// @Description Hapus data guru berdasarkan ID
// @Tags        Teachers
// @Produce     json
// @Param       id  path      string  true  "Teacher UUID"
// @Success     200 {object}  models.Response
// @Failure     404 {object}  models.Response
// @Router      /teachers/{id} [delete]
func deleteTeacher(db *sql.DB) fiber.Handler {
	return func(c *fiber.Ctx) error {
		id := c.Params("id")

		result, err := db.Exec(`DELETE FROM teachers WHERE id = $1`, id)
		if err != nil {
			return c.Status(500).JSON(models.Response{Success: false, Message: err.Error()})
		}

		rows, _ := result.RowsAffected()
		if rows == 0 {
			return c.Status(404).JSON(models.Response{Success: false, Message: "Teacher not found"})
		}

		return c.JSON(models.Response{Success: true, Message: "Teacher deleted"})
	}
}
