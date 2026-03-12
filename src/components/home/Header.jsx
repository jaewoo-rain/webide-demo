import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../store/authSlice";

export default function Header() {
    const dispatch = useDispatch();
    const user = useSelector((state) => state.auth.user);

    const handleLogout = () => {
        dispatch(logout());
    };

    return (
        <header className="border-b border-gray-800 bg-gray-900 sticky top-0 z-10">
            <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">

                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-sm text-white">
                        J
                    </div>
                    <span className="font-semibold text-xl tracking-tight">
                        JCOLAB IDE
                    </span>
                </div>

                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2 text-sm text-gray-300">
                        <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center border border-gray-700">
                            {user?.name?.charAt(0) || "U"}
                        </div>
                        <span className="hidden sm:inline-block font-medium">
                            {user?.name || "User"}
                        </span>
                    </div>

                    <button
                        onClick={handleLogout}
                        className="text-sm font-medium text-gray-400 hover:text-white transition-colors"
                    >
                        Sign out
                    </button>
                </div>

            </div>
        </header>
    );
}