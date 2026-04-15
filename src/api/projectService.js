import axios from "axios";
import config from "../config";

export async function createProjectApi({ project_name, image = "jaewoo6257/vnc:1.0.0" }) {
    // e.preventDefault();

    try {
        const res = await axios.post(
            `${config.fastapiUrl}/containers`,
            {
                project_name: project_name,
                image: "jaewoo6257/vnc:1.0.0"
            }, {
            withCredentials: true,
            headers: { "Content-Type": "application/json" },
        }
        );
        // const data = res.data
        // console.log(
        //     `pod_name:${data.pod_name}`,
        //     `novnc_port:${data.novnc_port}`,
        //     `namespace:${data.namespace}`,
        //     `deploy_name:${data.deploy_name}`,
        //     `svc_name:${data.svc_name}`,
        //     `pvc_name:${data.pvc_name}"`
        // )
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
export async function deleteProjectApi({ key }) {
    // e.preventDefault();

    try {
        const res = await axios.delete(
            `${config.fastapiUrl}/containers`,
            {
                withCredentials: true,
                params: { key }
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

// 프로젝트 파일 조회
export async function loadProjectFilesApi({ key }) {
    try {
        const res = await axios.get(
            `${config.fastapiUrl}/projects/${encodeURIComponent(key)}/files`,
            {
                withCredentials: true,
            }
        );
        return res.data;
    } catch (e) {
        if (e.response) {
            console.error("LOAD PROJECT FILES failed:", e.response.status, e.response.data);
            throw new Error(e.response.data?.detail || `프로젝트 파일 불러오기 실패 (${e.response.status})`);
        }
        console.error("Network/Error:", e.message);
        throw new Error(`네트워크 오류: ${e.message}`);
    }
}


// 파일 이름 변경
export async function renameFileApi({ key, oldRelativePath, newRelativePath }) {
    try {
        const res = await axios.post(
            `${config.fastapiUrl}/rename`,
            {
                key,
                old_relative_path: oldRelativePath,
                new_relative_path: newRelativePath,
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
            throw new Error(e.response.data?.detail || `파일 이름 변경 실패 (${e.response.status})`);
        }
        throw new Error(`네트워크 오류: ${e.message}`);
    }
}

// 파일 삭제
export async function deleteFileApi({ key, relativePath }) {
    try {
        const res = await axios.post(
            `${config.fastapiUrl}/delete`,
            {
                key,
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
            throw new Error(e.response.data?.detail || `파일 삭제 실패 (${e.response.status})`);
        }
        throw new Error(`네트워크 오류: ${e.message}`);
    }
}

// 폴더 생성
export async function createFolderApi({ key, relativePath }) {
    try {
        const res = await axios.post(
            `${config.fastapiUrl}/mkdir`,
            {
                key,
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
            throw new Error(e.response.data?.detail || `폴더 생성 실패 (${e.response.status})`);
        }
        throw new Error(`네트워크 오류: ${e.message}`);
    }
}


// 폴더 삭제
export async function deleteFolderApi({ key, relativePath }) {
    try {
        const res = await axios.post(
            `${config.fastapiUrl}/delete-folder`,
            {
                key,
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
            throw new Error(e.response.data?.detail || `폴더 삭제 실패 (${e.response.status})`);
        }
        throw new Error(`네트워크 오류: ${e.message}`);
    }
}