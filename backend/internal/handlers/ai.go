package handlers

import (
	"bytes"
	"database/sql"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"strings"

	"github.com/gofiber/fiber/v2"
)

type ChatMessage struct {
	Role    string `json:"role"`
	Content string `json:"content"`
}

type ChatRequest struct {
	Message string        `json:"message"`
	History []ChatMessage `json:"history"`
}

type GroqRequest struct {
	Model     string        `json:"model"`
	Messages  []ChatMessage `json:"messages"`
	MaxTokens int           `json:"max_tokens"`
}

type GroqResponse struct {
	Choices []struct {
		Message ChatMessage `json:"message"`
	} `json:"choices"`
	Error *struct {
		Message string `json:"message"`
	} `json:"error"`
}

func RegisterAIRoutes(router fiber.Router, db *sql.DB) {
	router.Post("/ai/chat", aiChat(db))
}

func aiChat(db *sql.DB) fiber.Handler {
	return func(c *fiber.Ctx) error {
		var req ChatRequest
		if err := c.BodyParser(&req); err != nil {
			return c.Status(400).JSON(fiber.Map{"error": "Invalid request"})
		}

		apiKey := os.Getenv("GROQ_API_KEY")
		if apiKey == "" {
			log.Println("ERROR: GROQ_API_KEY is empty")
			return c.Status(500).JSON(fiber.Map{"error": "GROQ_API_KEY not set"})
		}

		context := buildSchoolContext(db)

		systemPrompt := fmt.Sprintf(`Kamu adalah asisten AI untuk sistem manajemen Letta School.
Kamu memiliki akses ke data sekolah berikut:

%s

Tugasmu:
1. Jawab pertanyaan tentang jadwal, guru, siswa, dan kelas
2. Bantu analisis data
3. Bantu generate laporan singkat
4. Bantu admin mengisi data

Jawab dalam Bahasa Indonesia, singkat dan jelas.`, context)

		messages := []ChatMessage{
			{Role: "system", Content: systemPrompt},
		}
		messages = append(messages, req.History...)
		messages = append(messages, ChatMessage{Role: "user", Content: req.Message})

		groqReq := GroqRequest{
			Model:     "llama-3.3-70b-versatile",
			Messages:  messages,
			MaxTokens: 1024,
		}

		body, _ := json.Marshal(groqReq)
		httpReq, err := http.NewRequest("POST", "https://api.groq.com/openai/v1/chat/completions", bytes.NewBuffer(body))
		if err != nil {
			log.Printf("ERROR creating request: %v", err)
			return c.Status(500).JSON(fiber.Map{"error": "Failed to create request"})
		}
		httpReq.Header.Set("Authorization", "Bearer "+apiKey)
		httpReq.Header.Set("Content-Type", "application/json")

		client := &http.Client{}
		resp, err := client.Do(httpReq)
		if err != nil {
			log.Printf("ERROR calling Groq: %v", err)
			return c.Status(500).JSON(fiber.Map{"error": "Failed to call AI service"})
		}
		defer resp.Body.Close()

		respBody, _ := io.ReadAll(resp.Body)
		log.Printf("Groq status: %d, body: %s", resp.StatusCode, string(respBody))

		var groqResp GroqResponse
		if err := json.Unmarshal(respBody, &groqResp); err != nil {
			log.Printf("ERROR parsing response: %v", err)
			return c.Status(500).JSON(fiber.Map{"error": "Failed to parse AI response"})
		}

		if groqResp.Error != nil {
			log.Printf("Groq API error: %s", groqResp.Error.Message)
			return c.Status(500).JSON(fiber.Map{"error": groqResp.Error.Message})
		}

		if len(groqResp.Choices) == 0 {
			log.Printf("ERROR: no choices in response")
			return c.Status(500).JSON(fiber.Map{"error": "No response from AI"})
		}

		return c.JSON(fiber.Map{"reply": groqResp.Choices[0].Message.Content})
	}
}

func buildSchoolContext(db *sql.DB) string {
	var sb strings.Builder

	var totalStudents, totalTeachers, totalClasses int
	db.QueryRow("SELECT COUNT(*) FROM students").Scan(&totalStudents)
	db.QueryRow("SELECT COUNT(*) FROM teachers").Scan(&totalTeachers)
	db.QueryRow("SELECT COUNT(*) FROM classes").Scan(&totalClasses)
	sb.WriteString(fmt.Sprintf("RINGKASAN: %d siswa, %d guru, %d kelas\n\n", totalStudents, totalTeachers, totalClasses))

	rows, err := db.Query(`
		SELECT c.name, c.grade_level, COUNT(s.id) as total,
		       COALESCE(t.full_name, '-') as homeroom
		FROM classes c
		LEFT JOIN students s ON s.class_id = c.id
		LEFT JOIN teachers t ON t.id = c.homeroom_teacher_id
		GROUP BY c.id, c.name, c.grade_level, t.full_name
		ORDER BY c.name
	`)
	if err == nil {
		defer rows.Close()
		sb.WriteString("DAFTAR KELAS:\n")
		for rows.Next() {
			var name, grade, homeroom string
			var total int
			rows.Scan(&name, &grade, &total, &homeroom)
			sb.WriteString(fmt.Sprintf("- %s (%s): %d siswa, wali kelas: %s\n", name, grade, total, homeroom))
		}
		sb.WriteString("\n")
	}

	schedRows, err := db.Query(`
		SELECT c.name, cs.day_of_week, s.name, t.full_name, cs.start_time, cs.end_time
		FROM class_schedules cs
		JOIN classes c ON c.id = cs.class_id
		JOIN subjects s ON s.id = cs.subject_id
		JOIN teachers t ON t.id = cs.teacher_id
		ORDER BY c.name, cs.day_of_week, cs.start_time
		LIMIT 60
	`)
	if err == nil {
		defer schedRows.Close()
		dayNames := map[int]string{1: "Senin", 2: "Selasa", 3: "Rabu", 4: "Kamis", 5: "Jumat", 6: "Sabtu"}
		sb.WriteString("SAMPLE JADWAL:\n")
		for schedRows.Next() {
			var className, subject, teacher, startTime, endTime string
			var day int
			schedRows.Scan(&className, &day, &subject, &teacher, &startTime, &endTime)
			if len(startTime) >= 5 && len(endTime) >= 5 {
				sb.WriteString(fmt.Sprintf("- %s | %s | %s | %s-%s | %s\n",
					className, dayNames[day], subject, startTime[:5], endTime[:5], teacher))
			}
		}
	}

	return sb.String()
}