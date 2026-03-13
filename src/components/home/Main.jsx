import React, { useState } from "react";
import ProjectsGrid from "./ProjectsGrid";
import NewProjectModal from "./NewProjectModal";

export default function Main() {

    const [isModalOpen, setIsModalOpen] = useState(false);


    return (
        <main className="flex-1 max-w-7xl mx-auto px-6 py-12 w-full">

            <div className="flex items-center justify-between mb-8">

                <div>
                    <h1 className="text-3xl font-bold text-gray-100">
                        My Projects
                    </h1>

                    <p className="text-gray-400 mt-2">
                        Manage and edit your recent workspaces
                    </p>
                </div>

                <button
                    onClick={() => setIsModalOpen(true)}
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-xl shadow-lg shadow-blue-500/20 transition-all active:scale-[0.98] flex items-center gap-2"
                >
                    New Project
                </button>

            </div>

            <ProjectsGrid />

            <NewProjectModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />

        </main>
    );
}