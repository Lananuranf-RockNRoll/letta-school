import { useState, useEffect } from "react";
import {
    createSchedule,
    getClasses,
    getTeachers,
    getSubjects,
    DAY_OPTIONS,
} from "../api/schedule";
import type { ClassAPI, TeacherAPI, SubjectAPI } from "../api/schedule";

export default function AddScheduleForm({
                                            onClose,
                                            onSuccess,
                                        }: {
    onClose: () => void;
    onSuccess: () => void;
}) {
    const [classes, setClasses] = useState<ClassAPI[]>([]);
    const [teachers, setTeachers] = useState<TeacherAPI[]>([]);
    const [subjects, setSubjects] = useState<SubjectAPI[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const [form, setForm] = useState({
        class_id: "",
        subject_id: "",
        teacher_id: "",
        day_of_week: 1,
        start_time: "",
        end_time: "",
    });

    useEffect(() => {
        Promise.all([getClasses(), getTeachers(), getSubjects()])
            .then(([cls, tch, sub]) => {
                setClasses(cls.data || []);
                setTeachers(tch.data || []);
                setSubjects(sub.data || []);
            })
            .catch(() => setError("Failed to load form data"));
    }, []);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        setForm({
            ...form,
            [e.target.name]:
                e.target.name === "day_of_week"
                    ? Number(e.target.value)
                    : e.target.value,
        });
    };

    const handleSubmit = async () => {
        if (!form.class_id || !form.subject_id || !form.teacher_id || !form.start_time || !form.end_time) {
            setError("All fields are required");
            return;
        }
        setLoading(true);
        setError("");
        try {
            await createSchedule(form);
            onSuccess();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to add schedule");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div onClick={onClose} className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
            <div className="relative bg-white w-full max-w-lg rounded-xl shadow-xl p-8">

                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-lg font-semibold text-gray-800">Add Schedule</h2>
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

                <div className="flex flex-col gap-4">

                    {/* Class */}
                    <div>
                        <label className="text-sm text-gray-600">Class *</label>
                        <select
                            name="class_id"
                            value={form.class_id}
                            onChange={handleChange}
                            className="w-full mt-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-sky-400 outline-none"
                        >
                            <option value="">Select Class</option>
                            {classes.map((cls) => (
                                <option key={cls.id} value={cls.id}>{cls.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* Subject */}
                    <div>
                        <label className="text-sm text-gray-600">Subject *</label>
                        <select
                            name="subject_id"
                            value={form.subject_id}
                            onChange={handleChange}
                            className="w-full mt-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-sky-400 outline-none"
                        >
                            <option value="">Select Subject</option>
                            {subjects.map((sub) => (
                                <option key={sub.id} value={sub.id}>{sub.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* Teacher */}
                    <div>
                        <label className="text-sm text-gray-600">Teacher *</label>
                        <select
                            name="teacher_id"
                            value={form.teacher_id}
                            onChange={handleChange}
                            className="w-full mt-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-sky-400 outline-none"
                        >
                            <option value="">Select Teacher</option>
                            {teachers.map((tch) => (
                                <option key={tch.id} value={tch.id}>{tch.full_name}</option>
                            ))}
                        </select>
                    </div>

                    {/* Day */}
                    <div>
                        <label className="text-sm text-gray-600">Day *</label>
                        <select
                            name="day_of_week"
                            value={form.day_of_week}
                            onChange={handleChange}
                            className="w-full mt-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-sky-400 outline-none"
                        >
                            {DAY_OPTIONS.map((d) => (
                                <option key={d.value} value={d.value}>{d.label}</option>
                            ))}
                        </select>
                    </div>

                    {/* Time */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm text-gray-600">Start Time *</label>
                            <input
                                name="start_time"
                                type="time"
                                value={form.start_time}
                                onChange={handleChange}
                                className="w-full mt-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-sky-400 outline-none"
                            />
                        </div>
                        <div>
                            <label className="text-sm text-gray-600">End Time *</label>
                            <input
                                name="end_time"
                                type="time"
                                value={form.end_time}
                                onChange={handleChange}
                                className="w-full mt-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-sky-400 outline-none"
                            />
                        </div>
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
                        {loading ? "Adding..." : "Add Schedule"}
                    </button>
                </div>
            </div>
        </div>
    );
}