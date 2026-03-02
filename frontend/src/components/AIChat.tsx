import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Bot, User } from "lucide-react";
import axios from "axios";

interface Message {
    role: "user" | "assistant";
    content: string;
}

export default function AIChat() {
    const [open, setOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        { role: "assistant", content: "Selamat datang. Saya Shinra, AI Agent Letta School.\n\nSaya dapat membantu Anda dengan:\n• Informasi siswa, guru, dan kelas\n• Jadwal pelajaran\n• Analisis dan statistik sekolah\n• Laporan data\n\nSilakan sampaikan kebutuhan Anda." }
    ]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const bottomRef = useRef<HTMLDivElement>(null);
    const sessionId = useRef(crypto.randomUUID());

    useEffect(() => {
        if (open) bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, open]);

    const sendMessage = async () => {
        if (!input.trim() || loading) return;
        const userMsg = input.trim();
        setInput("");
        const newMessages: Message[] = [...messages, { role: "user", content: userMsg }];
        setMessages(newMessages);
        setLoading(true);
        try {
            const res = await axios.post("/api/v1/ai/chat", {
                session_id: sessionId.current,
                message: userMsg,
                history: []
            });
            setMessages([...newMessages, { role: "assistant", content: res.data.reply }]);
        } catch {
            setMessages([...newMessages, { role: "assistant", content: "Maaf, terjadi kesalahan. Silakan coba kembali." }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {/* Overlay mobile */}
            {open && (
                <div className="fixed inset-0 bg-black/30 z-40 md:hidden" onClick={() => setOpen(false)} />
            )}

            {/* Toggle Button - selalu di kanan bawah */}
            <div className="fixed bottom-6 right-6 md:bottom-8 md:right-8 z-50">
                <button onClick={() => setOpen(!open)}
                        className="w-14 h-14 bg-gradient-to-br from-fuchsia-600 to-indigo-600 rounded-full shadow-lg flex items-center justify-center hover:scale-105 transition-transform">
                    {open ? <X size={22} className="text-white" /> : <MessageCircle size={22} className="text-white" />}
                </button>
            </div>

            {/* Chat Window */}
            {open && (
                <div className="fixed z-50 bottom-0 left-0 right-0 md:bottom-28 md:left-auto md:right-8 md:w-96">
                    <div className="bg-white shadow-2xl border border-gray-100 flex flex-col overflow-hidden rounded-t-2xl md:rounded-2xl" style={{ height: "70vh", maxHeight: "560px" }}>

                        {/* Header */}
                        <div className="bg-gradient-to-r from-fuchsia-700 to-indigo-700 px-4 py-3 flex items-center justify-between shrink-0">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                                    <Bot size={16} className="text-white" />
                                </div>
                                <div>
                                    <p className="text-white text-sm font-semibold">Shinra</p>
                                    <p className="text-fuchsia-200 text-xs">AI Agent • Letta School</p>
                                </div>
                            </div>
                            <button onClick={() => setOpen(false)} className="text-white/80 hover:text-white p-1">
                                <X size={18} />
                            </button>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
                            {messages.map((msg, i) => (
                                <div key={i} className={`flex gap-2 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                                    <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                                        msg.role === "user" ? "bg-fuchsia-600" : "bg-indigo-600"
                                    }`}>
                                        {msg.role === "user"
                                            ? <User size={14} className="text-white" />
                                            : <Bot size={14} className="text-white" />
                                        }
                                    </div>
                                    <div className={`max-w-[78%] px-3 py-2 rounded-2xl text-sm whitespace-pre-wrap leading-relaxed ${
                                        msg.role === "user"
                                            ? "bg-fuchsia-600 text-white rounded-tr-sm"
                                            : "bg-white text-gray-700 shadow-sm rounded-tl-sm"
                                    }`}>
                                        {msg.content}
                                    </div>
                                </div>
                            ))}
                            {loading && (
                                <div className="flex gap-2">
                                    <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center shrink-0">
                                        <Bot size={14} className="text-white" />
                                    </div>
                                    <div className="bg-white px-4 py-3 rounded-2xl rounded-tl-sm shadow-sm">
                                        <div className="flex gap-1">
                                            <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{animationDelay:"0ms"}}></span>
                                            <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{animationDelay:"150ms"}}></span>
                                            <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{animationDelay:"300ms"}}></span>
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div ref={bottomRef} />
                        </div>

                        {/* Input */}
                        <div className="p-3 bg-white border-t flex gap-2 shrink-0">
                            <input
                                type="text"
                                value={input}
                                onChange={e => setInput(e.target.value)}
                                onKeyDown={e => e.key === "Enter" && sendMessage()}
                                placeholder="Ketik pesan Anda..."
                                className="flex-1 text-sm px-3 py-2 rounded-xl border border-gray-200 outline-none focus:border-fuchsia-400"
                            />
                            <button onClick={sendMessage} disabled={loading || !input.trim()}
                                    className="w-9 h-9 bg-fuchsia-600 hover:bg-fuchsia-700 disabled:opacity-40 rounded-xl flex items-center justify-center transition shrink-0">
                                <Send size={15} className="text-white" />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}