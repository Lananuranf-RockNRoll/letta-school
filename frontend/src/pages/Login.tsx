import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login, saveUser } from "../api/auth";

export default function Login() {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleLogin = async () => {
        if (!email || !password) {
            setError("Email and password are required");
            return;
        }
        setLoading(true);
        setError("");
        try {
            const user = await login(email, password);
            saveUser(user);
            navigate("/");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Login failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4 py-8">
            <div className="bg-white w-full max-w-md rounded-xl shadow-lg p-6 md:p-10">
                <div className="text-center mb-8">
                    <div className="w-14 h-14 bg-indigo-900 rounded-xl flex items-center justify-center mx-auto mb-4">
                        <span className="text-white text-2xl font-bold">S</span>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-800">School Admin</h1>
                    <p className="text-gray-500 text-sm mt-1">Sign in to your account</p>
                </div>

                {error && (
                    <div className="mb-4 px-4 py-2 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg">
                        {error}
                    </div>
                )}

                <div className="flex flex-col gap-4">
                    <div>
                        <label className="text-sm text-gray-600">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                            placeholder="admin@school.com"
                            className="w-full mt-1 px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-400 outline-none text-sm"
                        />
                    </div>
                    <div>
                        <label className="text-sm text-gray-600">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                            placeholder="••••••••"
                            className="w-full mt-1 px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-400 outline-none text-sm"
                        />
                    </div>
                    <button
                        onClick={handleLogin}
                        disabled={loading}
                        className="mt-2 bg-indigo-900 hover:bg-indigo-800 text-white py-3 rounded-lg font-medium disabled:opacity-50 transition text-sm"
                    >
                        {loading ? "Signing in..." : "Sign In"}
                    </button>
                </div>
            </div>
        </div>
    );
}