import React, { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
    createProjectApi,
    getProjectReadyApi,
    projectListApi,
} from "../../api/projectService";
import { setProjects } from "../../store/listSlice";

const POLL_INTERVAL_MS = 1500;
const POLL_TIMEOUT_MS = 120_000; // 2분

export default function NewProjectModal({ isOpen, onClose }) {
    const [projectName, setProjectName] = useState("");
    const [language, setLanguage] = useState("python");

    // idle | creating | waiting | error
    const [phase, setPhase] = useState("idle");
    const [phaseDetail, setPhaseDetail] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    const cancelRef = useRef(false);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    // 모달이 닫힐 때 진행중인 폴링 취소
    useEffect(() => {
        if (!isOpen) {
            cancelRef.current = true;
            setPhase("idle");
            setPhaseDetail("");
            setErrorMessage("");
            setProjectName("");
            setLanguage("python");
        } else {
            cancelRef.current = false;
        }
    }, [isOpen]);

    if (!isOpen) return null;

    // 영어, 숫자, _ 만 허용
    const regex = /^[A-Za-z0-9_]+$/;

    const validationError =
        projectName.length === 0
            ? "Project title is required."
            : !regex.test(projectName)
                ? "Only English letters, numbers, and underscore (_) allowed."
                : "";

    const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

    const waitForReady = async (key) => {
        const startedAt = Date.now();
        while (!cancelRef.current) {
            if (Date.now() - startedAt > POLL_TIMEOUT_MS) {
                throw new Error("컨테이너 준비 시간이 초과되었습니다 (2분).");
            }

            const res = await getProjectReadyApi({ key });

            if (res.status === "ready") return;
            if (res.status === "error") {
                throw new Error(
                    `컨테이너 시작 실패 (${res.reason}): ${res.message || ""}`.trim()
                );
            }

            // creating: 단계 메시지 갱신
            if (res.phase) {
                setPhaseDetail(`Container phase: ${res.phase}`);
            }

            await sleep(POLL_INTERVAL_MS);
        }
        throw new Error("취소되었습니다.");
    };

    const handleSubmit = async () => {
        if (validationError) return;

        setPhase("creating");
        setPhaseDetail("Provisioning storage and deployment...");
        setErrorMessage("");

        try {
            const created = await createProjectApi({
                project_name: projectName,
                image: language,
            });

            if (cancelRef.current) return;
            if (!created?.key) {
                throw new Error("생성 응답에 key가 없습니다.");
            }

            setPhase("waiting");
            setPhaseDetail("Waiting for container to become ready...");

            await waitForReady(created.key);
            if (cancelRef.current) return;

            // 프로젝트 목록 갱신 (홈으로 돌아왔을 때 카드 보이게)
            try {
                const list = await projectListApi();
                dispatch(setProjects(list));
            } catch (e) {
                console.warn("project list refresh failed", e);
            }

            navigate(`/ide/${created.key}`, {
                state: { vncUrl: created.vncUrl },
            });
        } catch (err) {
            if (cancelRef.current) return;
            setPhase("error");
            setErrorMessage(err.message || String(err));
        }
    };

    const handleClose = () => {
        cancelRef.current = true;
        onClose();
    };

    const handleRetry = () => {
        setPhase("idle");
        setPhaseDetail("");
        setErrorMessage("");
    };

    const isBusy = phase === "creating" || phase === "waiting";

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
            <div className="w-full max-w-md rounded-2xl border border-gray-800 bg-[#111827] shadow-2xl">

                {/* Header */}
                <div className="flex items-center justify-between border-b border-gray-800 px-6 py-4">
                    <h2 className="text-xl font-semibold text-white">
                        {phase === "error" ? "Creation Failed" : "Create New Project"}
                    </h2>

                    <button
                        onClick={handleClose}
                        disabled={isBusy}
                        className="text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                        ✕
                    </button>
                </div>

                {/* Body */}
                {phase === "idle" && (
                    <div className="space-y-5 px-6 py-5">
                        {/* Project Title */}
                        <div>
                            <label className="block text-sm text-gray-200 mb-2">
                                Project Title
                            </label>

                            <input
                                value={projectName}
                                onChange={(e) => setProjectName(e.target.value)}
                                placeholder="example_project"
                                className="w-full rounded-xl border border-gray-700 bg-gray-900 px-4 py-3 text-white outline-none focus:border-blue-500"
                            />

                            <p className="text-xs text-gray-400 mt-2">
                                English letters, numbers, and underscore (_) only
                            </p>

                            {projectName && validationError && (
                                <p className="text-sm text-red-400 mt-1">
                                    {validationError}
                                </p>
                            )}
                        </div>

                        {/* Language */}
                        <div>
                            <label className="block text-sm text-gray-200 mb-2">
                                Language
                            </label>

                            <select
                                value={language}
                                onChange={(e) => setLanguage(e.target.value)}
                                className="w-full rounded-xl border border-gray-700 bg-gray-900 px-4 py-3 text-white outline-none focus:border-blue-500"
                            >
                                <option value="python">Python</option>
                                <option value="javascript">JavaScript</option>
                            </select>
                        </div>
                    </div>
                )}

                {isBusy && (
                    <div className="px-6 py-8 flex flex-col items-center text-center">
                        <div className="h-12 w-12 mb-4 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
                        <p className="text-white text-sm font-medium mb-1">
                            {phase === "creating"
                                ? "Creating workspace..."
                                : "Almost there..."}
                        </p>
                        <p className="text-gray-400 text-xs">
                            {phaseDetail}
                        </p>
                        <p className="text-gray-500 text-xs mt-3">
                            This usually takes 20–60 seconds.
                        </p>
                    </div>
                )}

                {phase === "error" && (
                    <div className="px-6 py-6">
                        <div className="rounded-lg border border-red-700 bg-red-900/30 p-4">
                            <p className="text-red-300 text-sm break-words">
                                {errorMessage}
                            </p>
                        </div>
                    </div>
                )}

                {/* Footer */}
                <div className="flex justify-end gap-3 border-t border-gray-800 px-6 py-4">

                    {phase === "idle" && (
                        <>
                            <button
                                onClick={handleClose}
                                className="px-4 py-2 border border-gray-700 text-gray-300 rounded-xl hover:bg-gray-800"
                            >
                                Cancel
                            </button>

                            <button
                                onClick={handleSubmit}
                                disabled={!!validationError}
                                className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-500 disabled:bg-blue-900 disabled:text-gray-400"
                            >
                                Create
                            </button>
                        </>
                    )}

                    {isBusy && (
                        <button
                            onClick={handleClose}
                            className="px-4 py-2 border border-gray-700 text-gray-300 rounded-xl hover:bg-gray-800"
                        >
                            Cancel
                        </button>
                    )}

                    {phase === "error" && (
                        <>
                            <button
                                onClick={handleClose}
                                className="px-4 py-2 border border-gray-700 text-gray-300 rounded-xl hover:bg-gray-800"
                            >
                                Close
                            </button>
                            <button
                                onClick={handleRetry}
                                className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-500"
                            >
                                Retry
                            </button>
                        </>
                    )}

                </div>

            </div>
        </div>
    );
}