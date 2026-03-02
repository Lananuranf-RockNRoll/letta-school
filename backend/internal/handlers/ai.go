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
	"sync"

	"github.com/gofiber/fiber/v2"
)

// ── Types ────────────────────────────────────────────────────────────────────

type ChatMessage struct {
	Role       string      `json:"role"`
	Content    interface{} `json:"content"`
	ToolCallID string      `json:"tool_call_id,omitempty"`
	Name       string      `json:"name,omitempty"`
}

type ChatRequest struct {
	SessionID string      `json:"session_id"`
	Message   string      `json:"message"`
	History   []SimpleMSG `json:"history"`
}

type SimpleMSG struct {
	Role    string `json:"role"`
	Content string `json:"content"`
}

type ToolCall struct {
	ID       string `json:"id"`
	Type     string `json:"type"`
	Function struct {
		Name      string `json:"name"`
		Arguments string `json:"arguments"`
	} `json:"function"`
}

type GroqMessage struct {
	Role       string     `json:"role"`
	Content    *string    `json:"content"`
	ToolCalls  []ToolCall `json:"tool_calls,omitempty"`
	ToolCallID string     `json:"tool_call_id,omitempty"`
	Name       string     `json:"name,omitempty"`
}

type GroqRequest struct {
	Model     string        `json:"model"`
	Messages  []GroqMessage `json:"messages"`
	Tools     []Tool        `json:"tools,omitempty"`
	MaxTokens int           `json:"max_tokens"`
}

type GroqResponse struct {
	Choices []struct {
		Message   GroqMessage `json:"message"`
		FinishReason string   `json:"finish_reason"`
	} `json:"choices"`
	Error *struct {
		Message string `json:"message"`
	} `json:"error"`
}

type Tool struct {
	Type     string   `json:"type"`
	Function ToolFunc `json:"function"`
}

type ToolFunc struct {
	Name        string                 `json:"name"`
	Description string                 `json:"description"`
	Parameters  map[string]interface{} `json:"parameters"`
}

// ── Session Memory ───────────────────────────────────────────────────────────

var (
	sessions   = make(map[string][]GroqMessage)
	sessionsMu sync.Mutex
)

func getSession(id string) []GroqMessage {
	sessionsMu.Lock()
	defer sessionsMu.Unlock()
	return sessions[id]
}

func setSession(id string, msgs []GroqMessage) {
	sessionsMu.Lock()
	defer sessionsMu.Unlock()
	// Batasi max 30 pesan per session
	if len(msgs) > 30 {
		msgs = msgs[len(msgs)-30:]
	}
	sessions[id] = msgs
}

// ── Tools Definition ─────────────────────────────────────────────────────────

func getTools() []Tool {
	str := "string"
	_ = str
	return []Tool{
		{
			Type: "function",
			Function: ToolFunc{
				Name:        "query_students",
				Description: "Ambil daftar siswa dari database. Bisa filter by nama atau kelas.",
				Parameters: map[string]interface{}{
					"type": "object",
					"properties": map[string]interface{}{
						"search":     map[string]string{"type": "string", "description": "Nama siswa (opsional)"},
						"class_name": map[string]string{"type": "string", "description": "Nama kelas seperti X-A (opsional)"},
					},
					"required": []string{},
				},
			},
		},
		{
			Type: "function",
			Function: ToolFunc{
				Name:        "query_teachers",
				Description: "Ambil daftar guru dari database. Bisa filter by nama.",
				Parameters: map[string]interface{}{
					"type": "object",
					"properties": map[string]interface{}{
						"search": map[string]string{"type": "string", "description": "Nama guru (opsional)"},
					},
					"required": []string{},
				},
			},
		},
		{
			Type: "function",
			Function: ToolFunc{
				Name:        "query_classes",
				Description: "Ambil daftar kelas beserta jumlah siswa dan wali kelas.",
				Parameters: map[string]interface{}{
					"type":       "object",
					"properties": map[string]interface{}{},
					"required":   []string{},
				},
			},
		},
		{
			Type: "function",
			Function: ToolFunc{
				Name:        "query_schedules",
				Description: "Ambil jadwal pelajaran. Bisa filter by nama kelas dan/atau hari.",
				Parameters: map[string]interface{}{
					"type": "object",
					"properties": map[string]interface{}{
						"class_name": map[string]string{"type": "string", "description": "Nama kelas seperti X-A"},
						"day":        map[string]string{"type": "string", "description": "Hari: Senin/Selasa/Rabu/Kamis/Jumat"},
					},
					"required": []string{},
				},
			},
		},
		{
			Type: "function",
			Function: ToolFunc{
				Name:        "get_statistics",
				Description: "Ambil statistik sekolah: total siswa, guru, kelas, dan ringkasan.",
				Parameters: map[string]interface{}{
					"type":       "object",
					"properties": map[string]interface{}{},
					"required":   []string{},
				},
			},
		},
	}
}

// ── Tool Execution ───────────────────────────────────────────────────────────

