package handlers

import (
	"database/sql"

	"github.com/gofiber/fiber/v2"

	"be_school/internal/models"
)

func RegisterScheduleRoutes(router fiber.Router, db *sql.DB) {
	r := router.Group("/schedules")
	r.Get("/", getSchedules(db))
	r.Get("/:id", getSchedule(db))
	r.Post("/", createSchedule(db))
	r.Put("/:id", updateSchedule(db))
	r.Delete("/:id", deleteSchedule(db))
}

func RegisterAssignmentRoutes(router fiber.Router, db *sql.DB) {
	r := router.Group("/assignments")
	r.Get("/", getAssignments(db))
	r.Post("/", createAssignment(db))
	r.Delete("/:id", deleteAssignment(db))
}

// =====================
// SCHEDULES
// =====================

// getSchedules godoc
// @Summary     List semua jadwal
// @Description Ambil jadwal pelajaran, bisa filter by kelas atau guru
// @Tags        Schedules
// @Produce     json
// @Param       class_id    query  string  false  "Filter by Class UUID"
// @Param       teacher_id  query  string  false  "Filter by Teacher UUID"
// @Success     200 {object}  models.Response
// @Router      /schedules [get]
func getSchedules(db *sql.DB) fiber.Handler {
	return func(c *fiber.Ctx) error {
		classID := c.Query("class_id", "")
		teacherID := c.Query("teacher_id", "")

		rows, err := db.Query(`
			SELECT cs.id, cs.class_id, cs.subject_id, cs.teacher_id, cs.day_of_week, 
				cs.start_time, cs.end_time, cs.created_at, cs.updated_at,
				cl.name, s.name, t.full_name
			FROM class_schedules cs
			JOIN classes cl ON cs.class_id = cl.id
			JOIN subjects s ON cs.subject_id = s.id
			JOIN teachers t ON cs.teacher_id = t.id
			WHERE ($1 = '' OR cs.class_id::TEXT = $1)
			AND ($2 = '' OR cs.teacher_id::TEXT = $2)
			ORDER BY cs.day_of_week, cs.start_time
		`, classID, teacherID)

		if err != nil {
			return c.Status(500).JSON(models.Response{Success: false, Message: err.Error()})
		}
		defer rows.Close()

		schedules := []models.ClassScheduleDetail{}
		for rows.Next() {
			var s models.ClassScheduleDetail
			rows.Scan(&s.ID, &s.ClassID, &s.SubjectID, &s.TeacherID, &s.DayOfWeek,
				&s.StartTime, &s.EndTime, &s.CreatedAt, &s.UpdatedAt,
				&s.ClassName, &s.SubjectName, &s.TeacherName)
			schedules = append(schedules, s)
		}

		return c.JSON(models.Response{Success: true, Data: schedules})
	}
}

// getSchedule godoc
// @Summary     Detail jadwal
// @Tags        Schedules
// @Produce     json
// @Param       id  path      string  true  "Schedule UUID"
// @Success     200 {object}  models.Response
// @Failure     404 {object}  models.Response
// @Router      /schedules/{id} [get]
func getSchedule(db *sql.DB) fiber.Handler {
	return func(c *fiber.Ctx) error {
		id := c.Params("id")

		var s models.ClassScheduleDetail
		err := db.QueryRow(`
			SELECT cs.id, cs.class_id, cs.subject_id, cs.teacher_id, cs.day_of_week, 
				cs.start_time, cs.end_time, cs.created_at, cs.updated_at,
				cl.name, sub.name, t.full_name
			FROM class_schedules cs
			JOIN classes cl ON cs.class_id = cl.id
			JOIN subjects sub ON cs.subject_id = sub.id
			JOIN teachers t ON cs.teacher_id = t.id
			WHERE cs.id = $1
		`, id).Scan(&s.ID, &s.ClassID, &s.SubjectID, &s.TeacherID, &s.DayOfWeek,
			&s.StartTime, &s.EndTime, &s.CreatedAt, &s.UpdatedAt,
			&s.ClassName, &s.SubjectName, &s.TeacherName)

		if err == sql.ErrNoRows {
			return c.Status(404).JSON(models.Response{Success: false, Message: "Schedule not found"})
		}
		if err != nil {
			return c.Status(500).JSON(models.Response{Success: false, Message: err.Error()})
		}

		return c.JSON(models.Response{Success: true, Data: s})
	}
}

