import axios from "axios";
import config from "../config";

export async function runCodeApi({ files, currentFile, setRunMode, projectKey }) {
    try {
        const current = currentFile ? files[currentFile] : null;
        if (!current) {
            throw new Error("실행할 파일이 없습니다.");
        }

        const fileList = Object.values(files)
            .filter((file) => file.type === "file")
            .map((file) => ({
                name: file.name,
                relative_path: file.relative_path,
                code: file.content ?? "",
            }));

        const payload = {
            projectKey,
            entryFile: current.relative_path ?? current.name,
            files: fileList,
        };

        console.log("RUN payload =", JSON.stringify(payload, null, 2));

        const res = await axios.post(
            `${config.fastapiUrl}/run`,
            payload,
            {
                withCredentials: true,
                headers: { "Content-Type": "application/json" },
            }
        );

        setRunMode(res.data.mode);
        return res.data;
    } catch (e) {
        if (e.response) {
            console.error("RUN failed:", e.response.status, e.response.data);
            throw new Error(e.response.data?.detail || `실행 실패 (${e.response.status})`);
        } else {
            console.error("Network/Error:", e.message);
            throw new Error(`네트워크 오류: ${e.message}`);
        }
    }
}