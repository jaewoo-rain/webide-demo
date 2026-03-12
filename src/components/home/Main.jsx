import React from "react";
import ProjectsGrid from "./ProjectsGrid";

export default function Main() {
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

                <button className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-xl shadow-lg shadow-blue-500/20 transition-all active:scale-[0.98] flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path
                            fillRule="evenodd"
                            d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                            clipRule="evenodd"
                        />
                    </svg>
                    New Project
                </button>
            </div>

            <ProjectsGrid />

        </main>
    );
}