package main

import (
	"log"
	"os"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/gofiber/fiber/v2/middleware/recover"
	"github.com/joho/godotenv"

	"be_school/internal/db"
	"be_school/internal/handlers"
)

func main() {
	_ = godotenv.Load()

	database, err := db.Connect(os.Getenv("DATABASE_URL"))
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	defer func() {
		if err := database.Close(); err != nil {
			log.Printf("Error closing database: %v", err)
		}
	}()

	app := fiber.New(fiber.Config{
		AppName: "School API v1.0",
	})

	app.Use(logger.New())
	app.Use(recover.New())
	app.Use(cors.New())

	api := app.Group("/api/v1")
	handlers.RegisterAdminRoutes(api, database)
	handlers.RegisterTeacherRoutes(api, database)
	handlers.RegisterClassRoutes(api, database)
	handlers.RegisterStudentRoutes(api, database)
	handlers.RegisterSubjectRoutes(api, database)
	handlers.RegisterScheduleRoutes(api, database)
	handlers.RegisterAssignmentRoutes(api, database)
    handlers.RegisterAIRoutes(api, database)

	app.Get("/health", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{"status": "ok"})
	})

	port := os.Getenv("PORT")
	if port == "" {
		port = "3000"
	}

	log.Printf("🚀 Server running on port %s", port)
	if err := app.Listen(":" + port); err != nil {
		log.Fatalf("Server error: %v", err)
	}
}
