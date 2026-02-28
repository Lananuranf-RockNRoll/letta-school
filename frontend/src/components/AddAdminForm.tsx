import { useState } from "react";
import { createAdmin } from "../api/admins";

export default function AddAdminForm({
                                         onClose,
                                         onSuccess,
                                     }: {
    onClose: () => void;
    onSuccess: () => void;
}) {
    const [form, setForm] = useState({ full_name: "", email: "", password: "" });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async () => {
        if (!form.full_name || !form.email || !form.password) {
            setError("All fields are required");
            return;
        }
        setLoading(true);
        setError("");
        try {
            await createAdmin(form);
            onSuccess();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to add admin");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div onClick={onClose} className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
            <div className="relative bg-white w-full max-w-md rounded-xl shadow-xl p-8">

                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-lg font-semibold text-gray-800">Add Admin</h2>
                    <button onClick={onClose} className="text-sm text-gray-500 hover:text-gray-700">Close</button>
                </div>

                {error && (
                    <div className="mb-4 px-4 py-2 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg">
                        {error}
                    </div>
                )}

                <div className="flex flex-col gap-4">
                    <div>
                        <label className="text-sm text-gray-600">Full Name *</label>
                        <input
                            name="full_name"
                            value={form.full_name}
                            onChange={handleChange}
                            placeholder="e.g. John Doe"
                            className="w-full mt-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-sky-400 outline-none"
                        />
                    </div>
                    <div>
                        <label className="text-sm text-gray-600">Email *</label>
                        <input
                            name="email"
                            type="email"
                            value={form.email}
                            onChange={handleChange}
                            placeholder="e.g. admin@school.com"
                            className="w-full mt-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-sky-400 outline-none"
                        />
                    </div>
                    <div>
                        <label className="text-sm text-gray-600">Password *</label>
                        <input
                            name="password"
                            type="password"
                            value={form.password}
                            onChange={handleChange}
                            placeholder="••••••••"
                            className="w-full mt-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-sky-400 outline-none"
                        />
                    </div>
                </div>

                <div className="mt-8 flex justify-end gap-4">
                    <button onClick={onClose} className="px-6 py-2 rounded-lg border text-gray-600 hover:bg-gray-100">
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="bg-sky-500 hover:bg-sky-600 text-white px-6 py-2 rounded-lg disabled:opacity-50"
                    >
                        {loading ? "Adding..." : "Add Admin"}
                    </button>
                </div>
            </div>
        </div>
    );
}