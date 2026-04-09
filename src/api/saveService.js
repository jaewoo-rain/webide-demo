import axios from "axios";
import config from "../config";

export async function saveCodeApi({ code, fileName, key }) {
    try {
        const res = await axios.post(
            `${config.fastapiUrl}/save`,
            {
                code,
                key: key,
                file_name: fileName
            },
            {
                withCredentials: true,
                headers: { "Content-Type": "application/json" },
            }
        );
        console.log("코드 저장 성공", res);
    } catch (e) {
        if (e.response) {
            console.error("SAVE failed:", e.response.status, e.response.data);
            alert(`저장 실패 (${e.response.status})`);
        } else {
            console.error("Network/Error:", e.message);
            alert(`네트워크 오류: ${e.message}`);
        }
    }
}

export async function saveProjectApi({ files, key }) {
    // e.preventDefault();

    try {
        const res = await axios.post(
            `${config.fastapiUrl}/saveProject`,
            {
                files: files,
                key: key
            }, {
            withCredentials: true,
            headers: { "Content-Type": "application/json" },
        }
        );
        console.log("프로젝트 저장 성공", res)

    } catch (e) {
        if (e.response) {
            console.error("RUN failed:", e.response.status, e.response.data);
            alert(`실행 실패 (${e.response.status})`);
        } else {
            console.error("Network/Error:", e.message);
            alert(`네트워크 오류: ${e.message}`);
        }
    }
}
