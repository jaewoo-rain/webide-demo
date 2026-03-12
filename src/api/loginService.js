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
                headers: { "Content-Type": "application/json" },
            }
        );

        console.log("로그인 성공", res.data);
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