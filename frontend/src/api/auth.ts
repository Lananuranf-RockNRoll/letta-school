import { BASE_URL } from "./config";

export interface AdminUser {
    id: string;
    full_name: string;
    email: string;
}

export async function login(email: string, password: string): Promise<AdminUser> {
    const res = await fetch(`${BASE_URL}/admins/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
}

export function saveUser(user: AdminUser) {
    localStorage.setItem("admin_user", JSON.stringify(user));
}

export function getUser(): AdminUser | null {
    const raw = localStorage.getItem("admin_user");
    if (!raw) return null;
    try {
        return JSON.parse(raw);
    } catch {
        return null;
    }
}

export function logout() {
    localStorage.removeItem("admin_user");
}

export function isLoggedIn(): boolean {
    return getUser() !== null;
}