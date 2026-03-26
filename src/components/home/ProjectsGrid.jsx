import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import EditProjectModal from "./EditProjectModal";
import DeleteConfirmModal from "./DeleteConfirmModal";
import { deleteProjectApi, projectListApi } from "../../api/projectService";
import { setProjects } from "../../store/listSlice";

export default function ProjectsGrid() {
    const navigate = useNavigate();
    const projects = useSelector((state) => state.list.projects ?? []);
    const dispatch = useDispatch();

    const [projectList, setProjectList] = useState([]);
    const [selectedProject, setSelectedProject] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);

    useEffect(() => {
        setProjectList(projects);
    }, [projects]);

    const handleOpenProject = (projectKey, vncUrl) => {
        navigate(`/ide/${projectKey}`, {
            state: { vncUrl }
        });
    };

    const handleEdit = (project) => {
        console.log("edit project:", project);
        setSelectedProject(project);
    };

    const handleAskDelete = (project) => {
        setDeleteTarget(project);
    };

    const handleDelete = async (key) => {
        await deleteProjectApi({ key });
        console.log("delete project:", key);

        const updatedProjectList = await projectListApi();
        dispatch(setProjects(updatedProjectList));

        setDeleteTarget(null);
    };

    const handleCloseModal = () => {
        setSelectedProject(null);
    };

    const handleCloseDeleteModal = () => {
        setDeleteTarget(null);
    };

    const handleSaveProject = (updatedProject) => {
        const updatedProjects = projectList.map((project) =>
            project.key === updatedProject.key ? updatedProject : project
        );

        setProjectList(updatedProjects);
        console.log("updated project:", updatedProject);
        handleCloseModal();
    };

    if (!Array.isArray(projectList)) {
        return (
            <div className="text-red-400">
                프로젝트 데이터 형식이 올바르지 않습니다.
            </div>
        );
    }

    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projectList.map((project, index) => (
                    <div
                        key={project.key || index}
                        className="group bg-gray-900 border border-gray-800 rounded-2xl p-6 hover:border-blue-500/50 hover:bg-gray-800/80 transition-all duration-300 flex flex-col h-full"
                    >
                        <div className="flex-1">
                            <div className="flex items-start justify-between mb-4">
                                <h3 className="text-xl font-semibold text-gray-100 group-hover:text-blue-400 transition-colors">
                                    {project.projectName}
                                </h3>

                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleEdit(project)}
                                        className="text-xs px-2 py-1 bg-gray-800 hover:bg-blue-600 text-gray-300 hover:text-white rounded-md border border-gray-700 transition"
                                    >
                                        편집
                                    </button>

                                    <button
                                        onClick={() => handleAskDelete(project)}
                                        className="text-xs px-2 py-1 bg-gray-800 hover:bg-red-600 text-gray-300 hover:text-white rounded-md border border-gray-700 transition"
                                    >
                                        삭제
                                    </button>
                                </div>
                            </div>

                            <p className="text-gray-400 text-sm line-clamp-2 mb-6">
                                owner: {project.username}
                            </p>
                        </div>

                        <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-800/50">
                            <span className="text-xs font-medium px-2 py-1 bg-gray-800 text-gray-300 rounded-md border border-gray-700">
                                Python
                            </span>

                            <button
                                onClick={() => handleOpenProject(project.key, project.vncUrl)}
                                className="px-4 py-2 bg-gray-800 hover:bg-blue-600 text-white text-sm font-medium rounded-lg transition-colors border border-gray-700 hover:border-blue-500"
                            >
                                Open IDE
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {selectedProject && (
                <EditProjectModal
                    key={selectedProject.key}
                    project={selectedProject}
                    onClose={handleCloseModal}
                    onSave={handleSaveProject}
                />
            )}

            {deleteTarget && (
                <DeleteConfirmModal
                    key={deleteTarget.key}
                    project={deleteTarget}
                    onClose={handleCloseDeleteModal}
                    onConfirm={handleDelete}
                />
            )}
        </>
    );
}