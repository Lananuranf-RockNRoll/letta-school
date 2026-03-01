import { Search, ChevronUp, Headphones, MessageCircle, BookOpen } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import ScheduleTable from "../components/ScheduleTable";
import ScheduleModal from "../components/ScheduleModal";
import AddScheduleForm from "../components/AddScheduleForm";
import type { ClassSchedule } from "../types/schedule";
import { getSchedules, getClasses, DAY_NAMES } from "../api/schedule";
import type { ScheduleAPI, ClassAPI } from "../api/schedule";

function parseTime(t: string): string {
    if (!t) return "-";
    if (t.includes("T")) return t.split("T")[1].slice(0, 5);
    return t.slice(0, 5);
}

function buildClassSchedules(classes: ClassAPI[], schedules: ScheduleAPI[]): ClassSchedule[] {
    return classes.map((cls) => {
        const classSchedules = schedules.filter((s) => s.class_id === cls.id);
        const byDay: Record<number, ScheduleAPI[]> = {};
        classSchedules.forEach((s) => {
            if (!byDay[s.day_of_week]) byDay[s.day_of_week] = [];
            byDay[s.day_of_week].push(s);
        });
        const weeklySchedule = Object.entries(byDay)
            .sort(([a], [b]) => Number(a) - Number(b))
            .map(([day, items]) => ({
                day: DAY_NAMES[Number(day)],
                dayNumber: Number(day),
                subjects: items
                    .sort((a, b) => a.start_time.localeCompare(b.start_time))
                    .map((item) => ({
                        id: item.id,
                        subject: item.subject_name,
                        time: parseTime(item.start_time),
                        endTime: parseTime(item.end_time),
                        teacher: item.teacher_name,
                        teacherId: item.teacher_id,
                        subjectId: item.subject_id,
                    })),
            }));
        return {
            id: cls.id,
            className: cls.name,
            homeroom: cls.homeroom_teacher_name || "-",
            weeklySchedule,
        };
    });
}

export default function Schedule() {
    const [supportOpen, setSupportOpen] = useState(false);
    const [selectedClass, setSelectedClass] = useState<ClassSchedule | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [classes, setClasses] = useState<ClassSchedule[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [showForm, setShowForm] = useState(false);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError("");
        try {
            const [classRes, scheduleRes] = await Promise.all([getClasses(), getSchedules()]);
            setClasses(buildClassSchedules(classRes.data || [], scheduleRes.data || []));
        } catch {
            setError("Failed to load schedule data");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    const filteredClasses = classes.filter((cls) =>
        cls.className.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="flex flex-col h-full bg-gray-100">
            <div className="flex justify-between items-center bg-white px-4 md:px-8 py-4 shadow-sm">
                <h1 className="text-lg md:text-xl font-semibold text-gray-800 ml-10 md:ml-0">Schedule</h1>
                <button onClick={() => setShowForm(true)} className="bg-sky-500 hover:bg-sky-600 text-white px-3 md:px-4 py-2 rounded-lg text-xs md:text-sm">
                    Add Schedule
                </button>
            </div>

            <div className="flex-1 px-4 md:px-12 py-6 md:py-8 overflow-y-auto pb-20">
                <div className="flex items-center gap-4 mb-6">
                    <div className="flex items-center bg-white px-4 py-2 rounded-lg shadow-sm w-full max-w-md">
                        <Search size={18} className="text-gray-400 shrink-0" />
                        <input type="text" placeholder="Search class" value={searchTerm}
                               onChange={(e) => setSearchTerm(e.target.value)}
                               className="ml-2 outline-none text-sm w-full" />
                    </div>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center h-[60vh] bg-white rounded-xl shadow-sm"><p className="text-gray-500">Loading...</p></div>
                ) : error ? (
                    <div className="flex items-center justify-center h-[60vh] bg-white rounded-xl shadow-sm"><p className="text-red-500">{error}</p></div>
                ) : filteredClasses.length === 0 ? (
                    <div className="flex items-center justify-center h-[60vh] bg-white rounded-xl shadow-sm"><h2 className="text-lg font-semibold text-gray-600">No Class Found</h2></div>
                ) : (
                    <ScheduleTable classes={filteredClasses} onSelect={setSelectedClass} />
                )}
            </div>

            {showForm && <AddScheduleForm onClose={() => setShowForm(false)} onSuccess={() => { setShowForm(false); fetchData(); }} />}
            {selectedClass && <ScheduleModal selectedClass={selectedClass} onClose={() => setSelectedClass(null)} onRefresh={() => { fetchData(); setSelectedClass(null); }} />}

            <div className="fixed bottom-6 left-6 md:bottom-8 md:left-72 z-50">
                <div className="relative">
                    {supportOpen && (
                        <div className="absolute bottom-14 left-0 bg-white rounded-xl shadow-xl border border-gray-100 w-52 overflow-hidden">
                            <a href="https://wa.me/6285860235008" target="_blank" rel="noopener noreferrer"
                               className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition text-sm text-gray-700">
                                <MessageCircle size={16} className="text-green-500" />Live Chat
                            </a>
                            <a href="/features"
                               className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition text-sm text-gray-700 border-t">
                                <BookOpen size={16} className="text-indigo-500" />Documentation
                            </a>
                        </div>
                    )}
                    <button onClick={() => setSupportOpen(!supportOpen)}
                            className="flex items-center gap-2 bg-indigo-900 text-white px-4 py-2 rounded-full shadow-lg text-sm">
                        <Headphones size={16} /><span>Support</span>
                        <ChevronUp size={14} className={`transition-transform ${supportOpen ? "rotate-180" : ""}`} />
                    </button>
                </div>
            </div>
        </div>
    );
}