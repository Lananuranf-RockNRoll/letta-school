package handlers

import (
    "bytes"
	"context"
	"database/sql"
	"os"
	"log"

	"github.com/cloudinary/cloudinary-go/v2"
	"github.com/cloudinary/cloudinary-go/v2/api/uploader"
	"github.com/gofiber/fiber/v2"
)

func RegisterUploadRoutes(router fiber.Router, db *sql.DB) {
	router.Post("/upload/teacher/:id", uploadTeacherPhoto(db))
	router.Post("/upload/student/:id", uploadStudentPhoto(db))
}

func uploadToCloudinary(fileBytes []byte, folder string) (string, error) {
    cld, err := cloudinary.NewFromParams(
        os.Getenv("CLOUDINARY_CLOUD_NAME"),
        os.Getenv("CLOUDINARY_API_KEY"),
        os.Getenv("CLOUDINARY_API_SECRET"),
    )
    if err != nil {
        return "", err
    }

    ctx := context.Background()
    resp, err := cld.Upload.Upload(ctx, bytes.NewReader(fileBytes), uploader.UploadParams{
        Folder: "letta-school/" + folder,
    })
    if err != nil {
        return "", err
    }

    return resp.SecureURL, nil
}

func uploadTeacherPhoto(db *sql.DB) fiber.Handler {
	return func(c *fiber.Ctx) error {
		id := c.Params("id")

		file, err := c.FormFile("photo")
		if err != nil {
			return c.Status(400).JSON(fiber.Map{"error": "No file uploaded"})
		}

		f, err := file.Open()
		if err != nil {
			return c.Status(500).JSON(fiber.Map{"error": "Failed to open file"})
		}
		defer f.Close()

		buf := make([]byte, file.Size)
		f.Read(buf)

		url, err := uploadToCloudinary(buf, "teachers")
		if err != nil {
			return c.Status(500).JSON(fiber.Map{"error": "Failed to upload: " + err.Error()})
		}

		_, err = db.Exec(`UPDATE teachers SET photo_url = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2`, url, id)
		if err != nil {
			return c.Status(500).JSON(fiber.Map{"error": "Failed to update photo"})
		}

		return c.JSON(fiber.Map{"success": true, "photo_url": url})
	}
}

func uploadStudentPhoto(db *sql.DB) fiber.Handler {
	return func(c *fiber.Ctx) error {
		id := c.Params("id")

		file, err := c.FormFile("photo")
		if err != nil {
			return c.Status(400).JSON(fiber.Map{"error": "No file uploaded"})
		}

		f, err := file.Open()
		if err != nil {
			return c.Status(500).JSON(fiber.Map{"error": "Failed to open file"})
		}
		defer f.Close()

		buf := make([]byte, file.Size)
		f.Read(buf)

		url, err := uploadToCloudinary(buf, "students")
		if err != nil {
		    log.Printf("Cloudinary upload error: %v", err)
			return c.Status(500).JSON(fiber.Map{"error": "Failed to upload: " + err.Error()})
		}

		_, err = db.Exec(`UPDATE students SET photo_url = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2`, url, id)
		if err != nil {
			return c.Status(500).JSON(fiber.Map{"error": "Failed to update photo"})
		}

		return c.JSON(fiber.Map{"success": true, "photo_url": url})
	}
}