func executeTool(name string, args map[string]interface{}, db *sql.DB) string {
	switch name {
	case "query_students":
		search, _ := args["search"].(string)
		className, _ := args["class_name"].(string)
		rows, err := db.Query(`
			SELECT s.full_name, s.student_number, c.name, s.gender, s.email, s.phone
			FROM students s
			LEFT JOIN classes c ON s.class_id = c.id
			WHERE ($1 = '' OR s.full_name ILIKE '%' || $1 || '%')
			AND ($2 = '' OR c.name ILIKE '%' || $2 || '%')
			ORDER BY s.full_name LIMIT 20
		`, search, className)
		if err != nil {
			return "Error mengambil data siswa: " + err.Error()
		}
		defer rows.Close()
		var result strings.Builder
		result.WriteString("DATA SISWA:\n")
		count := 0
		for rows.Next() {
			var name, number, class, gender, email, phone string
			rows.Scan(&name, &number, &class, &gender, &email, &phone)
			result.WriteString(fmt.Sprintf("- %s (%s) | Kelas: %s | %s | %s | %s\n", name, number, class, gender, email, phone))
			count++
		}
		if count == 0 {
			return "Tidak ada siswa ditemukan."
		}
		result.WriteString(fmt.Sprintf("Total: %d siswa ditampilkan", count))
		return result.String()

	case "query_teachers":
		search, _ := args["search"].(string)
		rows, err := db.Query(`
			SELECT full_name, employee_number, email, phone, gender
			FROM teachers
			WHERE ($1 = '' OR full_name ILIKE '%' || $1 || '%')
			ORDER BY full_name LIMIT 20
		`, search)
		if err != nil {
			return "Error mengambil data guru: " + err.Error()
		}
		defer rows.Close()
		var result strings.Builder
		result.WriteString("DATA GURU:\n")
		count := 0
		for rows.Next() {
			var name, number, email, phone, gender string
			rows.Scan(&name, &number, &email, &phone, &gender)
			result.WriteString(fmt.Sprintf("- %s (%s) | %s | %s | %s\n", name, number, gender, email, phone))
			count++
		}
		if count == 0 {
			return "Tidak ada guru ditemukan."
		}
		result.WriteString(fmt.Sprintf("Total: %d guru ditampilkan", count))
		return result.String()

	case "query_classes":
		rows, err := db.Query(`
			SELECT c.name, c.grade_level, COUNT(s.id), COALESCE(t.full_name, '-')
			FROM classes c
			LEFT JOIN students s ON s.class_id = c.id
			LEFT JOIN teachers t ON t.id = c.homeroom_teacher_id
			GROUP BY c.id, c.name, c.grade_level, t.full_name
			ORDER BY c.name
		`)
		if err != nil {
			return "Error mengambil data kelas: " + err.Error()
		}
		defer rows.Close()
		var result strings.Builder
		result.WriteString("DATA KELAS:\n")
		for rows.Next() {
			var name, grade, homeroom string
			var total int
			rows.Scan(&name, &grade, &total, &homeroom)
			result.WriteString(fmt.Sprintf("- %s (Kelas %s): %d siswa, Wali Kelas: %s\n", name, grade, total, homeroom))
		}
		return result.String()

	case "query_schedules":
		className, _ := args["class_name"].(string)
		day, _ := args["day"].(string)
		dayMap := map[string]int{"senin": 1, "selasa": 2, "rabu": 3, "kamis": 4, "jumat": 5}
		dayNum := 0
		if day != "" {
			dayNum = dayMap[strings.ToLower(day)]
		}
		rows, err := db.Query(`
			SELECT c.name, cs.day_of_week, s.name, t.full_name, cs.start_time, cs.end_time
			FROM class_schedules cs
			JOIN classes c ON c.id = cs.class_id
			JOIN subjects s ON s.id = cs.subject_id
			JOIN teachers t ON t.id = cs.teacher_id
			WHERE ($1 = '' OR c.name ILIKE '%' || $1 || '%')
			AND ($2 = 0 OR cs.day_of_week = $2)
			ORDER BY c.name, cs.day_of_week, cs.start_time
			LIMIT 50
		`, className, dayNum)
		if err != nil {
			return "Error mengambil jadwal: " + err.Error()
		}
		defer rows.Close()
		dayNames := map[int]string{1: "Senin", 2: "Selasa", 3: "Rabu", 4: "Kamis", 5: "Jumat"}
		var result strings.Builder
		result.WriteString("JADWAL PELAJARAN:\n")
		count := 0
		for rows.Next() {
			var cName, subject, teacher, start, end string
			var d int
			rows.Scan(&cName, &d, &subject, &teacher, &start, &end)
			if len(start) >= 5 && len(end) >= 5 {
				result.WriteString(fmt.Sprintf("- %s | %s | %s | %s-%s | %s\n",
					cName, dayNames[d], subject, start[:5], end[:5], teacher))
				count++
			}
		}
		if count == 0 {
			return "Tidak ada jadwal ditemukan."
		}
		return result.String()

	case "get_statistics":
		var totalStudents, totalTeachers, totalClasses int
		db.QueryRow("SELECT COUNT(*) FROM students").Scan(&totalStudents)
		db.QueryRow("SELECT COUNT(*) FROM teachers").Scan(&totalTeachers)
		db.QueryRow("SELECT COUNT(*) FROM classes").Scan(&totalClasses)

		// Kelas dengan siswa terbanyak
		var topClass string
		var topCount int
		db.QueryRow(`
			SELECT c.name, COUNT(s.id)
			FROM classes c LEFT JOIN students s ON s.class_id = c.id
			GROUP BY c.id, c.name ORDER BY COUNT(s.id) DESC LIMIT 1
		`).Scan(&topClass, &topCount)

		return fmt.Sprintf(`STATISTIK LETTA SCHOOL:
- Total Siswa: %d
- Total Guru: %d
- Total Kelas: %d
- Kelas terbanyak siswa: %s (%d siswa)`, totalStudents, totalTeachers, totalClasses, topClass, topCount)
	}

	return "Tool tidak dikenal: " + name
}

