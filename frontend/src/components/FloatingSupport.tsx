import { Headphones, ChevronUp, MessageCircle, BookOpen } from "lucide-react";
import { useState } from "react";

export default function FloatingSupport() {
    const [supportOpen, setSupportOpen] = useState(false);

    return (
        <div className="fixed bottom-24 left-4 md:bottom-24 md:left-72 z-40">
            <div className="relative">
                {supportOpen && (
                    <div className="absolute bottom-14 left-0 bg-white rounded-xl shadow-xl border border-gray-100 w-52 overflow-hidden">
                        <a href="https://wa.me/6285960235008" target="_blank" rel="noopener noreferrer"
                           className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition text-sm text-gray-700">
                            <MessageCircle size={16} className="text-green-500" />Live Chat
                        </a>
                        <a href="/features"
                           className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition text-sm text-gray-700 border-t">
                            <BookOpen size={16} className="text-indigo-500" />Documentation
                        </a>
                    </div>
                )}
                <button onClick={() => setSupportOpen(!supportOpen)}
                        className="flex items-center gap-2 bg-indigo-900 text-white px-4 py-2 rounded-full shadow-lg hover:bg-indigo-800 transition text-sm">
                    <Headphones size={18} />
                    <span>Support</span>
                    <ChevronUp size={16} className={`transition-transform ${supportOpen ? "rotate-180" : ""}`} />
                </button>
            </div>
        </div>
    );
}