import axios from "axios";
import config from "../config";

export async function runCodeApi({ code, setRunMode, projectKey }) {
    // e.preventDefault();

    try {
        const res = await axios.post(
            `${config.fastapiUrl}/run`,
            {
                code: code,
                projectKey: projectKey,
            }, {
            withCredentials: true,
            headers: { "Content-Type": "application/json" },
        }
        );
        setRunMode(res.data.mode)
        console.log("바꿈")

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
