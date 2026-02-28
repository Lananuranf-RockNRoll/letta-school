import {
    Home,
    Users,
    GraduationCap,
    CreditCard,
    LayoutGrid,
    LogOut,
    Menu,
    X,
} from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { useState } from "react";
import type { ReactNode } from "react";
import { logout } from "../api/auth";

export default function Sidebar() {
    const navigate = useNavigate();
    const [open, setOpen] = useState(false);
    const [showBadge, setShowBadge] = useState(() => {
        return !localStorage.getItem("featuresVisited");
    });

    const handleFeaturesClick = () => {
        localStorage.setItem("featuresVisited", "true");
        setShowBadge(false);
        setOpen(false);
    };

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    const navContent = (
        <>
            <div className="flex flex-col items-center mb-10">
                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-fuchsia-600 font-bold text-xl shadow-md">
                    M
                </div>
                <p className="mt-3 text-gray-300 text-sm">Letta School</p>
            </div>

            <nav className="space-y-1 flex-1">
                <SidebarItem to="/" icon={<Home size={18} />} label="Dashboard" onClick={() => setOpen(false)} />
                <SidebarItem to="/teachers" icon={<Users size={18} />} label="Teachers" onClick={() => setOpen(false)} />
                <SidebarItem to="/students" icon={<GraduationCap size={18} />} label="Students / Classes" onClick={() => setOpen(false)} />
                <SidebarItem to="/schedule" icon={<CreditCard size={18} />} label="Schedule" onClick={() => setOpen(false)} />
            </nav>

            <div className="flex flex-col gap-2 mt-auto pt-4">
                <NavLink
                    to="/features"
                    onClick={handleFeaturesClick}
                    className={({ isActive }) =>
                        `relative flex items-center justify-between px-4 py-2 rounded-lg transition-all duration-300 ${
                            isActive ? "bg-indigo-600 text-white" : "text-gray-300 hover:bg-indigo-800"
                        }`
                    }
                >
                    <div className="flex items-center gap-2">
                        <LayoutGrid size={18} />
                        <span className="text-sm">Features</span>
                    </div>
                    {showBadge && (
                        <span className="text-xs bg-white text-fuchsia-400 px-2 py-1 rounded-full animate-pulse">
                            NEW
                        </span>
                    )}
                </NavLink>

                <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-4 py-2 rounded-lg text-gray-300 hover:bg-fuchsia-500 transition-all duration-300 text-sm"
                >
                    <LogOut size={18} />
                    Log out
                </button>
            </div>
        </>
    );

    return (
        <>
            <button
                onClick={() => setOpen(true)}
                className="md:hidden fixed top-4 left-4 z-50 bg-fuchsia-800 text-white p-2 rounded-lg shadow-lg"
            >
                <Menu size={20} />
            </button>

            {open && (
                <div className="md:hidden fixed inset-0 bg-black/50 z-40" onClick={() => setOpen(false)} />
            )}

            <aside
                className={`md:hidden fixed top-0 left-0 h-full w-64 bg-fuchsia-800 text-white flex flex-col p-6 shadow-xl z-50 transition-transform duration-300 ${
                    open ? "translate-x-0" : "-translate-x-full"
                }`}
            >
                <button onClick={() => setOpen(false)} className="absolute top-4 right-4 text-white hover:text-gray-300">
                    <X size={20} />
                </button>
                {navContent}
            </aside>

            <aside className="hidden md:flex w-64 min-h-screen bg-fuchsia-800 text-white flex-col p-6 shadow-xl shrink-0">
                {navContent}
            </aside>
        </>
    );
}

function SidebarItem({ to, icon, label, onClick }: { to: string; icon: ReactNode; label: string; onClick?: () => void }) {
    return (
        <NavLink
            to={to}
            onClick={onClick}
            className={({ isActive }) =>
                `group relative flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-300 ${
                    isActive ? "bg-fuchsia-500 text-white" : "text-gray-300 hover:bg-fuchsia-500"
                }`
            }
        >
            <span className="absolute left-0 top-0 h-full w-1 bg-white rounded-r-lg opacity-0 group-[.active]:opacity-100"></span>
            {icon}
            <span className="text-sm">{label}</span>
        </NavLink>
    );
}