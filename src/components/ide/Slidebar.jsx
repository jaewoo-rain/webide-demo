
import { useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addFile } from "../../store/projectSlice";
import { openFile } from "../../store/openPageSlice";
import { renameFileApi, deleteFileApi } from "../../api/projectService";
import { renameFile, deleteFile } from "../../store/projectSlice";
import { closePage } from "../../store/openPageSlice";

function makeFileId() {
    return `file-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function TreeNode({ node, depth = 0, onOpenFile, onRenameFile, onDeleteFile }) {
    const [expanded, setExpanded] = useState(true);
    const isFolder = node.type === "folder";

    const handleClick = () => {
        if (isFolder) {
            setExpanded((prev) => !prev);
        } else {
            onOpenFile(node.id);
        }
    };

    return (
        <div>
            <div
                className="group flex items-center py-1 px-2 hover:bg-[#37373D] rounded cursor-pointer text-white select-none"
                style={{ paddingLeft: `${depth * 12 + 8}px` }}
            >
                <div onClick={handleClick} className="flex items-center flex-1 min-w-0">
                    <div className="w-4 h-4 flex items-center justify-center mr-1">
                        {isFolder ? (
                            <i className={`${expanded ? "ri-arrow-down-s-line" : "ri-arrow-right-s-line"} text-gray-400`}></i>
                        ) : (
                            <i className="ri-file-code-line text-[#519ABA]"></i>
                        )}
                    </div>

                    <span className="truncate">{node.name || "root"}</span>
                </div>

                {!isFolder && node.id !== "root" && (
                    <div className="hidden group-hover:flex items-center gap-1 ml-2">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onRenameFile(node.id);
                            }}
                            className="text-gray-400 hover:text-white"
                        >
                            <i className="ri-edit-line"></i>
                        </button>

                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onDeleteFile(node.id);
                            }}
                            className="text-gray-400 hover:text-red-400"
                        >
                            <i className="ri-delete-bin-line"></i>
                        </button>
                    </div>
                )}
            </div>

            {isFolder && expanded && node.children?.length > 0 && (
                <div>
                    {node.children.map((child) => (
                        <TreeNode
                            key={child.id}
                            node={child}
                            depth={depth + 1}
                            onOpenFile={onOpenFile}
                            onRenameFile={onRenameFile}
                            onDeleteFile={onDeleteFile}
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
    const openTabs = useSelector((s) => s.openPage.open);
    const current = useSelector((s) => s.openPage.current);

    const fileNames = useMemo(
        () => new Set(Object.values(fileMap).map((file) => file.name)),
        [fileMap]
    );

    function openPage(fileId) {
        dispatch(openFile(fileId));
    }

    async function handleRename(fileId) {
        const file = fileMap[fileId];
        if (!file) return;

        const newName = prompt("새 파일 이름", file.name);
        if (!newName || newName === file.name) return;

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

            dispatch(renameFile({ fileId, newName }));
        } catch (e) {
            alert(e.message);
        }
    }

    async function handleDelete(fileId) {
        const file = fileMap[fileId];
        if (!file) return;

        const ok = confirm(`${file.name} 파일을 삭제할까요?`);
        if (!ok) return;

        try {
            await deleteFileApi({
                key: projectKey,
                relativePath: file.relative_path,
            });

            dispatch(deleteFile(fileId));
            dispatch(closePage(fileId));
        } catch (e) {
            alert(e.message);
        }
    }

    function addNewFile() {
        let base = "new_file";
        let ext = ".py";
        let index = 1;
        let fileName = `${base}${index}${ext}`;

        while (fileNames.has(fileName)) {
            index += 1;
            fileName = `${base}${index}${ext}`;
        }

        const id = makeFileId();

        dispatch(
            addFile({
                id,
                name: fileName,
                path: `/opt/workspace/${fileName}`,
                relative_path: fileName,
                code: "",
            })
        );

        dispatch(openFile(id));
    }

    return (
        <div className="w-64 bg-[#252526] border-r border-[#333] flex flex-col">
            <div className="flex items-center justify-between p-2 border-b border-[#333]">
                <span className="font-semibold text-white">파일 탐색기</span>
                <div className="flex">
                    <button
                        className="w-6 h-6 flex items-center justify-center text-[#D4D4D4] hover:bg-[#3C3C3C]"
                        onClick={addNewFile}
                    >
                        <i className="ri-file-add-line"></i>
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-2">
                <TreeNode
                    node={tree}
                    onOpenFile={openPage}
                    onRenameFile={handleRename}
                    onDeleteFile={handleDelete}
                />
            </div>
        </div>
    );
}