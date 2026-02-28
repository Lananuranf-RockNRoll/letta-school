import { ArrowLeft, Trash2 } from "lucide-react";
import type { TeacherAPI } from "../api/teachers";

function getAge(dob: string | null): string | number {
    if (!dob) return "-";
    const diff = Date.now() - new Date(dob).getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
}

interface TeacherProfileProps {
    teacher: TeacherAPI;
    onBack: () => void;
    onDelete: () => void;
}

export default function TeacherProfile({ teacher, onBack, onDelete }: TeacherProfileProps) {
    return (
        <div className="bg-white rounded-xl shadow-sm p-10">
            <div className="flex justify-between items-center mb-6">
                <button
                    onClick={onBack}
                    className="flex items-center text-sm text-gray-600 hover:text-black"
                >
                    <ArrowLeft size={16} className="mr-2" />
                    Back to list
                </button>
                <button
                    onClick={onDelete}
                    className="flex items-center gap-2 text-sm text-red-500 hover:text-red-700"
                >
                    <Trash2 size={16} />
                    Delete Teacher
                </button>
            </div>

            <div className="flex gap-12">

                {/* LEFT */}
                <div className="w-1/3 text-center">
                    <img
                        src={teacher.photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(teacher.full_name)}&size=200&background=random`}
                        alt={teacher.full_name}
                        className="w-56 h-56 rounded-full mx-auto object-cover"
                    />
                    <h2 className="mt-6 text-xl font-semibold">{teacher.full_name}</h2>
                    {teacher.employee_number && (
                        <p className="text-sm text-gray-500 mt-1">{teacher.employee_number}</p>
                    )}
                </div>

                {/* RIGHT */}
                <div className="w-2/3">
                    <h3 className="text-lg font-semibold mb-3">About</h3>
                    {teacher.bio && (
                        <p className="text-gray-600 leading-relaxed mb-6">{teacher.bio}</p>
                    )}

                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <p className="text-sm text-gray-500">Age</p>
                            <p className="font-medium">{getAge(teacher.date_of_birth)}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Gender</p>
                            <p className="font-medium capitalize">{teacher.gender || "-"}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Email</p>
                            <p className="font-medium">{teacher.email || "-"}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Phone</p>
                            <p className="font-medium">{teacher.phone || "-"}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Date of Birth</p>
                            <p className="font-medium">
                                {teacher.date_of_birth
                                    ? new Date(teacher.date_of_birth).toLocaleDateString("id-ID")
                                    : "-"}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}