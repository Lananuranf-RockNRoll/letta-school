import { BASE_URL } from "./config";

export interface TeacherAPI {
    id: string;
    employee_number: string | null;
    full_name: string;
    email: string | null;
    gender: string | null;
    date_of_birth: string | null;
    phone: string | null;
    photo_url: string | null;
    bio: string | null;
    created_at: string;
    updated_at: string;
}

export interface CreateTeacherPayload {
    employee_number?: string;
    full_name: string;
    email?: string;
    gender?: string;
    date_of_birth?: string;
    phone?: string;
    photo_url?: string;
    bio?: string;
}

export async function getTeachers(search = "", page = 1, limit = 10) {
    const params = new URLSearchParams({
        search,
        page: String(page),
        limit: String(limit),
    });
    const res = await fetch(`${BASE_URL}/teachers?${params}`);
    if (!res.ok) throw new Error("Failed to fetch teachers");
    return res.json();
}

export async function getTeacherById(id: string) {
    const res = await fetch(`${BASE_URL}/teachers/${id}`);
    if (!res.ok) throw new Error("Failed to fetch teacher");
    return res.json();
}

export async function createTeacher(payload: CreateTeacherPayload) {
    const res = await fetch(`${BASE_URL}/teachers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message);
    return data;
}

export async function updateTeacher(id: string, payload: Partial<CreateTeacherPayload>) {
    const res = await fetch(`${BASE_URL}/teachers/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message);
    return data;
}

export async function deleteTeacher(id: string) {
    const res = await fetch(`${BASE_URL}/teachers/${id}`, {
        method: "DELETE",
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message);
    return data;
}