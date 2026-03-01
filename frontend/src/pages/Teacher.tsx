import { Search, ChevronUp, Headphones, FileDown, MessageCircle, BookOpen } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import AddTeacherForm from "../components/AddTeacherForm";
import TeacherProfile from "../components/TeacherProfile";
import { getTeachers, deleteTeacher } from "../api/teachers";
import type { TeacherAPI } from "../api/teachers";

export default function Teachers() {
    const [supportOpen, setSupportOpen] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [selectedTeacher, setSelectedTeacher] = useState<TeacherAPI | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [teachers, setTeachers] = useState<TeacherAPI[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const limit = 10;

    const fetchTeachers = useCallback(async () => {
        setLoading(true);
        setError("");
        try {
            const res = await getTeachers(searchTerm, page, limit);
            setTeachers(res.data || []);
            setTotal(res.total || 0);
        } catch {
            setError("Failed to load teachers");
        } finally {
            setLoading(false);
        }
    }, [searchTerm, page]);

    useEffect(() => { fetchTeachers(); }, [fetchTeachers]);

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this teacher?")) return;
        try {
            await deleteTeacher(id);
            fetchTeachers();
            if (selectedTeacher?.id === id) setSelectedTeacher(null);
        } catch {
            alert("Failed to delete teacher");
        }
    };

    const handleExportCSV = () => {
        if (teachers.length === 0) return;
        const headers = ["No", "Employee Number", "Full Name", "Email", "Phone", "Gender", "Date of Birth"];
        const rows = teachers.map((t, i) => [
            i + 1,
            t.employee_number || "-",
            t.full_name,
            t.email || "-",
            t.phone || "-",
            t.gender || "-",
            t.date_of_birth || "-",
        ]);
        const csvContent = [headers, ...rows]
            .map(row => row.map(v => `"${v}"`).join(","))
            .join("\n");
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `teachers_page${page}.csv`;
        link.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="flex flex-col h-full bg-gray-100">
            <div className="flex justify-between items-center bg-white px-4 md:px-8 py-4 shadow-sm">
                {selectedTeacher ? (
                    <div className="flex items-center gap-2 md:gap-4 ml-10 md:ml-0">
                        <button onClick={handleExportCSV} className="flex items-center gap-1 text-xs md:text-sm text-sky-600 hover:underline hidden sm:flex">
                            <FileDown size={14} />Export CSV
                        </button>
                        <button onClick={() => setShowForm(true)} className="bg-sky-500 hover:bg-sky-600 text-white px-3 md:px-4 py-2 rounded-lg text-xs md:text-sm">Add Teachers</button>
                    </div>
                ) : (
                    <>
                        <h1 className="text-lg md:text-xl font-semibold text-gray-800 ml-10 md:ml-0">Teachers</h1>
                        <div className="flex items-center gap-2 md:gap-4">
                            <button onClick={handleExportCSV} className="flex items-center gap-1 text-xs md:text-sm text-sky-600 hover:underline hidden sm:flex">
                                <FileDown size={14} />Export CSV
                            </button>
                            <button onClick={() => setShowForm(true)} className="bg-sky-500 hover:bg-sky-600 text-white px-3 md:px-4 py-2 rounded-lg text-xs md:text-sm">Add Teachers</button>
                        </div>
                    </>
                )}
            </div>

            <div className="flex-1 px-4 md:px-12 py-6 md:py-8 overflow-y-auto pb-20">
                {!selectedTeacher && (
                    <div className="flex items-center gap-4 mb-6">
                        <div className="flex items-center bg-white px-4 py-2 rounded-lg shadow-sm w-full max-w-md">
                            <Search size={18} className="text-gray-400 shrink-0" />
                            <input type="text" placeholder="Search teacher by name or email" value={searchTerm}
                                   onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
                                   className="ml-2 outline-none text-sm w-full" />
                        </div>
                    </div>
                )}

                {showForm ? (
                    <AddTeacherForm onClose={() => setShowForm(false)} onSuccess={() => { setShowForm(false); fetchTeachers(); }} />
                ) : selectedTeacher ? (
                    <TeacherProfile teacher={selectedTeacher} onBack={() => setSelectedTeacher(null)} onDelete={() => handleDelete(selectedTeacher.id)} />
                ) : loading ? (
                    <div className="flex items-center justify-center h-[60vh] bg-white rounded-xl shadow-sm"><p className="text-gray-500">Loading...</p></div>
                ) : error ? (
                    <div className="flex items-center justify-center h-[60vh] bg-white rounded-xl shadow-sm"><p className="text-red-500">{error}</p></div>
                ) : teachers.length === 0 ? (
                    <div className="flex items-center justify-center h-[60vh] bg-white rounded-xl shadow-sm"><h2 className="text-lg font-semibold text-gray-600">No Teachers Found</h2></div>
                ) : (
                    <>
                        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead className="bg-gray-50">
                                    <tr>
                                        <th className="text-left px-4 md:px-6 py-3">Profile</th>
                                        <th className="text-left px-4 md:px-6 py-3">Name</th>
                                        <th className="text-left px-4 md:px-6 py-3 hidden sm:table-cell">Email</th>
                                        <th className="text-left px-4 md:px-6 py-3 hidden md:table-cell">Phone</th>
                                        <th className="text-left px-4 md:px-6 py-3">Action</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {teachers.map((teacher, index) => (
                                        <tr key={teacher.id} className={`hover:bg-fuchsia-200 transition ${index % 2 === 0 ? "bg-white" : "bg-fuchsia-300"}`}>
                                            <td className="px-4 md:px-6 py-4 cursor-pointer" onClick={() => setSelectedTeacher(teacher)}>
                                                <img src={teacher.photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(teacher.full_name)}&background=random`} alt={teacher.full_name} className="w-8 h-8 md:w-10 md:h-10 rounded-full object-cover" />
                                            </td>
                                            <td className="px-4 md:px-6 py-4 font-medium cursor-pointer" onClick={() => setSelectedTeacher(teacher)}>{teacher.full_name}</td>
                                            <td className="px-4 md:px-6 py-4 cursor-pointer hidden sm:table-cell" onClick={() => setSelectedTeacher(teacher)}>{teacher.email || "-"}</td>
                                            <td className="px-4 md:px-6 py-4 cursor-pointer hidden md:table-cell" onClick={() => setSelectedTeacher(teacher)}>{teacher.phone || "-"}</td>
                                            <td className="px-4 md:px-6 py-4">
                                                <button onClick={() => handleDelete(teacher.id)} className="text-red-500 hover:text-red-700 text-xs">Delete</button>
                                            </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        {total > limit && (
                            <div className="flex justify-end gap-2 mt-4">
                                <button disabled={page === 1} onClick={() => setPage(page - 1)} className="px-3 md:px-4 py-2 text-xs md:text-sm rounded-lg border disabled:opacity-40 hover:bg-gray-100">Previous</button>
                                <span className="px-3 md:px-4 py-2 text-xs md:text-sm">Page {page} of {Math.ceil(total / limit)}</span>
                                <button disabled={page >= Math.ceil(total / limit)} onClick={() => setPage(page + 1)} className="px-3 md:px-4 py-2 text-xs md:text-sm rounded-lg border disabled:opacity-40 hover:bg-gray-100">Next</button>
                            </div>
                        )}
                    </>
                )}
            </div>

            <div className="fixed bottom-6 left-6 md:bottom-8 md:left-72 z-50">
                <div className="relative">
                    {supportOpen && (
                        <div className="absolute bottom-14 left-0 bg-white rounded-xl shadow-xl border border-gray-100 w-52 overflow-hidden">
                            <a href="https://wa.me/6285960235008" target="_blank" rel="noopener noreferrer"
                               className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition text-sm text-gray-700">
                                <MessageCircle size={16} className="text-green-500" />
                                Live Chat
                            </a>
                            <a href="/features"
                               className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition text-sm text-gray-700 border-t">
                                <BookOpen size={16} className="text-indigo-500" />
                                Documentation
                            </a>
                        </div>
                    )}
                    <button onClick={() => setSupportOpen(!supportOpen)}
                            className="flex items-center gap-2 bg-indigo-900 text-white px-4 py-2 rounded-full shadow-lg text-sm">
                        <Headphones size={16} />
                        <span>Support</span>
                        <ChevronUp size={14} className={`transition-transform ${supportOpen ? "rotate-180" : ""}`} />
                    </button>
                </div>
            </div>
        </div>
    );
}