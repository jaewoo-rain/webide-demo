import React from "react";

export default function LoginFooter({ isLogin, setIsLogin }) {
    return (
        <div className="mt-8 text-center text-sm">
            <p className="text-gray-400">
                {isLogin ? "Don't have an account? " : "Already have an account? "}
                <button
                    onClick={() => setIsLogin(!isLogin)}
                    className="text-blue-400 font-medium hover:text-blue-300 transition-colors"
                >
                    {isLogin ? "Sign up" : "Sign in"}
                </button>
            </p>
        </div>
    );
}