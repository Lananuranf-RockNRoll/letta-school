import { Routes, Route, Navigate } from "react-router-dom";
import { isLoggedIn } from "../api/auth";
import Sidebar from "../layout/Sidebar";
import Dashboard from "../pages/Dashboard";
import Teachers from "../pages/Teacher";
import Students from "../pages/Students";
import Schedule from "../pages/Schedule";
import Login from "../pages/Login";
import Features from "../pages/Features";

function ProtectedLayout({ children }: { children: React.ReactNode }) {
    if (!isLoggedIn()) return <Navigate to="/login" replace />;
    return (
        <div className="flex h-screen overflow-hidden">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                {children}
            </div>
        </div>
    );
}

export default function AppRoutes() {
    return (
        <Routes>
            {/* Public */}
            <Route path="/login" element={<Login />} />

            {/* Protected */}
            <Route path="/" element={<ProtectedLayout><Dashboard /></ProtectedLayout>} />
            <Route path="/teachers" element={<ProtectedLayout><Teachers /></ProtectedLayout>} />
            <Route path="/students" element={<ProtectedLayout><Students /></ProtectedLayout>} />
            <Route path="/schedule" element={<ProtectedLayout><Schedule /></ProtectedLayout>} />
            <Route path="/features" element={<ProtectedLayout><Features /></ProtectedLayout>} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}