// createSchedule godoc
// @Summary     Buat jadwal baru
// @Description day_of_week: 1=Senin, 2=Selasa, ..., 7=Minggu
// @Tags        Schedules
// @Accept      json
// @Produce     json
// @Param       body  body      models.CreateScheduleRequest  true  "Data jadwal"
// @Success     201   {object}  models.Response
// @Failure     400   {object}  models.Response
// @Router      /schedules [post]
func createSchedule(db *sql.DB) fiber.Handler {
	return func(c *fiber.Ctx) error {
		var req models.CreateScheduleRequest
		if err := c.BodyParser(&req); err != nil {
			return c.Status(400).JSON(models.Response{Success: false, Message: "Invalid request body"})
		}

		if req.ClassID == "" || req.SubjectID == "" || req.TeacherID == "" {
			return c.Status(400).JSON(models.Response{Success: false, Message: "class_id, subject_id, and teacher_id are required"})
		}

		if req.DayOfWeek < 1 || req.DayOfWeek > 7 {
			return c.Status(400).JSON(models.Response{Success: false, Message: "day_of_week must be between 1 and 7"})
		}

		var id string
		err := db.QueryRow(`
			INSERT INTO class_schedules (class_id, subject_id, teacher_id, day_of_week, start_time, end_time)
			VALUES ($1::UUID, $2::UUID, $3::UUID, $4, $5::TIME, $6::TIME)
			RETURNING id
		`, req.ClassID, req.SubjectID, req.TeacherID, req.DayOfWeek, req.StartTime, req.EndTime).Scan(&id)

		if err != nil {
			return c.Status(500).JSON(models.Response{Success: false, Message: err.Error()})
		}

		return c.Status(201).JSON(models.Response{Success: true, Message: "Schedule created", Data: fiber.Map{"id": id}})
	}
}

// updateSchedule godoc
// @Summary     Update jadwal
// @Tags        Schedules
// @Accept      json
// @Produce     json
// @Param       id    path      string                        true  "Schedule UUID"
// @Param       body  body      models.CreateScheduleRequest  true  "Data yang diupdate"
// @Success     200   {object}  models.Response
// @Router      /schedules/{id} [put]
func updateSchedule(db *sql.DB) fiber.Handler {
	return func(c *fiber.Ctx) error {
		id := c.Params("id")

		var req models.CreateScheduleRequest
		if err := c.BodyParser(&req); err != nil {
			return c.Status(400).JSON(models.Response{Success: false, Message: "Invalid request body"})
		}

		_, err := db.Exec(`
			UPDATE class_schedules SET
				day_of_week = COALESCE(NULLIF($1, 0), day_of_week),
				start_time = COALESCE(NULLIF($2,'')::TIME, start_time),
				end_time = COALESCE(NULLIF($3,'')::TIME, end_time),
				updated_at = CURRENT_TIMESTAMP
			WHERE id = $4
		`, req.DayOfWeek, req.StartTime, req.EndTime, id)

		if err != nil {
			return c.Status(500).JSON(models.Response{Success: false, Message: err.Error()})
		}

		return c.JSON(models.Response{Success: true, Message: "Schedule updated"})
	}
}

// deleteSchedule godoc
// @Summary     Hapus jadwal
// @Tags        Schedules
// @Produce     json
// @Param       id  path      string  true  "Schedule UUID"
// @Success     200 {object}  models.Response
// @Failure     404 {object}  models.Response
// @Router      /schedules/{id} [delete]
func deleteSchedule(db *sql.DB) fiber.Handler {
	return func(c *fiber.Ctx) error {
		id := c.Params("id")

		result, err := db.Exec(`DELETE FROM class_schedules WHERE id = $1`, id)
		if err != nil {
			return c.Status(500).JSON(models.Response{Success: false, Message: err.Error()})
		}

		rows, _ := result.RowsAffected()
		if rows == 0 {
			return c.Status(404).JSON(models.Response{Success: false, Message: "Schedule not found"})
		}

		return c.JSON(models.Response{Success: true, Message: "Schedule deleted"})
	}
}

// =====================
// ASSIGNMENTS
// =====================