// ── Main Handler ─────────────────────────────────────────────────────────────

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
			return c.Status(500).JSON(fiber.Map{"error": "GROQ_API_KEY not set"})
		}

		// System prompt Shinra
		systemContent := `Kamu adalah Shinra, AI Agent profesional untuk sistem manajemen Letta School.

IDENTITAS:
- Nama: Shinra
- Peran: AI Agent Manajemen Sekolah
- Karakter: Formal, profesional, akurat, dan efisien

KEMAMPUAN:
- Mengakses data real-time dari database sekolah menggunakan tools
- Menjawab pertanyaan tentang siswa, guru, kelas, dan jadwal
- Menganalisis data dan memberikan insight
- Menghasilkan laporan ringkas

INSTRUKSI:
- Selalu gunakan tools untuk mengambil data terbaru sebelum menjawab
- Jawab dalam Bahasa Indonesia yang formal dan profesional
- Sertakan data spesifik dalam jawaban
- Jika diminta analisis, berikan insight yang berguna
- Perkenalkan diri sebagai "Shinra" jika ditanya identitas`

		// Ambil session memory
		sessionID := req.SessionID
		if sessionID == "" {
			sessionID = "default"
		}
		history := getSession(sessionID)

		// Build messages
		sysContent := systemContent
		messages := []GroqMessage{
			{Role: "system", Content: &sysContent},
		}
		messages = append(messages, history...)

		// Tambah pesan user baru
		userContent := req.Message
		messages = append(messages, GroqMessage{Role: "user", Content: &userContent})

		// Agentic loop — max 5 iterasi
		for i := 0; i < 5; i++ {
			groqReq := GroqRequest{
				Model:     "llama-3.3-70b-versatile",
				Messages:  messages,
				Tools:     getTools(),
				MaxTokens: 1024,
			}

			body, _ := json.Marshal(groqReq)
			httpReq, _ := http.NewRequest("POST", "https://api.groq.com/openai/v1/chat/completions", bytes.NewBuffer(body))
			httpReq.Header.Set("Authorization", "Bearer "+apiKey)
			httpReq.Header.Set("Content-Type", "application/json")

			resp, err := (&http.Client{}).Do(httpReq)
			if err != nil {
				return c.Status(500).JSON(fiber.Map{"error": "Failed to call AI"})
			}
			defer resp.Body.Close()

			respBody, _ := io.ReadAll(resp.Body)
			var groqResp GroqResponse
			if err := json.Unmarshal(respBody, &groqResp); err != nil || len(groqResp.Choices) == 0 {
				log.Printf("Groq error: %s", string(respBody))
				return c.Status(500).JSON(fiber.Map{"error": "Invalid AI response"})
			}

			if groqResp.Error != nil {
				return c.Status(500).JSON(fiber.Map{"error": groqResp.Error.Message})
			}

			choice := groqResp.Choices[0]

			// Kalau ada tool calls
			if len(choice.Message.ToolCalls) > 0 {
				messages = append(messages, choice.Message)

				for _, tc := range choice.Message.ToolCalls {
					var args map[string]interface{}
					json.Unmarshal([]byte(tc.Function.Arguments), &args)
					result := executeTool(tc.Function.Name, args, db)
					log.Printf("Tool %s called, result: %s", tc.Function.Name, result[:min(100, len(result))])

					toolContent := result
					messages = append(messages, GroqMessage{
						Role:       "tool",
						Content:    &toolContent,
						ToolCallID: tc.ID,
						Name:       tc.Function.Name,
					})
				}
				continue
			}

			// Final response
			if choice.Message.Content != nil {
				finalReply := *choice.Message.Content

				// Simpan ke session (tanpa system prompt)
				newHistory := append(history, GroqMessage{Role: "user", Content: &userContent})
				newHistory = append(newHistory, GroqMessage{Role: "assistant", Content: &finalReply})
				setSession(sessionID, newHistory)

				return c.JSON(fiber.Map{"reply": finalReply})
			}

			break
		}

		return c.JSON(fiber.Map{"reply": "Maaf, Shinra tidak dapat memproses permintaan ini saat ini."})
	}
}

func min(a, b int) int {
	if a < b {
		return a
	}
	return b
}