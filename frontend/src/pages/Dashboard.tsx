import {
    UserPlus, School, GraduationCap, Bell, Headphones, ChevronUp, Users, BookOpen,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import type { ReactNode } from "react";
import { getUser, logout } from "../api/auth";
import { getDashboardStats } from "../api/dashboard";
import type { DashboardStats } from "../api/dashboard";
import AddAdminForm from "../components/AddAdminForm";
import AddClassForm from "../components/AddClassForm";

export default function Dashboard() {
    const navigate = useNavigate();
    const [supportOpen, setSupportOpen] = useState(false);
    const [notifOpen, setNotifOpen] = useState(false);
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [showAddAdmin, setShowAddAdmin] = useState(false);
    const [showAddClass, setShowAddClass] = useState(false);

    const user = getUser();

    const fetchStats = () => {
        getDashboardStats().then(setStats).catch(() => {});
    };

    useEffect(() => {
        let cancelled = false;
        getDashboardStats()
            .then((data) => { if (!cancelled) setStats(data); })
            .catch(() => {});
        return () => { cancelled = true; };
    }, []);

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    return (
        <div className="flex flex-col h-full bg-gray-100">
            {/* HEADER */}
            <div className="flex justify-between items-center bg-white px-4 md:px-8 py-4 shadow-sm shrink-0">
                <div className="text-xs md:text-sm text-gray-600 hidden sm:block">
                    Learn how to launch faster — watch our webinar for tips.
                </div>
                <div className="flex items-center gap-4 md:gap-6 relative ml-auto">
                    <button onClick={() => setNotifOpen(!notifOpen)} className="relative">
                        <Bell className="text-gray-600" size={20} />
                        <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                    </button>
                    {notifOpen && (
                        <div className="absolute right-0 top-10 w-56 md:w-64 bg-white shadow-lg rounded-lg p-4 text-sm z-50">
                            <p className="font-semibold mb-2">Notifications</p>
                            <p className="text-gray-500">No new notifications</p>
                        </div>
                    )}
                    <button onClick={handleLogout} className="bg-fuchsia-500 hover:bg-fuchsia-600 text-white px-3 md:px-4 py-2 rounded-lg text-xs md:text-sm">
                        Log out
                    </button>
                </div>
            </div>

            {/* CONTENT */}
            <div className="flex-1 overflow-y-auto px-4 md:px-12 py-6 md:py-8">
                <h1 className="text-xl md:text-3xl font-semibold text-gray-800 pl-10 md:pl-0">
                    Welcome, {user?.full_name || "Admin"}
                </h1>
                <p className="text-gray-500 mt-1 mb-6 md:mb-8 text-sm pl-10 md:pl-0">{user?.email || ""}</p>

                {/* STATS */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
                    <StatCard icon={<GraduationCap size={22} />} label="Total Students" value={stats?.totalStudents ?? "-"} color="bg-sky-100 text-sky-700" />
                    <StatCard icon={<Users size={22} />} label="Total Teachers" value={stats?.totalTeachers ?? "-"} color="bg-fuchsia-100 text-fuchsia-700" />
                    <StatCard icon={<BookOpen size={22} />} label="Total Classes" value={stats?.totalClasses ?? "-"} color="bg-indigo-100 text-indigo-700" />
                </div>

                {/* QUICK ACTIONS */}
                <div className="space-y-3 md:space-y-4 mb-6 md:mb-8">
                    <DashboardCard icon={<UserPlus size={22} />} title="Add other admins" description="Create and manage admin accounts for your school." onClick={() => setShowAddAdmin(true)} />
                    <DashboardCard icon={<School size={22} />} title="Add classes" description="Organize students into classes and assign homeroom teachers." onClick={() => setShowAddClass(true)} />
                    <DashboardCard icon={<GraduationCap size={22} />} title="Add students" description="Register new students and assign them to classes." onClick={() => navigate("/students")} />
                </div>

                {/* RECENT STUDENTS */}
                {stats && stats.recentStudents.length > 0 && (
                    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                        <div className="px-4 md:px-6 py-4 border-b">
                            <h2 className="font-semibold text-gray-800 text-sm md:text-base">Recent Students</h2>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50">
                                <tr>
                                    <th className="text-left px-4 md:px-6 py-3">Name</th>
                                    <th className="text-left px-4 md:px-6 py-3 hidden sm:table-cell">Class</th>
                                    <th className="text-left px-4 md:px-6 py-3 hidden md:table-cell">Enrollment Date</th>
                                </tr>
                                </thead>
                                <tbody>
                                {stats.recentStudents.map((s, i) => (
                                    <tr key={s.id} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                                        <td className="px-4 md:px-6 py-3 font-medium">{s.full_name}</td>
                                        <td className="px-4 md:px-6 py-3 hidden sm:table-cell">{s.class_name || "-"}</td>
                                        <td className="px-4 md:px-6 py-3 hidden md:table-cell">
                                            {s.enrollment_date ? new Date(s.enrollment_date).toLocaleDateString("id-ID") : "-"}
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            {showAddAdmin && <AddAdminForm onClose={() => setShowAddAdmin(false)} onSuccess={() => { setShowAddAdmin(false); fetchStats(); }} />}
            {showAddClass && <AddClassForm onClose={() => setShowAddClass(false)} onSuccess={() => { setShowAddClass(false); fetchStats(); }} />}

            {/* FLOATING SUPPORT */}
            <div className="fixed bottom-6 right-6 md:bottom-8 md:right-8">
                <button onClick={() => setSupportOpen(!supportOpen)} className="flex items-center gap-2 bg-indigo-900 text-white px-4 md:px-6 py-2 md:py-3 rounded-full shadow-lg hover:bg-indigo-800 transition text-sm">
                    <Headphones size={18} />
                    <span className="hidden sm:inline">Support</span>
                    <ChevronUp size={16} className={`transition-transform ${supportOpen ? "rotate-180" : ""}`} />
                </button>
                {supportOpen && (
                    <div className="absolute bottom-full right-0 mb-2 w-56 md:w-64 bg-white shadow-xl rounded-xl p-4 text-sm">
                        <p className="font-semibold mb-2">Need Help?</p>
                        <button onClick={() => alert("Chat clicked")} className="block w-full text-left px-3 py-2 hover:bg-gray-100 rounded">Live Chat</button>
                        <button onClick={() => alert("Docs clicked")} className="block w-full text-left px-3 py-2 hover:bg-gray-100 rounded">Documentation</button>
                    </div>
                )}
            </div>
        </div>
    );
}

function StatCard({ icon, label, value, color }: { icon: ReactNode; label: string; value: number | string; color: string }) {
    return (
        <div className="bg-white rounded-xl shadow-sm p-4 md:p-6 flex items-center gap-4">
            <div className={`p-3 rounded-lg ${color}`}>{icon}</div>
            <div>
                <p className="text-xs md:text-sm text-gray-500">{label}</p>
                <p className="text-xl md:text-2xl font-bold text-gray-800">{value}</p>
            </div>
        </div>
    );
}

function DashboardCard({ icon, title, description, onClick }: { icon: ReactNode; title: string; description: string; onClick: () => void }) {
    return (
        <div onClick={onClick} className="flex items-start gap-4 bg-white p-4 md:p-6 rounded-xl shadow-sm hover:shadow-md hover:-translate-y-1 cursor-pointer transition-all duration-200">
            <div className="bg-indigo-100 text-indigo-700 p-3 rounded-lg shrink-0">{icon}</div>
            <div>
                <h3 className="font-semibold text-gray-800 text-sm md:text-base">{title}</h3>
                <p className="text-gray-500 text-xs md:text-sm mt-1">{description}</p>
            </div>
        </div>
    );
}