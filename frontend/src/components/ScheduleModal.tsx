import type { ClassSchedule } from "../types/schedule";
import { deleteSchedule } from "../api/schedule";
import { Trash2 } from "lucide-react";

type Props = {
    selectedClass: ClassSchedule;
    onClose: () => void;
    onRefresh: () => void;   // ← tambah untuk refresh setelah delete
};

export default function ScheduleModal({ selectedClass, onClose, onRefresh }: Props) {

    const handleDelete = async (scheduleId: string) => {
        if (!confirm("Delete this schedule?")) return;
        try {
            await deleteSchedule(scheduleId);
            onRefresh();
            onClose();
        } catch {
            alert("Failed to delete schedule");
        }
    };

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
            <div className="bg-white w-full max-w-4xl rounded-xl shadow-xl relative max-h-[90vh] overflow-y-auto">
                <div className="p-8">
                    <h2 className="text-xl font-semibold mb-6">
                        Schedule for {selectedClass.className}
                    </h2>

                    {selectedClass.weeklySchedule.length === 0 ? (
                        <p className="text-gray-500 text-sm">No schedule yet for this class.</p>
                    ) : (
                        <div className="space-y-6">
                            {selectedClass.weeklySchedule.map((dayItem, index) => (
                                <div key={index}>
                                    <h3 className="text-md font-semibold mb-3 text-sky-600">
                                        {dayItem.day}
                                    </h3>
                                    <div className="bg-gray-50 rounded-lg overflow-hidden">
                                        <table className="w-full text-sm">
                                            <thead className="bg-gray-100">
                                            <tr>
                                                <th className="text-left px-4 py-2">Time</th>
                                                <th className="text-left px-4 py-2">Subject</th>
                                                <th className="text-left px-4 py-2">Teacher</th>
                                                <th className="text-left px-4 py-2"></th>
                                            </tr>
                                            </thead>
                                            <tbody>
                                            {dayItem.subjects.map((subject, i) => (
                                                <tr
                                                    key={i}
                                                    className={i % 2 === 0 ? "bg-white" : "bg-gray-100"}
                                                >
                                                    <td className="px-4 py-2">
                                                        {subject.time} - {subject.endTime}
                                                    </td>
                                                    <td className="px-4 py-2 font-medium">
                                                        {subject.subject}
                                                    </td>
                                                    <td className="px-4 py-2">
                                                        {subject.teacher}
                                                    </td>
                                                    <td className="px-4 py-2">
                                                        <button
                                                            onClick={() => handleDelete(subject.id)}
                                                            className="text-red-400 hover:text-red-600"
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-700"
                >
                    ✕
                </button>
            </div>
        </div>
    );
}