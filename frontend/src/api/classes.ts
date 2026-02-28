import { BASE_URL } from "./config";

export interface ClassAPI {
    id: string;
    name: string;
    grade_level: string | null;
    homeroom_teacher_id: string | null;
    homeroom_teacher_name: string | null;
}

export interface CreateClassPayload {
    name: string;
    grade_level?: string;
    homeroom_teacher_id?: string;
}

export async function getClasses() {
    const res = await fetch(`${BASE_URL}/classes`);
    if (!res.ok) throw new Error("Failed to fetch classes");
    return res.json();
}

export async function createClass(payload: CreateClassPayload) {
    const res = await fetch(`${BASE_URL}/classes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message);
    return data;
}

export async function updateClass(id: string, payload: Partial<CreateClassPayload>) {
    const res = await fetch(`${BASE_URL}/classes/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message);
    return data;
}

export async function deleteClass(id: string) {
    const res = await fetch(`${BASE_URL}/classes/${id}`, {
        method: "DELETE",
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message);
    return data;
}