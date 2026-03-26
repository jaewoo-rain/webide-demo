import axios from "axios";
import config from "../config";

export async function loginApi({ username, password }) {
    try {
        const res = await axios.post(
            `${config.fastapiUrl}/auth/login`,
            {
                username,
                password,
            },
            {
                withCredentials: true,
                headers: { "Content-Type": "application/json" },
            }
        );

        return res.data;
    } catch (e) {
        if (e.response) {
            console.error("LOGIN failed:", e.response.status, e.response.data);
            throw new Error(e.response.data?.detail || `로그인 실패 (${e.response.status})`);
        } else {
            console.error("Network/Error:", e.message);
            throw new Error(`네트워크 오류: ${e.message}`);
        }
    }
}

export async function signupApi({ username, password }) {
    try {
        const res = await axios.post(
            `${config.fastapiUrl}/auth/signup`,
            { username, password },
            {
                headers: { "Content-Type": "application/json" },
            }
        );
        return res.data;
    } catch (e) {
        if (e.response) {
            throw new Error(e.response.data.detail || "회원가입 중 오류가 발생했습니다.");
        } else {
            throw new Error(`네트워크 오류: ${e.message}`);
        }
    }
}

export async function logoutApi() {
    try {
        const res = await axios.post(
            `${config.fastapiUrl}/auth/logout`,
            {},
            {
                withCredentials: true,
                headers: { "Content-Type": "application/json" },
            }
        );
        return res.data;
    } catch (e) {
        if (e.response) {
            throw new Error(e.response.data.detail || "회원가입 중 오류가 발생했습니다.");
        } else {
            throw new Error(`네트워크 오류: ${e.message}`);
        }
    }
}