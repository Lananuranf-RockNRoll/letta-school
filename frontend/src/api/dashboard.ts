import { BASE_URL } from "./config";

export interface DashboardStats {
    totalStudents: number;
    totalTeachers: number;
    totalClasses: number;
    recentStudents: RecentStudent[];
}

export interface RecentStudent {
    id: string;
    full_name: string;
    class_name: string | null;
    enrollment_date: string | null;
}

export async function getDashboardStats(): Promise<DashboardStats> {
    const [studentsRes, teachersRes, classesRes] = await Promise.all([
        fetch(`${BASE_URL}/students?page=1&limit=100`).then((r) => r.json()),
        fetch(`${BASE_URL}/teachers?page=1&limit=100`).then((r) => r.json()),
        fetch(`${BASE_URL}/classes`).then((r) => r.json()),
    ]);

    const students = studentsRes.data || [];
    const teachers = teachersRes.data || [];
    const classes = classesRes.data || [];

    return {
        totalStudents: studentsRes.total ?? students.length,
        totalTeachers: teachersRes.total ?? teachers.length,
        totalClasses: classesRes.total ?? classes.length,
        recentStudents: students.slice(0, 5),
    };
}