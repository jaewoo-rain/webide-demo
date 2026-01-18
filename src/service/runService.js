import axios from "axios";
import config from "../config";
import { data } from "autoprefixer";

export async function runCodeApi({ code, setRunMode, podName = "vnc-test" }) {
    // e.preventDefault();

    try {
        const res = await axios.post(
            `http://${config.fastapiUrl}/run`,
            {
                code: code, pod_name: "vnc-test",
            }, {
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
