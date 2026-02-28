package handlers

import (
	"database/sql"
	"strings"

	"github.com/gofiber/fiber/v2"

	"be_school/internal/models"
)

func RegisterSubjectRoutes(router fiber.Router, db *sql.DB) {
	r := router.Group("/subjects")
	r.Get("/", getSubjects(db))
	r.Get("/:id", getSubject(db))
	r.Post("/", createSubject(db))
	r.Put("/:id", updateSubject(db))
	r.Delete("/:id", deleteSubject(db))
}

// getSubjects godoc
// @Summary     List semua mata pelajaran
// @Tags        Subjects
// @Produce     json
// @Success     200 {object}  models.Response
// @Router      /subjects [get]
func getSubjects(db *sql.DB) fiber.Handler {
	return func(c *fiber.Ctx) error {
		rows, err := db.Query(`SELECT id, name, description, created_at FROM subjects ORDER BY name`)
		if err != nil {
			return c.Status(500).JSON(models.Response{Success: false, Message: err.Error()})
		}
		defer rows.Close()

		subjects := []models.Subject{}
		for rows.Next() {
			var s models.Subject
			rows.Scan(&s.ID, &s.Name, &s.Description, &s.CreatedAt)
			subjects = append(subjects, s)
		}

		return c.JSON(models.Response{Success: true, Data: subjects})
	}
}

// getSubject godoc
// @Summary     Detail mata pelajaran
// @Tags        Subjects
// @Produce     json
// @Param       id  path      string  true  "Subject UUID"
// @Success     200 {object}  models.Response
// @Failure     404 {object}  models.Response
// @Router      /subjects/{id} [get]
func getSubject(db *sql.DB) fiber.Handler {
	return func(c *fiber.Ctx) error {
		id := c.Params("id")

		var s models.Subject
		err := db.QueryRow(`SELECT id, name, description, created_at FROM subjects WHERE id = $1`, id).
			Scan(&s.ID, &s.Name, &s.Description, &s.CreatedAt)

		if err == sql.ErrNoRows {
			return c.Status(404).JSON(models.Response{Success: false, Message: "Subject not found"})
		}
		if err != nil {
			return c.Status(500).JSON(models.Response{Success: false, Message: err.Error()})
		}

		return c.JSON(models.Response{Success: true, Data: s})
	}
}

// createSubject godoc
// @Summary     Buat mata pelajaran baru
// @Tags        Subjects
// @Accept      json
// @Produce     json
// @Param       body  body      models.CreateSubjectRequest  true  "Data mata pelajaran"
// @Success     201   {object}  models.Response
// @Failure     409   {object}  models.Response
// @Router      /subjects [post]
func createSubject(db *sql.DB) fiber.Handler {
	return func(c *fiber.Ctx) error {
		var req models.CreateSubjectRequest
		if err := c.BodyParser(&req); err != nil {
			return c.Status(400).JSON(models.Response{Success: false, Message: "Invalid request body"})
		}

		if strings.TrimSpace(req.Name) == "" {
			return c.Status(400).JSON(models.Response{Success: false, Message: "name is required"})
		}

		var id string
		err := db.QueryRow(`
			INSERT INTO subjects (name, description) VALUES ($1, NULLIF($2,'')) RETURNING id
		`, req.Name, req.Description).Scan(&id)

		if err != nil {
			if strings.Contains(err.Error(), "unique") {
				return c.Status(409).JSON(models.Response{Success: false, Message: "Subject name already exists"})
			}
			return c.Status(500).JSON(models.Response{Success: false, Message: err.Error()})
		}

		return c.Status(201).JSON(models.Response{Success: true, Message: "Subject created", Data: fiber.Map{"id": id}})
	}
}

// updateSubject godoc
// @Summary     Update mata pelajaran
// @Tags        Subjects
// @Accept      json
// @Produce     json
// @Param       id    path      string                       true  "Subject UUID"
// @Param       body  body      models.CreateSubjectRequest  true  "Data yang diupdate"
// @Success     200   {object}  models.Response
// @Router      /subjects/{id} [put]
func updateSubject(db *sql.DB) fiber.Handler {
	return func(c *fiber.Ctx) error {
		id := c.Params("id")

		var req models.CreateSubjectRequest
		if err := c.BodyParser(&req); err != nil {
			return c.Status(400).JSON(models.Response{Success: false, Message: "Invalid request body"})
		}

		_, err := db.Exec(`
			UPDATE subjects SET
				name = COALESCE(NULLIF($1,''), name),
				description = COALESCE(NULLIF($2,''), description)
			WHERE id = $3
		`, req.Name, req.Description, id)

		if err != nil {
			return c.Status(500).JSON(models.Response{Success: false, Message: err.Error()})
		}

		return c.JSON(models.Response{Success: true, Message: "Subject updated"})
	}
}

// deleteSubject godoc
// @Summary     Hapus mata pelajaran
// @Tags        Subjects
// @Produce     json
// @Param       id  path      string  true  "Subject UUID"
// @Success     200 {object}  models.Response
// @Failure     404 {object}  models.Response
// @Router      /subjects/{id} [delete]
func deleteSubject(db *sql.DB) fiber.Handler {
	return func(c *fiber.Ctx) error {
		id := c.Params("id")

		result, err := db.Exec(`DELETE FROM subjects WHERE id = $1`, id)
		if err != nil {
			return c.Status(500).JSON(models.Response{Success: false, Message: err.Error()})
		}

		rows, _ := result.RowsAffected()
		if rows == 0 {
			return c.Status(404).JSON(models.Response{Success: false, Message: "Subject not found"})
		}

		return c.JSON(models.Response{Success: true, Message: "Subject deleted"})
	}
}
