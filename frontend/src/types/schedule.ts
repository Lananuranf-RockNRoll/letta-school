export interface SubjectSchedule {
    id: string;        // ← tambah id untuk delete
    subject: string;
    time: string;
    endTime: string;   // ← tambah end time
    teacher: string;
    teacherId: string; // ← tambah untuk form
    subjectId: string; // ← tambah untuk form
}

export interface DaySchedule {
    day: string;
    dayNumber: number;
    subjects: SubjectSchedule[];
}

export interface ClassSchedule {
    id: string;
    className: string;
    homeroom: string;
    weeklySchedule: DaySchedule[];
}