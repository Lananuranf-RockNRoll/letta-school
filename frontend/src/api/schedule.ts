import { BASE_URL } from "./config";

export interface ScheduleAPI {
    id: string;
    class_id: string;
    class_name: string;
    subject_id: string;
    subject_name: string;
    teacher_id: string;
    teacher_name: string;
    day_of_week: number;
    start_time: string;
    end_time: string;
}

export interface ClassAPI {
    id: string;
    name: string;
    grade_level: string | null;
    homeroom_teacher_name: string | null;
}

export interface TeacherAPI {
    id: string;
    full_name: string;
}

export interface SubjectAPI {
    id: string;
    name: string;
}

export interface CreateSchedulePayload {
    class_id: string;
    subject_id: string;
    teacher_id: string;
    day_of_week: number;
    start_time: string;
    end_time: string;
}

export const DAY_NAMES: Record<number, string> = {
    1: "Monday",
    2: "Tuesday",
    3: "Wednesday",
    4: "Thursday",
    5: "Friday",
    6: "Saturday",
    7: "Sunday",
};

export const DAY_OPTIONS = [
    { value: 1, label: "Monday" },
    { value: 2, label: "Tuesday" },
    { value: 3, label: "Wednesday" },
    { value: 4, label: "Thursday" },
    { value: 5, label: "Friday" },
    { value: 6, label: "Saturday" },
    { value: 7, label: "Sunday" },
];

export async function getSchedules(classId = "") {
    const params = classId ? `?class_id=${classId}` : "";
    const res = await fetch(`${BASE_URL}/schedules${params}`);
    if (!res.ok) throw new Error("Failed to fetch schedules");
    return res.json();
}

export async function createSchedule(payload: CreateSchedulePayload) {
    const res = await fetch(`${BASE_URL}/schedules`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message);
    return data;
}

export async function deleteSchedule(id: string) {
    const res = await fetch(`${BASE_URL}/schedules/${id}`, {
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

export async function getTeachers() {
    const res = await fetch(`${BASE_URL}/teachers`);
    if (!res.ok) throw new Error("Failed to fetch teachers");
    return res.json();
}

export async function getSubjects() {
    const res = await fetch(`${BASE_URL}/subjects`);
    if (!res.ok) throw new Error("Failed to fetch subjects");
    return res.json();
}