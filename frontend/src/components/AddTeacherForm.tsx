import { useState } from "react";
import { createTeacher } from "../api/teachers";

export default function AddTeacherForm({
                                           onClose,
                                           onSuccess,
                                       }: {
    onClose: () => void;
    onSuccess: () => void;
}) {
    const [gender, setGender] = useState("male");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [form, setForm] = useState({
        employee_number: "",
        full_name: "",
        email: "",
        phone: "",
        date_of_birth: "",
        bio: "",
    });

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async () => {
        if (!form.full_name) {
            setError("Full name is required");
            return;
        }
        setLoading(true);
        setError("");
        try {
            await createTeacher({
                employee_number: form.employee_number,
                full_name: form.full_name,
                email: form.email,
                phone: form.phone,
                gender: gender,
                date_of_birth: form.date_of_birth,
                bio: form.bio,
            });
            onSuccess();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to add teacher");
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
                    <h2 className="text-lg font-semibold text-gray-800">Add Teacher</h2>
                    <button onClick={onClose} className="text-sm text-gray-500 hover:text-gray-700">
                        Close
                    </button>
                </div>

                {/* Error */}
                {error && (
                    <div className="mb-4 px-4 py-2 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg">
                        {error}
                    </div>
                )}

                <div className="grid grid-cols-2 gap-6">

                    {/* Employee Number */}
                    <div>
                        <label className="text-sm text-gray-600">Employee Number</label>
                        <input
                            name="employee_number"
                            value={form.employee_number}
                            onChange={handleChange}
                            placeholder="e.g. EMP001"
                            className="w-full mt-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-sky-400 outline-none"
                        />
                    </div>

                    {/* Full Name */}
                    <div>
                        <label className="text-sm text-gray-600">Full Name *</label>
                        <input
                            name="full_name"
                            value={form.full_name}
                            onChange={handleChange}
                            placeholder="e.g. Budi Santoso"
                            className="w-full mt-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-sky-400 outline-none"
                        />
                    </div>

                    {/* Email */}
                    <div>
                        <label className="text-sm text-gray-600">Email</label>
                        <input
                            name="email"
                            type="email"
                            value={form.email}
                            onChange={handleChange}
                            placeholder="e.g. budi@school.com"
                            className="w-full mt-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-sky-400 outline-none"
                        />
                    </div>

                    {/* Phone */}
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

                    {/* Date of Birth */}
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

                    {/* Gender */}
                    <div>
                        <label className="text-sm text-gray-600 block mb-2">Gender</label>
                        <div className="flex gap-4">
                            <label className="flex items-center gap-2 text-sm">
                                <input
                                    type="radio"
                                    name="gender"
                                    value="male"
                                    checked={gender === "male"}
                                    onChange={() => setGender("male")}
                                />
                                Male
                            </label>
                            <label className="flex items-center gap-2 text-sm">
                                <input
                                    type="radio"
                                    name="gender"
                                    value="female"
                                    checked={gender === "female"}
                                    onChange={() => setGender("female")}
                                />
                                Female
                            </label>
                        </div>
                    </div>

                    {/* Bio */}
                    <div className="col-span-2">
                        <label className="text-sm text-gray-600">Bio</label>
                        <textarea
                            name="bio"
                            value={form.bio}
                            onChange={handleChange}
                            placeholder="Short description about the teacher..."
                            rows={3}
                            className="w-full mt-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-sky-400 outline-none resize-none"
                        />
                    </div>
                </div>

                {/* Buttons */}
                <div className="mt-8 flex justify-end gap-4">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 rounded-lg border text-gray-600 hover:bg-gray-100"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="bg-sky-500 hover:bg-sky-600 text-white px-6 py-2 rounded-lg disabled:opacity-50"
                    >
                        {loading ? "Adding..." : "Add Teacher"}
                    </button>
                </div>
            </div>
        </div>
    );
}