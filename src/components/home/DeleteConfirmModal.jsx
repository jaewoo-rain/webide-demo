import React, { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { deleteProjectApi, projectListApi } from "../../api/projectService";
import { setProjects } from "../../store/listSlice";

export default function DeleteConfirmModal({ project, onClose }) {
    // confirm | deleting | error
    const [phase, setPhase] = useState("confirm");
    const [errorMessage, setErrorMessage] = useState("");

    const cancelRef = useRef(false);
    const dispatch = useDispatch();

    useEffect(() => {
        cancelRef.current = false;
        return () => {
            cancelRef.current = true;
        };
    }, []);

    if (!project) return null;

    const handleConfirm = async () => {
        setPhase("deleting");
        setErrorMessage("");

        try {
            await deleteProjectApi({ key: project.key });
            if (cancelRef.current) return;

            try {
                const list = await projectListApi();
                dispatch(setProjects(list));
            } catch (e) {
                console.warn("project list refresh failed", e);
            }

            if (cancelRef.current) return;
            onClose();
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
        setPhase("confirm");
        setErrorMessage("");
    };

    const isBusy = phase === "deleting";

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
            <div className="w-full max-w-md rounded-2xl border border-gray-800 bg-gray-900 p-6 shadow-2xl">

                <h2 className="text-xl font-semibold text-white mb-3">
                    {phase === "error" ? "삭제 실패" : "프로젝트 삭제"}
                </h2>

                {phase === "confirm" && (
                    <p className="text-sm text-gray-400 mb-6 leading-relaxed">
                        정말로{" "}
                        <span className="font-semibold text-white">
                            {project.projectName}
                        </span>
                        {" "}프로젝트를 삭제하시겠습니까?
                        <br />
                        이 작업은 되돌릴 수 없습니다.
                    </p>
                )}

                {isBusy && (
                    <div className="py-6 flex flex-col items-center text-center">
                        <div className="h-12 w-12 mb-4 border-4 border-red-500/30 border-t-red-500 rounded-full animate-spin" />
                        <p className="text-white text-sm font-medium mb-1">
                            Deleting workspace...
                        </p>
                        <p className="text-gray-400 text-xs">
                            Tearing down container, storage, and service
                        </p>
                    </div>
                )}

                {phase === "error" && (
                    <div className="mb-6 rounded-lg border border-red-700 bg-red-900/30 p-4">
                        <p className="text-red-300 text-sm break-words">
                            {errorMessage}
                        </p>
                    </div>
                )}

                <div className="flex justify-end gap-3">
                    {phase === "confirm" && (
                        <>
                            <button
                                onClick={handleClose}
                                className="px-4 py-2 rounded-lg border border-gray-700 bg-gray-800 text-gray-300 hover:bg-gray-700 transition"
                            >
                                취소
                            </button>

                            <button
                                onClick={handleConfirm}
                                className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-500 transition"
                            >
                                삭제
                            </button>
                        </>
                    )}

                    {isBusy && (
                        <button
                            onClick={handleClose}
                            className="px-4 py-2 rounded-lg border border-gray-700 bg-gray-800 text-gray-300 hover:bg-gray-700 transition"
                        >
                            닫기
                        </button>
                    )}

                    {phase === "error" && (
                        <>
                            <button
                                onClick={handleClose}
                                className="px-4 py-2 rounded-lg border border-gray-700 bg-gray-800 text-gray-300 hover:bg-gray-700 transition"
                            >
                                닫기
                            </button>
                            <button
                                onClick={handleRetry}
                                className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-500 transition"
                            >
                                재시도
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
