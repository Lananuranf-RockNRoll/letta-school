import { Search, ChevronUp, Headphones, FileDown, MessageCircle, BookOpen } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import AddStudentForm from "../components/AddStudentForm";
import StudentProfile from "../components/StudentProfile";
import { getStudents, deleteStudent } from "../api/students";
import type { StudentAPI } from "../api/students";

export default function Students() {
    const [supportOpen, setSupportOpen] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState<StudentAPI | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [students, setStudents] = useState<StudentAPI[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const limit = 10;

    const fetchStudents = useCallback(async () => {
        setLoading(true);
        setError("");
        try {
            const res = await getStudents(searchTerm, page, limit);
            setStudents(res.data || []);
            setTotal(res.total || 0);
        } catch {
            setError("Failed to load students");
        } finally {
            setLoading(false);
        }
    }, [searchTerm, page]);

    useEffect(() => { fetchStudents(); }, [fetchStudents]);

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this student?")) return;
        try {
            await deleteStudent(id);
            fetchStudents();
            if (selectedStudent?.id === id) setSelectedStudent(null);
        } catch {
            alert("Failed to delete student");
        }
    };

    const handleExportCSV = () => {
        if (students.length === 0) return;
        const headers = ["No", "Student Number", "Full Name", "Class", "Email", "Phone", "Gender", "Date of Birth"];
        const rows = students.map((s, i) => [
            i + 1,
            s.student_number || "-",
            s.full_name,
            s.class_name || "-",
            s.email || "-",
            s.phone || "-",
            s.gender || "-",
            s.date_of_birth || "-",
        ]);
        const csvContent = [headers, ...rows]
            .map(row => row.map(v => `"${v}"`).join(","))
            .join("\n");
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `students_page${page}.csv`;
        link.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="flex flex-col h-full bg-gray-100">
            <div className="flex justify-between items-center bg-white px-4 md:px-8 py-4 shadow-sm">
                {selectedStudent ? (
                    <div className="flex items-center gap-2 md:gap-4 ml-10 md:ml-0">
                        <button onClick={handleExportCSV} className="flex items-center gap-1 text-xs md:text-sm text-sky-600 hover:underline hidden sm:flex">
                            <FileDown size={14} />Export CSV
                        </button>
                        <button onClick={() => setShowForm(true)} className="bg-sky-500 hover:bg-sky-600 text-white px-3 md:px-4 py-2 rounded-lg text-xs md:text-sm">Add Students</button>
                    </div>
                ) : (
                    <>
                        <h1 className="text-lg md:text-xl font-semibold text-gray-800 ml-10 md:ml-0">Students</h1>
                        <div className="flex items-center gap-2 md:gap-4">
                            <button onClick={handleExportCSV} className="flex items-center gap-1 text-xs md:text-sm text-sky-600 hover:underline hidden sm:flex">
                                <FileDown size={14} />Export CSV
                            </button>
                            <button onClick={() => setShowForm(true)} className="bg-sky-500 hover:bg-sky-600 text-white px-3 md:px-4 py-2 rounded-lg text-xs md:text-sm">Add Students</button>
                        </div>
                    </>
                )}
            </div>

            <div className="flex-1 px-4 md:px-12 py-6 md:py-8 overflow-y-auto pb-20">
                {!selectedStudent && (
                    <div className="flex items-center gap-4 mb-6">
                        <div className="flex items-center bg-white px-4 py-2 rounded-lg shadow-sm w-full max-w-md">
                            <Search size={18} className="text-gray-400 shrink-0" />
                            <input type="text" placeholder="Search student by name or email" value={searchTerm}
                                   onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
                                   className="ml-2 outline-none text-sm w-full" />
                        </div>
                    </div>
                )}

                {showForm ? (
                    <AddStudentForm onClose={() => setShowForm(false)} onSuccess={() => { setShowForm(false); fetchStudents(); }} />
                ) : selectedStudent ? (
                    <StudentProfile student={selectedStudent} onBack={() => setSelectedStudent(null)} onDelete={() => handleDelete(selectedStudent.id)} />
                ) : loading ? (
                    <div className="flex items-center justify-center h-[60vh] bg-white rounded-xl shadow-sm"><p className="text-gray-500">Loading...</p></div>
                ) : error ? (
                    <div className="flex items-center justify-center h-[60vh] bg-white rounded-xl shadow-sm"><p className="text-red-500">{error}</p></div>
                ) : students.length === 0 ? (
                    <div className="flex items-center justify-center h-[60vh] bg-white rounded-xl shadow-sm"><h2 className="text-lg font-semibold text-gray-600">No Students Found</h2></div>
                ) : (
                    <>
                        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead className="bg-gray-50">
                                    <tr>
                                        <th className="text-left px-4 md:px-6 py-3">Profile</th>
                                        <th className="text-left px-4 md:px-6 py-3">Name</th>
                                        <th className="text-left px-4 md:px-6 py-3 hidden sm:table-cell">Class</th>
                                        <th className="text-left px-4 md:px-6 py-3 hidden md:table-cell">Email</th>
                                        <th className="text-left px-4 md:px-6 py-3">Action</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {students.map((student, index) => (
                                        <tr key={student.id} className={`hover:bg-fuchsia-200 transition ${index % 2 === 0 ? "bg-white" : "bg-fuchsia-300"}`}>
                                            <td className="px-4 md:px-6 py-4 cursor-pointer" onClick={() => setSelectedStudent(student)}>
                                                <img src={student.photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(student.full_name)}&background=random`} alt={student.full_name} className="w-8 h-8 md:w-10 md:h-10 rounded-full object-cover" />
                                            </td>
                                            <td className="px-4 md:px-6 py-4 font-medium cursor-pointer" onClick={() => setSelectedStudent(student)}>{student.full_name}</td>
                                            <td className="px-4 md:px-6 py-4 cursor-pointer hidden sm:table-cell" onClick={() => setSelectedStudent(student)}>{student.class_name || "-"}</td>
                                            <td className="px-4 md:px-6 py-4 cursor-pointer hidden md:table-cell" onClick={() => setSelectedStudent(student)}>{student.email || "-"}</td>
                                            <td className="px-4 md:px-6 py-4">
                                                <button onClick={() => handleDelete(student.id)} className="text-red-500 hover:text-red-700 text-xs">Delete</button>
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