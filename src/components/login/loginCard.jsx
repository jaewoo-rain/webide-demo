import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { login } from "../../store/authSlice";
import { setProjects } from "../../store/listSlice";
import { loginApi, signupApi } from "../../api/loginService";
import { projectListApi } from "../../api/projectService";
import LoginHeader from "./LoginHeader";
import LoginForm from "./LoginForm";
import LoginFooter from "./LoginFooter";

export default function LoginCard({
    isLogin,
    setIsLogin,
    userId,
    setUserId,
    password,
    setPassword,
    name,
    setName,
}) {
    const dispatch = useDispatch();
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!userId || !password) {
            alert("아이디와 비밀번호를 입력해주세요.");
            return;
        }

        if (!isLogin) {

            try {

                const result = await signupApi({
                    username: userId,
                    password,
                });

                console.log("회원가입 성공", result);

            } catch (error) {
                console.error("회원가입 에러:", error);
                alert(error.message);
            } finally {
                setIsLogin(true);
            }

            return
        }

        try {
            setLoading(true);

            const result = await loginApi({
                username: userId,
                password,
            });

            const projectList = await projectListApi();

            if (!projectList) {
                throw new Error("프로젝트 정보를 불러오지 못했습니다.");
            }

            dispatch(
                login({
                    username: result.username,
                })
            );

            dispatch(setProjects(projectList));

            console.log("로그인 성공, 프로젝트 목록: ", projectList);
        } catch (error) {
            console.error("로그인 에러:", error);
            alert(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-md bg-gray-900 border border-gray-800 rounded-2xl shadow-xl overflow-hidden z-10">
            <div className="p-8">
                <LoginHeader isLogin={isLogin} />

                <LoginForm
                    isLogin={isLogin}
                    handleSubmit={handleSubmit}
                    userId={userId}
                    setUserId={setUserId}
                    password={password}
                    setPassword={setPassword}
                    name={name}
                    setName={setName}
                    loading={loading}
                />

                <LoginFooter isLogin={isLogin} setIsLogin={setIsLogin} />
            </div>
        </div>
    );
}