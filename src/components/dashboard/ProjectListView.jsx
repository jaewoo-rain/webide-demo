import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout } from '../../store/authSlice';

export default function ProjectListView() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);

  // Mock projects data
  const [projects] = useState([
    { id: '1', name: 'React Dashboard', description: 'Admin panel built with React and Tailwind', updated: '2 hours ago', language: 'JavaScript' },
    { id: '2', name: 'API Server', description: 'Express backend architecture', updated: '1 day ago', language: 'Node.js' },
    { id: '3', name: 'Portfolio Site', description: 'Personal portfolio using Next.js', updated: '3 days ago', language: 'TypeScript' },
  ]);

  const handleLogout = () => {
    dispatch(logout());
  };

  const handleOpenProject = (projectName) => {
    // Navigate to IDE, assuming userName is parsed from email or name
    const userName = user?.name?.toLowerCase().replace(/\s+/g, '-') || 'user';
    navigate(`/ide/${userName}/${projectName.toLowerCase().replace(/\s+/g, '-')}`);
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-sm text-white">
              J
            </div>
            <span className="font-semibold text-xl tracking-tight">JCOLAB IDE</span>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-sm text-gray-300">
              <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center border border-gray-700">
                {user?.name?.charAt(0) || 'U'}
              </div>
              <span className="hidden sm:inline-block font-medium">{user?.name || 'User'}</span>
            </div>
            <button
              onClick={handleLogout}
              className="text-sm font-medium text-gray-400 hover:text-white transition-colors"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto px-6 py-12 w-full">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-100">
              My Projects
            </h1>
            <p className="text-gray-400 mt-2">Manage and edit your recent workspaces</p>
          </div>
          <button className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-xl shadow-lg shadow-blue-500/20 transition-all active:scale-[0.98] flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            New Project
          </button>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <div
              key={project.id}
              className="group bg-gray-900 border border-gray-800 rounded-2xl p-6 hover:border-blue-500/50 hover:bg-gray-800/80 transition-all duration-300 flex flex-col h-full"
            >
              <div className="flex-1">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-xl font-semibold text-gray-100 group-hover:text-blue-400 transition-colors">
                    {project.name}
                  </h3>
                  <span className="text-xs font-medium px-2 py-1 bg-gray-800 text-gray-300 rounded-md border border-gray-700">
                    {project.language}
                  </span>
                </div>
                <p className="text-gray-400 text-sm line-clamp-2 mb-6">
                  {project.description}
                </p>
              </div>

              <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-800/50">
                <span className="text-xs text-gray-500">
                  Updated {project.updated}
                </span>
                <button
                  onClick={() => handleOpenProject(project.name)}
                  className="px-4 py-2 bg-gray-800 hover:bg-blue-600 text-white text-sm font-medium rounded-lg transition-colors border border-gray-700 hover:border-blue-500"
                >
                  Open IDE
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
