"use client";

import { useEffect, useState } from "react";
import { useProjectStore } from "@/stores/useProjectStore";
import { resetToEmpty } from "@/utils/serialization";

interface Props {
  onClose: () => void;
  required?: boolean;
}

export default function ProjectListModal({ onClose, required }: Props) {
  const projects = useProjectStore((s) => s.projects);
  const currentProject = useProjectStore((s) => s.currentProject);
  const loading = useProjectStore((s) => s.loading);
  const fetchProjects = useProjectStore((s) => s.fetchProjects);
  const loadProject = useProjectStore((s) => s.loadProject);
  const createProject = useProjectStore((s) => s.createProject);
  const deleteProject = useProjectStore((s) => s.deleteProject);
  const renameProject = useProjectStore((s) => s.renameProject);

  const error = useProjectStore((s) => s.error);
  const clearError = useProjectStore((s) => s.clearError);

  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [showNewInput, setShowNewInput] = useState(false);
  const [newName, setNewName] = useState("");

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  useEffect(() => {
    if (required && projects.length === 0 && !loading) {
      setShowNewInput(true);
    }
  }, [required, projects.length, loading]);

  const handleLoad = async (id: string) => {
    await loadProject(id);
    onClose();
  };

  const handleCreate = async () => {
    if (!newName.trim()) return;
    clearError();
    resetToEmpty();
    const id = await createProject(newName.trim());
    if (id) {
      setShowNewInput(false);
      setNewName("");
      onClose();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this project? This cannot be undone.")) return;
    await deleteProject(id);
  };

  const handleRenameSubmit = async (id: string) => {
    if (renameValue.trim()) {
      await renameProject(id, renameValue.trim());
    }
    setRenamingId(null);
  };

  const startRename = (id: string, currentName: string) => {
    setRenamingId(id);
    setRenameValue(currentName);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={required ? undefined : onClose}
    >
      <div
        className="bg-white rounded-xl shadow-xl p-6 w-full max-w-lg mx-4 max-h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">My Projects</h2>
          {!required && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-xl leading-none"
            >
              &times;
            </button>
          )}
        </div>

        {/* New project input */}
        {showNewInput ? (
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Project name"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") handleCreate();
                if (e.key === "Escape") setShowNewInput(false);
              }}
            />
            <button
              onClick={handleCreate}
              disabled={!newName.trim()}
              className="px-4 py-2 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50"
            >
              Create
            </button>
            <button
              onClick={() => setShowNewInput(false)}
              className="px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowNewInput(true)}
            className="w-full mb-4 px-4 py-2 text-sm text-blue-600 border border-dashed border-blue-300 rounded-lg hover:bg-blue-50"
          >
            + New Project
          </button>
        )}

        {error && (
          <p className="text-sm text-red-600 mb-3 px-1">{error}</p>
        )}

        {/* Project list */}
        <div className="flex-1 overflow-y-auto space-y-2">
          {loading && projects.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-8">Loading...</p>
          )}
          {!loading && projects.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-8">
              No projects yet. Create one to get started.
            </p>
          )}
          {projects.map((project) => (
            <div
              key={project.id}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg border transition-colors ${
                currentProject?.id === project.id
                  ? "border-blue-300 bg-blue-50"
                  : "border-gray-200 hover:bg-gray-50"
              }`}
            >
              <div className="flex-1 min-w-0">
                {renamingId === project.id ? (
                  <input
                    type="text"
                    value={renameValue}
                    onChange={(e) => setRenameValue(e.target.value)}
                    onBlur={() => handleRenameSubmit(project.id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleRenameSubmit(project.id);
                      if (e.key === "Escape") setRenamingId(null);
                    }}
                    className="w-full px-2 py-0.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    autoFocus
                  />
                ) : (
                  <>
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {project.name}
                    </p>
                    <p className="text-xs text-gray-400">
                      {formatDate(project.updated_at)}
                    </p>
                  </>
                )}
              </div>
              <div className="flex items-center gap-1 shrink-0">
                {currentProject?.id !== project.id && (
                  <button
                    onClick={() => handleLoad(project.id)}
                    className="px-2 py-1 text-xs text-blue-600 hover:bg-blue-100 rounded"
                  >
                    Open
                  </button>
                )}
                {currentProject?.id === project.id && (
                  <span className="px-2 py-1 text-xs text-blue-600 font-medium">
                    Active
                  </span>
                )}
                <button
                  onClick={() => startRename(project.id, project.name)}
                  className="px-2 py-1 text-xs text-gray-500 hover:bg-gray-100 rounded"
                  title="Rename"
                >
                  ✏️
                </button>
                <button
                  onClick={() => handleDelete(project.id)}
                  className="px-2 py-1 text-xs text-red-500 hover:bg-red-50 rounded"
                  title="Delete"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
