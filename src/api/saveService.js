import axios from "axios";
import config from "../config";

export async function saveCodeApi({ code, fileName, relativePath, key }) {
    try {
        const res = await axios.post(
            `${config.fastapiUrl}/save`,
            {
                code,
                key,
                file_name: fileName,
                relative_path: relativePath,
                base_path: "/opt/workspace",
            },
            {
                withCredentials: true,
                headers: { "Content-Type": "application/json" },
            }
        );
        return res.data;
    } catch (e) {
        if (e.response) {
            console.error("SAVE CODE failed:", e.response.status);
            console.error("SAVE CODE detail:", JSON.stringify(e.response.data, null, 2));
            throw new Error(e.response.data?.detail || `파일 저장 실패 (${e.response.status})`);
        } else {
            console.error("Network/Error:", e.message);
            throw new Error(`네트워크 오류: ${e.message}`);
        }
    }
}

export async function saveProjectApi({ files, projectKey }) {
    try {
        const fileList = Object.values(files)
            .filter((file) => file.type === "file")
            .map((file) => ({
                name: file.name,
                relative_path: file.relative_path,
                code: file.content ?? "",
            }));

        const payload = {
            key: projectKey,
            base_path: "/opt/workspace",
            files: fileList,
        };

        console.log("SAVE PROJECT payload =", JSON.stringify(payload, null, 2));

        const res = await axios.post(
            `${config.fastapiUrl}/saveProject`,
            payload,
            {
                withCredentials: true,
                headers: { "Content-Type": "application/json" },
            }
        );

        return res.data;
    } catch (e) {
        if (e.response) {
            console.error("SAVE PROJECT failed:", e.response.status);
            console.error("SAVE PROJECT detail:", JSON.stringify(e.response.data, null, 2));
            throw new Error(e.response.data?.detail || `프로젝트 저장 실패 (${e.response.status})`);
        } else {
            console.error("SAVE PROJECT network error:", e.message);
            throw new Error(`네트워크 오류: ${e.message}`);
        }
    }
}