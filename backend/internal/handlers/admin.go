package handlers

import (
	"database/sql"
	"strings"

	"github.com/gofiber/fiber/v2"
	"golang.org/x/crypto/bcrypt"

	"be_school/internal/models"
)

func RegisterAdminRoutes(router fiber.Router, db *sql.DB) {
	r := router.Group("/admins")
	r.Get("/", getAdmins(db))
	r.Post("/", createAdmin(db))
	r.Post("/login", loginAdmin(db))
	r.Delete("/:id", deleteAdmin(db))
}

// getAdmins godoc
// @Summary     List semua admin
// @Tags        Admins
// @Produce     json
// @Success     200 {object}  models.Response
// @Router      /admins [get]
func getAdmins(db *sql.DB) fiber.Handler {
	return func(c *fiber.Ctx) error {
		rows, err := db.Query(`SELECT id, full_name, email, is_active, created_at, updated_at FROM admin_users ORDER BY full_name`)
		if err != nil {
			return c.Status(500).JSON(models.Response{Success: false, Message: err.Error()})
		}
		defer rows.Close()

		admins := []models.AdminUser{}
		for rows.Next() {
			var a models.AdminUser
			rows.Scan(&a.ID, &a.FullName, &a.Email, &a.IsActive, &a.CreatedAt, &a.UpdatedAt)
			admins = append(admins, a)
		}

		return c.JSON(models.Response{Success: true, Data: admins})
	}
}

// createAdmin godoc
// @Summary     Buat admin baru
// @Tags        Admins
// @Accept      json
// @Produce     json
// @Param       body  body      models.CreateAdminRequest  true  "Data admin"
// @Success     201   {object}  models.Response
// @Failure     409   {object}  models.Response
// @Router      /admins [post]
func createAdmin(db *sql.DB) fiber.Handler {
	return func(c *fiber.Ctx) error {
		var req models.CreateAdminRequest
		if err := c.BodyParser(&req); err != nil {
			return c.Status(400).JSON(models.Response{Success: false, Message: "Invalid request body"})
		}

		if strings.TrimSpace(req.FullName) == "" || strings.TrimSpace(req.Email) == "" || strings.TrimSpace(req.Password) == "" {
			return c.Status(400).JSON(models.Response{Success: false, Message: "full_name, email, and password are required"})
		}

		// Hash password
		hash, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
		if err != nil {
			return c.Status(500).JSON(models.Response{Success: false, Message: "Failed to hash password"})
		}

		var id string
		err = db.QueryRow(`
			INSERT INTO admin_users (full_name, email, password_hash)
			VALUES ($1, $2, $3)
			RETURNING id
		`, req.FullName, req.Email, string(hash)).Scan(&id)

		if err != nil {
			if strings.Contains(err.Error(), "unique") {
				return c.Status(409).JSON(models.Response{Success: false, Message: "Email already exists"})
			}
			return c.Status(500).JSON(models.Response{Success: false, Message: err.Error()})
		}

		return c.Status(201).JSON(models.Response{Success: true, Message: "Admin created", Data: fiber.Map{"id": id}})
	}
}

// loginAdmin godoc
// @Summary     Login admin
// @Description Autentikasi admin dengan email dan password
// @Tags        Admins
// @Accept      json
// @Produce     json
// @Param       body  body      object{email=string,password=string}  true  "Kredensial login"
// @Success     200   {object}  models.Response
// @Failure     401   {object}  models.Response
// @Failure     403   {object}  models.Response
// @Router      /admins/login [post]
func loginAdmin(db *sql.DB) fiber.Handler {
	return func(c *fiber.Ctx) error {
		var req struct {
			Email    string `json:"email"`
			Password string `json:"password"`
		}

		if err := c.BodyParser(&req); err != nil {
			return c.Status(400).JSON(models.Response{Success: false, Message: "Invalid request body"})
		}

		var admin models.AdminUser
		err := db.QueryRow(`
			SELECT id, full_name, email, password_hash, is_active FROM admin_users WHERE email = $1
		`, req.Email).Scan(&admin.ID, &admin.FullName, &admin.Email, &admin.PasswordHash, &admin.IsActive)

		if err == sql.ErrNoRows {
			return c.Status(401).JSON(models.Response{Success: false, Message: "Invalid credentials"})
		}
		if err != nil {
			return c.Status(500).JSON(models.Response{Success: false, Message: err.Error()})
		}

		if !admin.IsActive {
			return c.Status(403).JSON(models.Response{Success: false, Message: "Account is inactive"})
		}

		// Compare password
		if err := bcrypt.CompareHashAndPassword([]byte(admin.PasswordHash), []byte(req.Password)); err != nil {
			return c.Status(401).JSON(models.Response{Success: false, Message: "Invalid credentials"})
		}

		return c.JSON(models.Response{
			Success: true,
			Message: "Login successful",
			Data: fiber.Map{
				"id":        admin.ID,
				"full_name": admin.FullName,
				"email":     admin.Email,
			},
		})
	}
}

// deleteAdmin godoc
// @Summary     Hapus admin
// @Tags        Admins
// @Produce     json
// @Param       id  path      string  true  "Admin UUID"
// @Success     200 {object}  models.Response
// @Failure     404 {object}  models.Response
// @Router      /admins/{id} [delete]
func deleteAdmin(db *sql.DB) fiber.Handler {
	return func(c *fiber.Ctx) error {
		id := c.Params("id")

		result, err := db.Exec(`DELETE FROM admin_users WHERE id = $1`, id)
		if err != nil {
			return c.Status(500).JSON(models.Response{Success: false, Message: err.Error()})
		}

		rows, _ := result.RowsAffected()
		if rows == 0 {
			return c.Status(404).JSON(models.Response{Success: false, Message: "Admin not found"})
		}

		return c.JSON(models.Response{Success: true, Message: "Admin deleted"})
	}
}
