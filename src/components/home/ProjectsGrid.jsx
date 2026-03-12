import React from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

export default function ProjectsGrid() {
    const navigate = useNavigate();
    const user = useSelector((state) => state.auth.user);
    const projects = useSelector((state) => state.list.projects) || [];

    const handleOpenProject = (projectName) => {
        const username = user?.username || user?.name || "user";

        navigate(
            `/ide/${username}/${projectName.toLowerCase().replace(/\s+/g, "-")}`
        );
    };

    if (!Array.isArray(projects)) {
        return (
            <div className="text-red-400">
                프로젝트 데이터 형식이 올바르지 않습니다.
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project, index) => (
                <div
                    key={project.key || index}
                    className="group bg-gray-900 border border-gray-800 rounded-2xl p-6 hover:border-blue-500/50 hover:bg-gray-800/80 transition-all duration-300 flex flex-col h-full"
                >
                    <div className="flex-1">
                        <div className="flex items-start justify-between mb-4">
                            <h3 className="text-xl font-semibold text-gray-100 group-hover:text-blue-400 transition-colors">
                                {project.project_name_raw}
                            </h3>

                            <span className="text-xs font-medium px-2 py-1 bg-gray-800 text-gray-300 rounded-md border border-gray-700">
                                Python
                            </span>
                        </div>

                        <p className="text-gray-400 text-sm line-clamp-2 mb-6">
                            owner: {project.owner_slug}
                        </p>
                    </div>

                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-800/50">
                        <span className="text-xs text-gray-500">
                            key: {project.key}
                        </span>

                        <button
                            onClick={() => handleOpenProject(project.project_name_raw)}
                            className="px-4 py-2 bg-gray-800 hover:bg-blue-600 text-white text-sm font-medium rounded-lg transition-colors border border-gray-700 hover:border-blue-500"
                        >
                            Open IDE
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
}