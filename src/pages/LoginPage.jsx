import React, { useState } from "react";
import LoginCard from "../components/login/loginCard";

export default function LoginPage() {
    const [isLogin, setIsLogin] = useState(true);
    const [userId, setUserId] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-950 text-white p-4">
            <LoginCard
                isLogin={isLogin}
                setIsLogin={setIsLogin}
                userId={userId}
                setUserId={setUserId}
                password={password}
                setPassword={setPassword}
                name={name}
                setName={setName}
            />
        </div>
    );
}