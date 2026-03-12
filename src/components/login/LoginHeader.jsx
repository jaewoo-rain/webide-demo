export default function LoginHeader({ isLogin }) {

    return (
        <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-blue-500 mb-2">JCOLAB IDE</h1>
            <p className="text-gray-400 text-sm">
                {isLogin
                    ? "Welcome back! Please enter your details."
                    : "Create an account to get started."}
            </p>
        </div>
    );
}