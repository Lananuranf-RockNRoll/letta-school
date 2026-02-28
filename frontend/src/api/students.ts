import { BASE_URL } from "./config";

export interface StudentAPI {
    id: string;
    student_number: string;
    full_name: string;
    email: string | null;
    gender: string | null;
    date_of_birth: string | null;
    phone: string | null;
    photo_url: string | null;
    class_id: string | null;
    class_name: string | null;
    enrollment_date: string | null;
    created_at: string;
    updated_at: string;
}

export interface CreateStudentPayload {
    student_number: string;
    full_name: string;
    email?: string;
    gender?: string;
    date_of_birth?: string;
    phone?: string;
    photo_url?: string;
    class_id?: string;
    enrollment_date?: string;
}

export async function getStudents(search = "", page = 1, limit = 10) {
    const params = new URLSearchParams({
        search,
        page: String(page),
        limit: String(limit),
    });
    const res = await fetch(`${BASE_URL}/students?${params}`);
    if (!res.ok) throw new Error("Failed to fetch students");
    return res.json();
}

export async function getStudentById(id: string) {
    const res = await fetch(`${BASE_URL}/students/${id}`);
    if (!res.ok) throw new Error("Failed to fetch student");
    return res.json();
}

export async function createStudent(payload: CreateStudentPayload) {
    const res = await fetch(`${BASE_URL}/students`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message);
    return data;
}

export async function updateStudent(id: string, payload: Partial<CreateStudentPayload>) {
    const res = await fetch(`${BASE_URL}/students/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message);
    return data;
}

export async function deleteStudent(id: string) {
    const res = await fetch(`${BASE_URL}/students/${id}`, {
        method: "DELETE",
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message);
    return data;
}

export async function getClasses() {
    const res = await fetch(`${BASE_URL}/classes`);
    if (!res.ok) throw new Error("Failed to fetch classes");
    return res.json();
}