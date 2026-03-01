import { ArrowLeft, Trash2 } from "lucide-react";
import type { StudentAPI } from "../api/students";

interface StudentProfileProps {
    student: StudentAPI;
    onBack: () => void;
    onDelete: () => void;
}

function getAge(dob: string | null): string | number {
    if (!dob) return "-";
    const diff = Date.now() - new Date(dob).getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
}

export default function StudentProfile({ student, onBack, onDelete }: StudentProfileProps) {
    return (
        <div className="bg-white rounded-xl shadow-sm p-6 md:p-10">
            <div className="flex justify-between items-center mb-6">
                <button onClick={onBack} className="flex items-center text-sm text-gray-600 hover:text-black">
                    <ArrowLeft size={16} className="mr-2" />Back to list
                </button>
                <button onClick={onDelete} className="flex items-center gap-2 text-sm text-red-500 hover:text-red-700">
                    <Trash2 size={16} />Delete Student
                </button>
            </div>

            <div className="flex flex-col md:flex-row gap-8 md:gap-12">
                {/* LEFT */}
                <div className="md:w-1/3 text-center">
                    <img
                        src={student.photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(student.full_name)}&size=200&background=random`}
                        alt={student.full_name}
                        className="w-32 h-32 md:w-56 md:h-56 rounded-full mx-auto object-cover"
                    />
                    <h2 className="mt-4 md:mt-6 text-lg md:text-xl font-semibold">{student.full_name}</h2>
                    <p className="text-sm text-gray-500 mt-1">{student.student_number}</p>
                </div>

                {/* RIGHT */}
                <div className="md:w-2/3">
                    <h3 className="text-lg font-semibold mb-3">About</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                        <div>
                            <p className="text-xs text-gray-500">Age</p>
                            <p className="font-medium text-sm">{getAge(student.date_of_birth)}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500">Gender</p>
                            <p className="font-medium text-sm capitalize">{student.gender || "-"}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500">Class</p>
                            <p className="font-medium text-sm">{student.class_name || "-"}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500">Email</p>
                            <p className="font-medium text-sm break-all">{student.email || "-"}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500">Phone</p>
                            <p className="font-medium text-sm">{student.phone || "-"}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500">Date of Birth</p>
                            <p className="font-medium text-sm">
                                {student.date_of_birth ? new Date(student.date_of_birth).toLocaleDateString("id-ID") : "-"}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500">Enrollment Date</p>
                            <p className="font-medium text-sm">
                                {student.enrollment_date ? new Date(student.enrollment_date).toLocaleDateString("id-ID") : "-"}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}