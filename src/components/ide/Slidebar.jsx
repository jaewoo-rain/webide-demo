import { useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    addFile,
    addFolder,
    renameFile,
    deleteFile,
    renameFolder,
} from "../../store/projectSlice";
import { openFile, removeManyOpenPages } from "../../store/openPageSlice";
import {
    renameFileApi,
    deleteFileApi,
    createFolderApi,
    deleteFolderApi,
} from "../../api/projectService";
import { saveCodeApi } from "../../api/saveService";

function makeNodeId(prefix = "node") {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function joinRelativePath(parentRelativePath, name) {
    if (!parentRelativePath) return name;
    return `${parentRelativePath}/${name}`;
}

function compareNodeNames(aName = "", bName = "") {
    return aName.localeCompare(bName, undefined, {
        numeric: true,
        sensitivity: "base",
    });
}

function getParentRelativePath(relativePath = "") {
    const parts = relativePath.split("/");
    parts.pop();
    return parts.join("/");
}

function TreeNode({
    node,
    depth = 0,
    fileMap,
    onOpenFile,
    onRenameStart,
    onDeleteFile,
    onCreateFile,
    onCreateFolder,
    editingId,
    editingName,
    setEditingName,
    onRenameSubmit,
    onRenameCancel,
}) {
    const [expanded, setExpanded] = useState(true);
    const isFolder = node.type === "folder";
    const isEditing = editingId === node.id;

    const handleClick = () => {
        if (isEditing) return;

        if (isFolder) {
            setExpanded((prev) => !prev);
        } else {
            onOpenFile(node.id);
        }
    };

    // 폴더 / 파일 정렬
    const sortedChildren = [...(node.children ?? [])].sort((a, b) => {
        // 1) 폴더 먼저
        if (a.type !== b.type) {
            return a.type === "folder" ? -1 : 1;
        }

        // 2) 같은 타입이면 자연 정렬
        return compareNodeNames(a.name || "", b.name || "");
    });

    return (
        <div>
            <div
                className="group flex items-center py-1 px-2 hover:bg-[#37373D] rounded cursor-pointer text-white select-none"
                style={{ paddingLeft: `${depth * 12 + 8}px` }}
            >
                <div onClick={handleClick} className="flex items-center flex-1 min-w-0">
                    <div className="w-4 h-4 flex items-center justify-center mr-1 shrink-0">
                        {isFolder ? (
                            <i
                                className={`${expanded ? "ri-arrow-down-s-line" : "ri-arrow-right-s-line"} text-gray-400`}
                            ></i>
                        ) : (
                            <i className="ri-file-code-line text-[#519ABA]"></i>
                        )}
                    </div>

                    {isEditing ? (
                        <input
                            autoFocus
                            value={editingName}
                            onChange={(e) => setEditingName(e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") onRenameSubmit(node.id);
                                if (e.key === "Escape") onRenameCancel();
                            }}
                            onBlur={() => onRenameSubmit(node.id)}
                            className="flex-1 min-w-0 bg-[#1E1E1E] border border-[#555] rounded px-2 py-0.5 text-sm text-white outline-none"
                        />
                    ) : (
                        <span className="truncate">{node.name || "root"}</span>
                    )}
                </div>

                {!isEditing && isFolder && (
                    <div className="hidden group-hover:flex items-center gap-1 ml-2 shrink-0">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onCreateFile(node.id);
                            }}
                            className="text-gray-400 hover:text-white"
                            title="파일 생성"
                        >
                            <i className="ri-file-add-line"></i>
                        </button>

                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onCreateFolder(node.id);
                            }}
                            className="text-gray-400 hover:text-white"
                            title="폴더 생성"
                        >
                            <i className="ri-folder-add-line"></i>
                        </button>

                        {node.id !== "root" && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onRenameStart(node.id);
                                }}
                                className="text-gray-400 hover:text-white"
                                title="폴더 이름 변경"
                            >
                                <i className="ri-edit-line"></i>
                            </button>
                        )}

                        {node.id !== "root" && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onDeleteFile(node.id);
                                }}
                                className="text-gray-400 hover:text-red-400"
                                title="폴더 삭제"
                            >
                                <i className="ri-delete-bin-line"></i>
                            </button>
                        )}
                    </div>
                )}

                {!isEditing && !isFolder && node.id !== "root" && (
                    <div className="hidden group-hover:flex items-center gap-1 ml-2 shrink-0">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onRenameStart(node.id);
                            }}
                            className="text-gray-400 hover:text-white"
                            title="이름 변경"
                        >
                            <i className="ri-edit-line"></i>
                        </button>

                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onDeleteFile(node.id);
                            }}
                            className="text-gray-400 hover:text-red-400"
                            title="삭제"
                        >
                            <i className="ri-delete-bin-line"></i>
                        </button>
                    </div>
                )}
            </div>

            {isFolder && expanded && sortedChildren.length > 0 && (
                <div>
                    {sortedChildren.map((child) => (
                        <TreeNode
                            key={child.id}
                            node={child}
                            depth={depth + 1}
                            fileMap={fileMap}
                            onOpenFile={onOpenFile}
                            onRenameStart={onRenameStart}
                            onDeleteFile={onDeleteFile}
                            onCreateFile={onCreateFile}
                            onCreateFolder={onCreateFolder}
                            editingId={editingId}
                            editingName={editingName}
                            setEditingName={setEditingName}
                            onRenameSubmit={onRenameSubmit}
                            onRenameCancel={onRenameCancel}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

export default function Sidebar({ projectKey }) {
    const dispatch = useDispatch();
    const tree = useSelector((s) => s.project.tree);
    const fileMap = useSelector((s) => s.project.files);

    const [editingId, setEditingId] = useState(null);
    const [editingName, setEditingName] = useState("");

    function openPage(fileId) {
        dispatch(openFile(fileId));
    }

    function collectChildIds(node, targetId) {
        if (node.id === targetId) {
            const ids = [];

            const walk = (n) => {
                ids.push(n.id);
                if (n.children) {
                    for (const child of n.children) {
                        walk(child);
                    }
                }
            };

            walk(node);
            return ids;
        }

        if (!node.children) return [];

        for (const child of node.children) {
            const result = collectChildIds(child, targetId);
            if (result.length > 0) return result;
        }

        return [];
    }

    function getSiblingNames(targetId) {
        const target = fileMap[targetId];
        if (!target) return new Set();

        const parentRelativePath = getParentRelativePath(target.relative_path);

        return new Set(
            Object.values(fileMap)
                .filter((item) => item.id !== targetId)
                .filter((item) => getParentRelativePath(item.relative_path) === parentRelativePath)
                .map((item) => item.name)
        );
    }

    function getChildNamesOfParent(parentId = "root") {
        const parent = parentId === "root" ? null : fileMap[parentId];
        const parentRelativePath = parent?.relative_path ?? "";

        return new Set(
            Object.values(fileMap)
                .filter((item) => getParentRelativePath(item.relative_path) === parentRelativePath)
                .map((item) => item.name)
        );
    }

    function handleRenameStart(fileId) {
        const file = fileMap[fileId];
        if (!file) return;

        setEditingId(fileId);
        setEditingName(file.name);
    }

    function handleRenameCancel() {
        setEditingId(null);
        setEditingName("");
    }

    async function handleRenameSubmit(fileId) {
        const file = fileMap[fileId];
        if (!file) {
            handleRenameCancel();
            return;
        }

        const newName = editingName.trim();

        if (!newName || newName === file.name) {
            handleRenameCancel();
            return;
        }

        const siblingNames = getSiblingNames(fileId);
        if (siblingNames.has(newName)) {
            alert("같은 위치에 동일한 이름의 파일/폴더가 이미 존재합니다.");
            handleRenameCancel();
            return;
        }

        try {
            const oldRelativePath = file.relative_path;
            const parts = oldRelativePath.split("/");
            parts[parts.length - 1] = newName;
            const newRelativePath = parts.join("/");

            await renameFileApi({
                key: projectKey,
                oldRelativePath,
                newRelativePath,
            });

            if (file.type === "folder") {
                dispatch(renameFolder({ folderId: fileId, newName }));
            } else {
                dispatch(renameFile({ fileId, newName }));
            }

            handleRenameCancel();
        } catch (e) {
            alert(e.message);
        }
    }

    async function handleDelete(fileId) {
        const file = fileMap[fileId];
        if (!file) return;

        const isFolder = file.type === "folder";
        const ok = confirm(
            isFolder
                ? `${file.name} 폴더와 내부 내용을 모두 삭제할까요?`
                : `${file.name} 파일을 삭제할까요?`
        );
        if (!ok) return;

        try {
            const idsToRemove = collectChildIds(tree, fileId);

            if (isFolder) {
                await deleteFolderApi({
                    key: projectKey,
                    relativePath: file.relative_path,
                });
            } else {
                await deleteFileApi({
                    key: projectKey,
                    relativePath: file.relative_path,
                });
            }

            dispatch(deleteFile(fileId));
            dispatch(removeManyOpenPages(idsToRemove));
        } catch (e) {
            alert(e.message);
        }
    }

    async function handleCreateFile(parentId = "root") {
        const parent = parentId === "root" ? null : fileMap[parentId];
        const parentRelativePath = parent?.relative_path ?? "";

        const siblingNames = getChildNamesOfParent(parentId);

        let base = "new_file";
        let ext = ".py";
        let index = 1;
        let fileName = `${base}${index}${ext}`;

        while (siblingNames.has(fileName)) {
            index += 1;
            fileName = `${base}${index}${ext}`;
        }

        const candidateRelativePath = joinRelativePath(parentRelativePath, fileName);

        try {
            await saveCodeApi({
                code: "",
                fileName,
                relativePath: candidateRelativePath,
                key: projectKey,
            });

            const id = makeNodeId("file");

            dispatch(
                addFile({
                    id,
                    name: fileName,
                    path: `/opt/workspace/${candidateRelativePath}`,
                    relative_path: candidateRelativePath,
                    code: "",
                    parentId,
                })
            );

            dispatch(openFile(id));
        } catch (e) {
            alert(e.message);
        }
    }

    async function handleCreateFolder(parentId = "root") {
        const parent = parentId === "root" ? null : fileMap[parentId];
        const parentRelativePath = parent?.relative_path ?? "";

        const siblingNames = getChildNamesOfParent(parentId);

        let base = "new_folder";
        let index = 1;
        let folderName = `${base}${index}`;

        while (siblingNames.has(folderName)) {
            index += 1;
            folderName = `${base}${index}`;
        }

        const candidateRelativePath = joinRelativePath(parentRelativePath, folderName);

        try {
            await createFolderApi({
                key: projectKey,
                relativePath: candidateRelativePath,
            });

            const id = makeNodeId("folder");

            dispatch(
                addFolder({
                    id,
                    name: folderName,
                    path: `/opt/workspace/${candidateRelativePath}`,
                    relative_path: candidateRelativePath,
                    parentId,
                })
            );
        } catch (e) {
            alert(e.message);
        }
    }

    return (
        <div className="w-64 bg-[#252526] border-r border-[#333] flex flex-col">
            <div className="flex items-center justify-between p-2 border-b border-[#333]">
                <span className="font-semibold text-white">파일 탐색기</span>
                <div className="flex gap-1">
                    <button
                        className="w-6 h-6 flex items-center justify-center text-[#D4D4D4] hover:bg-[#3C3C3C]"
                        onClick={() => handleCreateFile("root")}
                        title="루트 파일 생성"
                    >
                        <i className="ri-file-add-line"></i>
                    </button>

                    <button
                        className="w-6 h-6 flex items-center justify-center text-[#D4D4D4] hover:bg-[#3C3C3C]"
                        onClick={() => handleCreateFolder("root")}
                        title="루트 폴더 생성"
                    >
                        <i className="ri-folder-add-line"></i>
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-2">
                <TreeNode
                    node={tree}
                    depth={0}
                    fileMap={fileMap}
                    onOpenFile={openPage}
                    onRenameStart={handleRenameStart}
                    onDeleteFile={handleDelete}
                    onCreateFile={handleCreateFile}
                    onCreateFolder={handleCreateFolder}
                    editingId={editingId}
                    editingName={editingName}
                    setEditingName={setEditingName}
                    onRenameSubmit={handleRenameSubmit}
                    onRenameCancel={handleRenameCancel}
                />
            </div>
        </div>
    );
}