import axios from "axios";
import config from "../config";

export async function saveCodeApi({ code, file_name = "main.py", podName = "vnc-test" }) {
    // e.preventDefault();

    try {
        const res = await axios.post(
            `${config.fastapiUrl}/save`,
            {
                code: code,
                pod_name: podName,
                file_name: file_name
            }, {
            headers: { "Content-Type": "application/json" },
        }
        );
        console.log("성공", res)

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
