import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { createProjectApi, projectListApi } from "../../api/projectService";
import { setProjects } from "../../store/listSlice";

export default function NewProjectModal({ isOpen, onClose }) {
    const [projectName, setProjectName] = useState("");
    const [language, setLanguage] = useState("python");

    const dispatch = useDispatch();

    const onCreate = async (data) => {
        console.log("새 프로젝트 생성:", data.projectName);

        await createProjectApi({ project_name: data.projectName, image: data.language })
        const projectList = await projectListApi();

        dispatch(setProjects(projectList));

    };

    if (!isOpen) return null;

    // 영어, 숫자, _ 만 허용
    const regex = /^[A-Za-z0-9_]+$/;

    const error =
        projectName.length === 0
            ? "Project title is required."
            : !regex.test(projectName)
                ? "Only English letters, numbers, and underscore (_) allowed."
                : "";

    const handleChange = (e) => {
        const value = e.target.value;
        setProjectName(value);
    };

    const handleSubmit = () => {
        if (error) return;

        if (onCreate) {
            onCreate({
                projectName,
                language,
            });
        }

        setProjectName("");
        setLanguage("python");
        onClose();
    };

    const handleClose = () => {
        setProjectName("");
        setLanguage("python");
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
            <div className="w-full max-w-md rounded-2xl border border-gray-800 bg-[#111827] shadow-2xl">

                {/* Header */}
                <div className="flex items-center justify-between border-b border-gray-800 px-6 py-4">
                    <h2 className="text-xl font-semibold text-white">
                        Create New Project
                    </h2>

                    <button
                        onClick={handleClose}
                        className="text-gray-400 hover:text-white"
                    >
                        ✕
                    </button>
                </div>

                {/* Body */}
                <div className="space-y-5 px-6 py-5">

                    {/* Project Title */}
                    <div>
                        <label className="block text-sm text-gray-200 mb-2">
                            Project Title
                        </label>

                        <input
                            value={projectName}
                            onChange={handleChange}
                            placeholder="example_project"
                            className="w-full rounded-xl border border-gray-700 bg-gray-900 px-4 py-3 text-white outline-none focus:border-blue-500"
                        />

                        <p className="text-xs text-gray-400 mt-2">
                            English letters, numbers, and underscore (_) only
                        </p>

                        {projectName && error && (
                            <p className="text-sm text-red-400 mt-1">
                                {error}
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

                {/* Footer */}
                <div className="flex justify-end gap-3 border-t border-gray-800 px-6 py-4">

                    <button
                        onClick={handleClose}
                        className="px-4 py-2 border border-gray-700 text-gray-300 rounded-xl hover:bg-gray-800"
                    >
                        Cancel
                    </button>

                    <button
                        onClick={handleSubmit}
                        disabled={!!error}
                        className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-500 disabled:bg-blue-900 disabled:text-gray-400"
                    >
                        Create
                    </button>

                </div>

            </div>
        </div>
    );
}