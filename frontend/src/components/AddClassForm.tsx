import { useState, useEffect } from "react";
import { createClass } from "../api/classes";
import { getTeachers } from "../api/teachers";
import type { TeacherAPI } from "../api/teachers";

export default function AddClassForm({
                                         onClose,
                                         onSuccess,
                                     }: {
    onClose: () => void;
    onSuccess: () => void;
}) {
    const [teachers, setTeachers] = useState<TeacherAPI[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [form, setForm] = useState({
        name: "",
        grade_level: "",
        homeroom_teacher_id: "",
    });

    useEffect(() => {
        getTeachers("", 1, 100)
            .then((res) => setTeachers(res.data || []))
            .catch(() => {});
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async () => {
        if (!form.name) {
            setError("Class name is required");
            return;
        }
        setLoading(true);
        setError("");
        try {
            await createClass({
                name: form.name,
                grade_level: form.grade_level,
                homeroom_teacher_id: form.homeroom_teacher_id || undefined,
            });
            onSuccess();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to add class");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div onClick={onClose} className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
            <div className="relative bg-white w-full max-w-md rounded-xl shadow-xl p-8">

                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-lg font-semibold text-gray-800">Add Class</h2>
                    <button onClick={onClose} className="text-sm text-gray-500 hover:text-gray-700">Close</button>
                </div>

                {error && (
                    <div className="mb-4 px-4 py-2 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg">
                        {error}
                    </div>
                )}

                <div className="flex flex-col gap-4">
                    <div>
                        <label className="text-sm text-gray-600">Class Name *</label>
                        <input
                            name="name"
                            value={form.name}
                            onChange={handleChange}
                            placeholder="e.g. X-A"
                            className="w-full mt-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-sky-400 outline-none"
                        />
                    </div>
                    <div>
                        <label className="text-sm text-gray-600">Grade Level</label>
                        <input
                            name="grade_level"
                            value={form.grade_level}
                            onChange={handleChange}
                            placeholder="e.g. 10"
                            className="w-full mt-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-sky-400 outline-none"
                        />
                    </div>
                    <div>
                        <label className="text-sm text-gray-600">Homeroom Teacher</label>
                        <select
                            name="homeroom_teacher_id"
                            value={form.homeroom_teacher_id}
                            onChange={handleChange}
                            className="w-full mt-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-sky-400 outline-none"
                        >
                            <option value="">Select Teacher (optional)</option>
                            {teachers.map((t) => (
                                <option key={t.id} value={t.id}>{t.full_name}</option>
                            ))}
                        </select>
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
                        {loading ? "Adding..." : "Add Class"}
                    </button>
                </div>
            </div>
        </div>
    );
}