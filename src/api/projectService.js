import axios from "axios";
import config from "../config";

export async function createProjectApi({ project_name, user_name, image = "jaewoo6257/vnc:1.0.0" }) {
    // e.preventDefault();

    try {
        const res = await axios.post(
            `${config.fastapiUrl}/containers`,
            {
                withCredentials: true,
                project_name: project_name,
                user_name: user_name,
                image: image
            }, {
            headers: { "Content-Type": "application/json" },
        }
        );
        const data = res.data
        console.log(
            `pod_name:${data.pod_name}`,
            `novnc_port:${data.novnc_port}`,
            `namespace:${data.namespace}`,
            `deploy_name:${data.deploy_name}`,
            `svc_name:${data.svc_name}`,
            `pvc_name:${data.pvc_name}"`
        )
        return res.data;

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

// 프로젝트 삭제
export async function deleteProjectApi({ project_name, user_name }) {
    // e.preventDefault();

    try {
        const res = await axios.delete(
            `${config.fastapiUrl}/containers`,
            {
                withCredentials: true,
                params: { user_name, project_name }
            }
        );
        return res.data;

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

// 프로젝트 목록 조회
export async function projectListApi() {
    try {
        const res = await axios.get(
            `${config.fastapiUrl}/containers`,
            {
                withCredentials: true,
            }
        );

        return res.data;
    } catch (e) {
        if (e.response) {
            throw new Error(e.response.data?.detail || `사용자 조회 실패 (${e.response.status})`);
        } else {
            throw new Error(`네트워크 오류: ${e.message}`);
        }
    }
}