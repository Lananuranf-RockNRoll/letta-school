import type { ClassSchedule } from "../types/schedule";

type Props = {
    classes: ClassSchedule[];
    onSelect: (cls: ClassSchedule) => void;
};

export default function ScheduleTable({ classes, onSelect }: Props) {
    return (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <table className="w-full text-sm">
                <thead className="bg-gray-50">
                <tr>
                    <th className="text-left px-6 py-3">Class</th>
                    <th className="text-left px-6 py-3">Homeroom</th>
                </tr>
                </thead>

                <tbody>
                {classes.map((cls, index) => (
                    <tr
                        key={cls.id}
                        onClick={() => onSelect(cls)}
                        className={`cursor-pointer hover:bg-fuchsia-200 transition ${
                            index % 2 === 0 ? "bg-white" : "bg-fuchsia-300"
                        }`}
                    >
                        <td className="px-6 py-4 font-medium">
                            {cls.className}
                        </td>
                        <td className="px-6 py-4">
                            {cls.homeroom}
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
}