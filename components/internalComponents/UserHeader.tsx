import { useState, useRef, useEffect } from "react";
import { CircleUserRound, Earth, Focus, Link, LogOut, ScanFace, User } from "lucide-react";
import { useAuth } from "@/contexts/authContext";

export default function UserMenu() {
    const [open, setOpen] = useState(false);
    const [pass, setPass] = useState("");
    const [error, setError] = useState("");
    const menuRef = useRef(null);
    const { user, updateUserDetails, loggedIn, loading, login, logout } = useAuth();

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        const ok = await login(pass);

        if (!ok) {
            setError("Invalid passphrase");
        }
    }

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(e) {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setOpen(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div
            ref={menuRef}
            className={`z-1 text-stone-300 text-sm ${loggedIn
                ? "fixed top-4 right-4 flex flex-row gap-2"
                : "fixed inset-0 flex items-center justify-center px-4"
                }`}
        >
            <button
                onClick={() => setOpen(!open)}
                className="flex items-center gap-2 px-4 py-2 rounded-full
          bg-gradient-to-br from-stone-800/80 to-stone-900/80
          border border-stone-700/30 backdrop-blur-lg
          shadow-[inset_0_0_10px_rgba(0,0,0,0.4)]
          hover:from-stone-700/80 hover:to-stone-800/80
          transition-all duration-200"
            >
                {loggedIn ? (<><CircleUserRound className="h-5 w-5 text-stone-400" />
                    <span className="font-semibold bg-clip-text text-transparent bg-gradient-to-r from-white to-stone-300">
                        {user?.userName || "User"}
                    </span></>) : (
                    <div className="mr-2 italic font-light text-stone-400 flex flex-row gap-4 items-center">
                        <ScanFace strokeWidth={2.5} className="h-8 w-8 text-stone-400" />
                        <form onSubmit={handleSubmit}>
                            <input type="text" value={pass} onChange={(e) => setPass(e.target.value)} placeholder="Enter passphrase" className="bg-transparent text-xl w-80  border-none outline-none text-stone-200 italic" />
                        </form>
                        {error && <p className="text-xs text-red-400">{error}</p>}
                    </div>
                )}

            </button>

            {open && loggedIn && (
                <div
                    className="absolute right-0 mt-12 w-44 overflow-hidden z-50
            rounded-2xl
            bg-gradient-to-br from-stone-800/90 to-stone-900/90
            border border-stone-700/30
            backdrop-blur-xl
            shadow-[0_20px_40px_rgba(0,0,0,0.6)]"
                >
                    <button
                        className="w-full flex items-center gap-2 px-4 py-3 text-left
              text-stone-200 hover:bg-stone-700/40 transition"
                    >
                        <User size={16} className="text-stone-400" />
                        Profile
                    </button>



                    <button
                        onClick={() => window.location.href = "/space"}
                        className="w-full flex items-center gap-2 px-4 py-3 text-left
             text-stone-200 hover:bg-stone-700/40 transition"
                    >
                        <Earth size={16} className="text-stone-400" />
                        Space
                    </button>

                    <button
                        onClick={() => updateUserDetails({ focus_mode: !user?.focus_mode })}
                        className="w-full flex items-center gap-2 px-4 py-3 text-left
             text-stone-200 hover:bg-stone-700/40 transition"
                    >

                        <Focus size={16} className="text-stone-400" />
                        {user?.focus_mode ? "Scheduling Mode" : "Focus Mode"}
                    </button>


                    <div className="h-px bg-stone-700/40" />

                    <button
                        className="w-full flex items-center gap-2 px-4 py-3 text-left
              text-red-400 hover:bg-red-500/10 transition"
                        onClick={() => logout()}
                    >
                        <LogOut size={16} />
                        Logout
                    </button>
                </div>
            )}
        </div>
    );
}
