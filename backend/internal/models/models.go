package models

import "time"

// =====================
// ADMIN
// =====================
type AdminUser struct {
	ID           string    `json:"id"`
	FullName     string    `json:"full_name"`
	Email        string    `json:"email"`
	PasswordHash string    `json:"-"`
	IsActive     bool      `json:"is_active"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
}

type CreateAdminRequest struct {
	FullName string `json:"full_name" validate:"required"`
	Email    string `json:"email" validate:"required,email"`
	Password string `json:"password" validate:"required,min=8"`
}

// =====================
// TEACHER
// =====================
type Teacher struct {
	ID             string     `json:"id"`
	EmployeeNumber *string    `json:"employee_number"`
	FullName       string     `json:"full_name"`
	Email          *string    `json:"email"`
	Gender         *string    `json:"gender"`
	DateOfBirth    *time.Time `json:"date_of_birth"`
	Phone          *string    `json:"phone"`
	PhotoURL       *string    `json:"photo_url"`
	Bio            *string    `json:"bio"`
	CreatedAt      time.Time  `json:"created_at"`
	UpdatedAt      time.Time  `json:"updated_at"`
}

type CreateTeacherRequest struct {
	EmployeeNumber string `json:"employee_number"`
	FullName       string `json:"full_name" validate:"required"`
	Email          string `json:"email"`
	Gender         string `json:"gender"`
	DateOfBirth    string `json:"date_of_birth"`
	Phone          string `json:"phone"`
	PhotoURL       string `json:"photo_url"`
	Bio            string `json:"bio"`
}

type UpdateTeacherRequest struct {
	FullName    string `json:"full_name"`
	Email       string `json:"email"`
	Gender      string `json:"gender"`
	DateOfBirth string `json:"date_of_birth"`
	Phone       string `json:"phone"`
	PhotoURL    string `json:"photo_url"`
	Bio         string `json:"bio"`
}

// =====================
// CLASS
// =====================
type Class struct {
	ID                string    `json:"id"`
	Name              string    `json:"name"`
	GradeLevel        *string   `json:"grade_level"`
	HomeroomTeacherID *string   `json:"homeroom_teacher_id"`
	CreatedAt         time.Time `json:"created_at"`
	UpdatedAt         time.Time `json:"updated_at"`
}

type ClassWithTeacher struct {
	Class
	HomeroomTeacherName *string `json:"homeroom_teacher_name"`
}

type CreateClassRequest struct {
	Name              string `json:"name" validate:"required"`
	GradeLevel        string `json:"grade_level"`
	HomeroomTeacherID string `json:"homeroom_teacher_id"`
}

// =====================
// STUDENT
// =====================
type Student struct {
	ID             string     `json:"id"`
	StudentNumber  string     `json:"student_number"`
	FullName       string     `json:"full_name"`
	Email          *string    `json:"email"`
	Gender         *string    `json:"gender"`
	DateOfBirth    *time.Time `json:"date_of_birth"`
	Phone          *string    `json:"phone"`
	PhotoURL       *string    `json:"photo_url"`
	ClassID        *string    `json:"class_id"`
	EnrollmentDate *time.Time `json:"enrollment_date"`
	CreatedAt      time.Time  `json:"created_at"`
	UpdatedAt      time.Time  `json:"updated_at"`
}

type StudentWithClass struct {
	Student
	ClassName *string `json:"class_name"`
}

type CreateStudentRequest struct {
	StudentNumber  string `json:"student_number" validate:"required"`
	FullName       string `json:"full_name" validate:"required"`
	Email          string `json:"email"`
	Gender         string `json:"gender"`
	DateOfBirth    string `json:"date_of_birth"`
	Phone          string `json:"phone"`
	PhotoURL       string `json:"photo_url"`
	ClassID        string `json:"class_id"`
	EnrollmentDate string `json:"enrollment_date"`
}

// =====================
// SUBJECT
// =====================
type Subject struct {
	ID          string    `json:"id"`
	Name        string    `json:"name"`
	Description *string   `json:"description"`
	CreatedAt   time.Time `json:"created_at"`
}

type CreateSubjectRequest struct {
	Name        string `json:"name" validate:"required"`
	Description string `json:"description"`
}

// =====================
// TEACHER ASSIGNMENT
// =====================
type TeacherAssignment struct {
	ID        string    `json:"id"`
	TeacherID string    `json:"teacher_id"`
	ClassID   string    `json:"class_id"`
	SubjectID string    `json:"subject_id"`
	CreatedAt time.Time `json:"created_at"`
}

type TeacherAssignmentDetail struct {
	TeacherAssignment
	TeacherName string `json:"teacher_name"`
	ClassName   string `json:"class_name"`
	SubjectName string `json:"subject_name"`
}

type CreateAssignmentRequest struct {
	TeacherID string `json:"teacher_id" validate:"required"`
	ClassID   string `json:"class_id" validate:"required"`
	SubjectID string `json:"subject_id" validate:"required"`
}

// =====================
// CLASS SCHEDULE
// =====================
type ClassSchedule struct {
	ID        string    `json:"id"`
	ClassID   string    `json:"class_id"`
	SubjectID string    `json:"subject_id"`
	TeacherID string    `json:"teacher_id"`
	DayOfWeek int       `json:"day_of_week"`
	StartTime string    `json:"start_time"`
	EndTime   string    `json:"end_time"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

type ClassScheduleDetail struct {
	ClassSchedule
	ClassName   string `json:"class_name"`
	SubjectName string `json:"subject_name"`
	TeacherName string `json:"teacher_name"`
}

type CreateScheduleRequest struct {
	ClassID   string `json:"class_id" validate:"required"`
	SubjectID string `json:"subject_id" validate:"required"`
	TeacherID string `json:"teacher_id" validate:"required"`
	DayOfWeek int    `json:"day_of_week" validate:"required,min=1,max=7"`
	StartTime string `json:"start_time" validate:"required"`
	EndTime   string `json:"end_time" validate:"required"`
}

type Response struct {
	Success bool        `json:"success"`
	Message string      `json:"message"`
	Data    interface{} `json:"data,omitempty"`
}

type PaginatedResponse struct {
	Success bool        `json:"success"`
	Data    interface{} `json:"data"`
	Total   int         `json:"total"`
	Page    int         `json:"page"`
	Limit   int         `json:"limit"`
}
