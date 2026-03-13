import React, { useState } from "react";

export default function EditProjectModal({ project, onClose, onSave }) {
    const [projectName, setProjectName] = useState(project?.projectName || "");

    if (!project) return null;

    const handleSave = () => {
        const trimmedName = projectName.trim();

        if (!trimmedName) {
            alert("프로젝트 이름을 입력해주세요.");
            return;
        }

        onSave({
            ...project,
            projectName: trimmedName,
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
            <div className="w-full max-w-md rounded-2xl border border-gray-800 bg-gray-900 p-6 shadow-2xl">
                <h2 className="text-xl font-semibold text-white mb-4">
                    프로젝트 이름 수정
                </h2>

                <div className="mb-4">
                    <label className="block text-sm text-gray-400 mb-2">
                        Project Name
                    </label>
                    <input
                        type="text"
                        value={projectName}
                        onChange={(e) => setProjectName(e.target.value)}
                        className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-3 text-white outline-none focus:border-blue-500"
                        placeholder="프로젝트 이름 입력"
                    />
                </div>

                <div className="flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded-lg border border-gray-700 bg-gray-800 text-gray-300 hover:bg-gray-700 transition"
                    >
                        취소
                    </button>

                    <button
                        onClick={handleSave}
                        className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-500 transition"
                    >
                        저장
                    </button>
                </div>
            </div>
        </div>
    );
}