// getAssignments godoc
// @Summary     List semua penugasan guru
// @Description Penugasan = guru mengajar mapel tertentu di kelas tertentu
// @Tags        Assignments
// @Produce     json
// @Param       teacher_id  query  string  false  "Filter by Teacher UUID"
// @Param       class_id    query  string  false  "Filter by Class UUID"
// @Success     200 {object}  models.Response
// @Router      /assignments [get]
func getAssignments(db *sql.DB) fiber.Handler {
	return func(c *fiber.Ctx) error {
		teacherID := c.Query("teacher_id", "")
		classID := c.Query("class_id", "")

		rows, err := db.Query(`
			SELECT ta.id, ta.teacher_id, ta.class_id, ta.subject_id, ta.created_at,
				t.full_name, cl.name, s.name
			FROM teacher_assignments ta
			JOIN teachers t ON ta.teacher_id = t.id
			JOIN classes cl ON ta.class_id = cl.id
			JOIN subjects s ON ta.subject_id = s.id
			WHERE ($1 = '' OR ta.teacher_id::TEXT = $1)
			AND ($2 = '' OR ta.class_id::TEXT = $2)
			ORDER BY t.full_name
		`, teacherID, classID)

		if err != nil {
			return c.Status(500).JSON(models.Response{Success: false, Message: err.Error()})
		}
		defer rows.Close()

		assignments := []models.TeacherAssignmentDetail{}
		for rows.Next() {
			var a models.TeacherAssignmentDetail
			rows.Scan(&a.ID, &a.TeacherID, &a.ClassID, &a.SubjectID, &a.CreatedAt,
				&a.TeacherName, &a.ClassName, &a.SubjectName)
			assignments = append(assignments, a)
		}

		return c.JSON(models.Response{Success: true, Data: assignments})
	}
}

// createAssignment godoc
// @Summary     Buat penugasan guru baru
// @Tags        Assignments
// @Accept      json
// @Produce     json
// @Param       body  body      models.CreateAssignmentRequest  true  "Data penugasan"
// @Success     201   {object}  models.Response
// @Failure     409   {object}  models.Response
// @Router      /assignments [post]
func createAssignment(db *sql.DB) fiber.Handler {
	return func(c *fiber.Ctx) error {
		var req models.CreateAssignmentRequest
		if err := c.BodyParser(&req); err != nil {
			return c.Status(400).JSON(models.Response{Success: false, Message: "Invalid request body"})
		}

		if req.TeacherID == "" || req.ClassID == "" || req.SubjectID == "" {
			return c.Status(400).JSON(models.Response{Success: false, Message: "teacher_id, class_id, subject_id are required"})
		}

		var id string
		err := db.QueryRow(`
			INSERT INTO teacher_assignments (teacher_id, class_id, subject_id)
			VALUES ($1::UUID, $2::UUID, $3::UUID)
			RETURNING id
		`, req.TeacherID, req.ClassID, req.SubjectID).Scan(&id)

		if err != nil {
			if err.Error() != "" && (len(err.Error()) > 6 && err.Error()[:6] == "ERROR:") {
				return c.Status(409).JSON(models.Response{Success: false, Message: "Assignment already exists"})
			}
			return c.Status(500).JSON(models.Response{Success: false, Message: err.Error()})
		}

		return c.Status(201).JSON(models.Response{Success: true, Message: "Assignment created", Data: fiber.Map{"id": id}})
	}
}

// deleteAssignment godoc
// @Summary     Hapus penugasan guru
// @Tags        Assignments
// @Produce     json
// @Param       id  path      string  true  "Assignment UUID"
// @Success     200 {object}  models.Response
// @Failure     404 {object}  models.Response
// @Router      /assignments/{id} [delete]
func deleteAssignment(db *sql.DB) fiber.Handler {
	return func(c *fiber.Ctx) error {
		id := c.Params("id")

		result, err := db.Exec(`DELETE FROM teacher_assignments WHERE id = $1`, id)
		if err != nil {
			return c.Status(500).JSON(models.Response{Success: false, Message: err.Error()})
		}

		rows, _ := result.RowsAffected()
		if rows == 0 {
			return c.Status(404).JSON(models.Response{Success: false, Message: "Assignment not found"})
		}

		return c.JSON(models.Response{Success: true, Message: "Assignment deleted"})
	}
}
