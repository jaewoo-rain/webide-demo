import React from "react";

export default function DeleteConfirmModal({
    project,
    onClose,
    onConfirm,
}) {
    if (!project) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
            <div className="w-full max-w-md rounded-2xl border border-gray-800 bg-gray-900 p-6 shadow-2xl">
                <h2 className="text-xl font-semibold text-white mb-3">
                    프로젝트 삭제
                </h2>

                <p className="text-sm text-gray-400 mb-6 leading-relaxed">
                    정말로{" "}
                    <span className="font-semibold text-white">
                        {project.projectName}
                    </span>
                    {" "}프로젝트를 삭제하시겠습니까?
                    <br />
                    이 작업은 되돌릴 수 없습니다.
                </p>

                <div className="flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded-lg border border-gray-700 bg-gray-800 text-gray-300 hover:bg-gray-700 transition"
                    >
                        취소
                    </button>

                    <button
                        onClick={() => onConfirm(project.key)}
                        className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-500 transition"
                    >
                        삭제
                    </button>
                </div>
            </div>
        </div>
    );
}