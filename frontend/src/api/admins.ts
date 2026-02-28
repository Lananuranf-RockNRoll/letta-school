import { BASE_URL } from "./config";

export interface AdminAPI {
    id: string;
    full_name: string;
    email: string;
    is_active: boolean;
    created_at: string;
}

export async function getAdmins() {
    const res = await fetch(`${BASE_URL}/admins`);
    if (!res.ok) throw new Error("Failed to fetch admins");
    return res.json();
}

export async function createAdmin(payload: { full_name: string; email: string; password: string }) {
    const res = await fetch(`${BASE_URL}/admins`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message);
    return data;
}

export async function deleteAdmin(id: string) {
    const res = await fetch(`${BASE_URL}/admins/${id}`, {
        method: "DELETE",
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message);
    return data;
}