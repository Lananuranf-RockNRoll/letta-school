import { useState, useEffect } from "react";
import { createStudent, getClasses } from "../api/students";

interface Class {
    id: string;
    name: string;
    grade_level: string | null;
}

export default function AddStudentForm({
                                           onClose,
                                           onSuccess,
                                       }: {
    onClose: () => void;
    onSuccess: () => void;
}) {
    const [gender, setGender] = useState("male");
    const [classes, setClasses] = useState<Class[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [form, setForm] = useState({
        full_name: "",
        email: "",
        phone: "",
        date_of_birth: "",
        class_id: "",
        student_number: "",
    });

    useEffect(() => {
        getClasses()
            .then((res) => setClasses(res.data || []))
            .catch(() => setClasses([]));
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };
    const handleSubmit = async () => {
        if (!form.full_name || !form.student_number) {
            setError("Full name and student number are required");
            return;
        }
        setLoading(true);
        setError("");
        try {
            await createStudent({
                student_number: form.student_number,
                full_name: form.full_name,
                email: form.email,
                phone: form.phone,
                gender: gender,
                date_of_birth: form.date_of_birth,
                class_id: form.class_id,
            });
            onSuccess();
        } catch (err) {
            // ✅ Fix: pakai instanceof Error instead of any
            setError(err instanceof Error ? err.message : "Failed to add student");
        } finally {
            setLoading(false);
        }
    };
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div onClick={onClose} className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
            <div className="relative bg-white w-full max-w-3xl rounded-xl shadow-xl p-8">

                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-lg font-semibold text-gray-800">Add Student</h2>
                    <button onClick={onClose} className="text-sm text-gray-500 hover:text-gray-700">Close</button>
                </div>

                {/* Error */}
                {error && (
                    <div className="mb-4 px-4 py-2 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg">
                        {error}
                    </div>
                )}

                {/* Form */}
                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <label className="text-sm text-gray-600">Student Number *</label>
                        <input
                            name="student_number"
                            value={form.student_number}
                            onChange={handleChange}
                            placeholder="e.g. STD001"
                            className="w-full mt-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-sky-400 outline-none"
                        />
                    </div>
                    <div>
                        <label className="text-sm text-gray-600">Full Name *</label>
                        <input
                            name="full_name"
                            value={form.full_name}
                            onChange={handleChange}
                            placeholder="e.g. Andi Pratama"
                            className="w-full mt-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-sky-400 outline-none"
                        />
                    </div>
                    <div>
                        <label className="text-sm text-gray-600">Email</label>
                        <input
                            name="email"
                            type="email"
                            value={form.email}
                            onChange={handleChange}
                            placeholder="e.g. andi@school.com"
                            className="w-full mt-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-sky-400 outline-none"
                        />
                    </div>
                    <div>
                        <label className="text-sm text-gray-600">Phone</label>
                        <input
                            name="phone"
                            value={form.phone}
                            onChange={handleChange}
                            placeholder="e.g. 081234567890"
                            className="w-full mt-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-sky-400 outline-none"
                        />
                    </div>
                    <div>
                        <label className="text-sm text-gray-600">Date of Birth</label>
                        <input
                            name="date_of_birth"
                            type="date"
                            value={form.date_of_birth}
                            onChange={handleChange}
                            className="w-full mt-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-sky-400 outline-none"
                        />
                    </div>
                    <div>
                        <label className="text-sm text-gray-600 block mb-2">Gender</label>
                        <div className="flex gap-4">
                            <label className="flex items-center gap-2 text-sm">
                                <input type="radio" name="gender" value="male" checked={gender === "male"} onChange={() => setGender("male")} />
                                Male
                            </label>
                            <label className="flex items-center gap-2 text-sm">
                                <input type="radio" name="gender" value="female" checked={gender === "female"} onChange={() => setGender("female")} />
                                Female
                            </label>
                        </div>
                    </div>
                    <div className="col-span-2">
                        <label className="text-sm text-gray-600">Class</label>
                        <select
                            name="class_id"
                            value={form.class_id}
                            onChange={handleChange}
                            className="w-full mt-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-sky-400 outline-none"
                        >
                            <option value="">Select Class</option>
                            {classes.map((cls) => (
                                <option key={cls.id} value={cls.id}>
                                    {cls.name} {cls.grade_level ? `(Grade ${cls.grade_level})` : ""}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Buttons */}
                <div className="mt-8 flex justify-end gap-4">
                    <button onClick={onClose} className="px-6 py-2 rounded-lg border text-gray-600 hover:bg-gray-100">
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="bg-sky-500 hover:bg-sky-600 text-white px-6 py-2 rounded-lg disabled:opacity-50"
                    >
                        {loading ? "Adding..." : "Add Student"}
                    </button>
                </div>
            </div>
        </div>
    );
}