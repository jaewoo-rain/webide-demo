import React from "react";

export default function LoginForm({
    isLogin,
    handleSubmit,
    userId,
    setUserId,
    password,
    setPassword,
    name,
    setName,
    loading,
}) {
    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                        Name
                    </label>
                    <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none text-white placeholder-gray-500"
                        placeholder="John Doe"
                    />
                </div>
            )}

            <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                    User ID
                </label>
                <input
                    type="text"
                    required
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none text-white placeholder-gray-500"
                    placeholder="Enter your ID"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                    Password
                </label>
                <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none text-white placeholder-gray-500"
                    placeholder="••••••••"
                />
            </div>

            {isLogin && (
                <div className="flex justify-end">
                    <a
                        href="#"
                        className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
                    >
                        Forgot password?
                    </a>
                </div>
            )}

            <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 disabled:cursor-not-allowed text-white font-medium rounded-xl shadow-lg shadow-blue-500/20 transform transition-all active:scale-[0.98]"
            >
                {loading ? "Loading..." : isLogin ? "Sign In" : "Sign Up"}
            </button>
        </form>
    );
}