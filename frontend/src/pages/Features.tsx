import { BookOpen, Users, GraduationCap, CreditCard, FileDown, Calendar, Shield } from "lucide-react";

const features = [
    {
        icon: <Users size={24} className="text-fuchsia-500" />,
        title: "Teacher Management",
        description: "Tambah, edit, dan hapus data guru. Lihat profil lengkap termasuk bio, foto, dan jadwal mengajar.",
    },
    {
        icon: <GraduationCap size={24} className="text-sky-500" />,
        title: "Student & Class Management",
        description: "Kelola data siswa dan kelas. Assign siswa ke kelas, lihat daftar siswa per kelas.",
    },
    {
        icon: <CreditCard size={24} className="text-indigo-500" />,
        title: "Schedule Management",
        description: "Buat dan kelola jadwal pelajaran per kelas. Support jadwal Senin–Sabtu dengan multiple mata pelajaran per hari.",
    },
    {
        icon: <FileDown size={24} className="text-green-500" />,
        title: "Export CSV",
        description: "Export data guru dan siswa ke format CSV untuk keperluan laporan atau backup data.",
    },
    {
        icon: <Calendar size={24} className="text-orange-500" />,
        title: "Dashboard Overview",
        description: "Lihat ringkasan total siswa, guru, dan kelas dalam satu halaman dashboard.",
    },
    {
        icon: <Shield size={24} className="text-red-500" />,
        title: "Admin Management",
        description: "Kelola akun admin sekolah. Tambah admin baru dan atur hak akses.",
    },
];

export default function Features() {
    return (
        <div className="flex flex-col h-full bg-gray-100">
            <div className="flex items-center bg-white px-4 md:px-8 py-4 shadow-sm">
                <h1 className="text-lg md:text-xl font-semibold text-gray-800 ml-10 md:ml-0">Features</h1>
            </div>
            <div className="flex-1 px-4 md:px-12 py-6 md:py-8 overflow-y-auto">
                <div className="bg-gradient-to-r from-fuchsia-700 to-indigo-700 rounded-2xl p-6 md:p-10 mb-8 text-white">
                    <div className="flex items-center gap-3 mb-3">
                        <BookOpen size={28} />
                        <h2 className="text-xl md:text-2xl font-bold">Letta School — Dokumentasi Fitur</h2>
                    </div>
                    <p className="text-fuchsia-100 text-sm md:text-base max-w-2xl">
                        Platform manajemen sekolah yang memudahkan pengelolaan data guru, siswa, kelas, dan jadwal pelajaran dalam satu sistem terintegrasi.
                    </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-8">
                    {features.map((f, i) => (
                        <div key={i} className="bg-white rounded-xl p-5 shadow-sm hover:shadow-md transition">
                            <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center mb-4">
                                {f.icon}
                            </div>
                            <h3 className="font-semibold text-gray-800 mb-2">{f.title}</h3>
                            <p className="text-sm text-gray-500 leading-relaxed">{f.description}</p>
                        </div>
                    ))}
                </div>
                <div className="bg-white rounded-xl p-6 shadow-sm">
                    <h3 className="font-semibold text-gray-800 mb-4 text-lg">Quick Start Guide</h3>
                    <ol className="space-y-3 text-sm text-gray-600">
                        <li className="flex gap-3"><span className="w-6 h-6 bg-fuchsia-100 text-fuchsia-600 rounded-full flex items-center justify-center font-bold shrink-0 text-xs">1</span><span>Login menggunakan akun admin yang sudah didaftarkan.</span></li>
                        <li className="flex gap-3"><span className="w-6 h-6 bg-fuchsia-100 text-fuchsia-600 rounded-full flex items-center justify-center font-bold shrink-0 text-xs">2</span><span>Tambahkan data <strong>Guru</strong> melalui menu Teachers → Add Teachers.</span></li>
                        <li className="flex gap-3"><span className="w-6 h-6 bg-fuchsia-100 text-fuchsia-600 rounded-full flex items-center justify-center font-bold shrink-0 text-xs">3</span><span>Buat <strong>Kelas</strong> dan assign wali kelas melalui menu Students / Classes.</span></li>
                        <li className="flex gap-3"><span className="w-6 h-6 bg-fuchsia-100 text-fuchsia-600 rounded-full flex items-center justify-center font-bold shrink-0 text-xs">4</span><span>Tambahkan <strong>Siswa</strong> dan assign ke kelas yang sesuai.</span></li>
                        <li className="flex gap-3"><span className="w-6 h-6 bg-fuchsia-100 text-fuchsia-600 rounded-full flex items-center justify-center font-bold shrink-0 text-xs">5</span><span>Buat <strong>Jadwal</strong> pelajaran per kelas melalui menu Schedule.</span></li>
                    </ol>
                </div>
            </div>
        </div>
    );
}