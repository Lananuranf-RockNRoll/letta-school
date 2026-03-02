import { ArrowLeft, Trash2, Camera } from "lucide-react";
import { useState, useRef } from "react";
import type { TeacherAPI } from "../api/teachers";
import axios from "axios";

interface TeacherProfileProps {
    teacher: TeacherAPI;
    onBack: () => void;
    onDelete: () => void;
}

function getAge(dob: string | null): string | number {
    if (!dob) return "-";
    const diff = Date.now() - new Date(dob).getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
}

export default function TeacherProfile({ teacher, onBack, onDelete }: TeacherProfileProps) {
    const [photoUrl, setPhotoUrl] = useState(teacher.photo_url);
    const [uploading, setUploading] = useState(false);
    const fileRef = useRef<HTMLInputElement>(null);

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploading(true);
        try {
            const formData = new FormData();
            formData.append("photo", file);
            const res = await axios.post(`/api/v1/upload/teacher/${teacher.id}`, formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });
            setPhotoUrl(res.data.photo_url + "?t=" + Date.now());
        } catch {
            alert("Gagal upload foto");
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-sm p-6 md:p-10">
            <div className="flex justify-between items-center mb-6">
                <button onClick={onBack} className="flex items-center text-sm text-gray-600 hover:text-black">
                    <ArrowLeft size={16} className="mr-2" />Back to list
                </button>
                <button onClick={onDelete} className="flex items-center gap-2 text-sm text-red-500 hover:text-red-700">
                    <Trash2 size={16} />Delete Teacher
                </button>
            </div>

            <div className="flex flex-col md:flex-row gap-8 md:gap-12">
                {/* LEFT */}
                <div className="md:w-1/3 text-center">
                    <div className="relative w-32 h-32 md:w-56 md:h-56 mx-auto">
                        <img
                            src={photoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(teacher.full_name)}&size=200&background=random`}
                            alt={teacher.full_name}
                            className="w-full h-full rounded-full object-cover"
                        />
                        <button
                            onClick={() => fileRef.current?.click()}
                            disabled={uploading}
                            className="absolute bottom-1 right-1 md:bottom-2 md:right-2 w-8 h-8 md:w-10 md:h-10 bg-fuchsia-600 hover:bg-fuchsia-700 rounded-full flex items-center justify-center shadow-lg transition disabled:opacity-50"
                        >
                            {uploading
                                ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                : <Camera size={16} className="text-white" />
                            }
                        </button>
                        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />
                    </div>
                    <h2 className="mt-4 md:mt-6 text-lg md:text-xl font-semibold">{teacher.full_name}</h2>
                    <p className="text-sm text-gray-500 mt-1">{teacher.employee_number || "-"}</p>
                    <p className="text-xs text-gray-400 mt-2">Klik ikon kamera untuk ganti foto</p>
                </div>

                {/* RIGHT */}
                <div className="md:w-2/3">
                    <h3 className="text-lg font-semibold mb-3">About</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                        <div>
                            <p className="text-xs text-gray-500">Age</p>
                            <p className="font-medium text-sm">{getAge(teacher.date_of_birth)}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500">Gender</p>
                            <p className="font-medium text-sm capitalize">{teacher.gender || "-"}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500">Email</p>
                            <p className="font-medium text-sm break-all">{teacher.email || "-"}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500">Phone</p>
                            <p className="font-medium text-sm">{teacher.phone || "-"}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500">Date of Birth</p>
                            <p className="font-medium text-sm">
                                {teacher.date_of_birth ? new Date(teacher.date_of_birth).toLocaleDateString("id-ID") : "-"}
                            </p>
                        </div>
                        {teacher.bio && (
                            <div className="sm:col-span-2">
                                <p className="text-xs text-gray-500">Bio</p>
                                <p className="font-medium text-sm leading-relaxed">{teacher.bio}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}