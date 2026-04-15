
// export default function Sidebar(){

//     function clickFile(){
//         console.log("파일 한번 클릭")
//     }

//     function openPage(){
//         console.log("페이지 오픈");
//     }

//     function onEdit(){
//         console.log("이름 수정 버튼")
//     }

//     function onDelete(){
//         console.log("이름 삭제 버튼")
//     }

//     function addFile(){
//         console.log("파일 추가 버튼")
//     }

//     function addFolder(){
//         console.log("폴더 추가")
//     }

//     function reload(){
//         console.log("새로고침")
//     }

//     let renderFile = function(key){
//         return(
//             <div
//             key={key}
//             onClick={(e)=>{
//                 e.stopPropagation();
//                 clickFile();
//             }}   
//             onDoubleClick={(e)=>{
//                 e.stopPropagation();
//                 openPage();

//             }} 
//             className={"flex items-center justify-between py-1 px-2 hover:bg-[#37373D] rounded cursor-poiner"} 
//             >
//                 <div className="flex items-center">
//                     <div className="w-4 h-4 flex items-center justify-center mr-1">
//                         <i className="ri-file-code-line text-[#519ABA]"></i>
//                     </div>
//                     <span className="text-white">파일이름</span>
//                 </div>
//                 <div className="flex items-center">
//                     <div className="flex items-center space-x-2">
//                         <button
//                         className="px-2 py-1 text-xs bg-gray-700 hover:bg-gray-600 rounded text-white"
//                         onClick={(e)=>{
//                             e.stopPropagation(); 
//                             onEdit()
//                         }}
//                         >
//                             수정
//                         </button>
//                     </div>

//                     <div className="flex items-center space-x-2">
//                         <button
//                         className="px-2 py-1 text-xs bg-gray-700 hover:bg-gray-600 rounded text-white ml-1"
//                         onClick={(e)=>{
//                             e.stopPropagation(); 
//                             onDelete()
//                         }}
//                         >
//                             삭제
//                         </button>
//                     </div>
//                 </div>
//             </div>
//         )
//     }

//     return(
//         <div className="w-64 bg-[#252526] border-r border-[#333] flex flex-col">
//             <div className="flex items-center justify-between p-2 border-b border-[#333]">
//                 <span className="font-semibold">파일 탐색기</span>
//                 <div className="flex">
//                     <button className="w-6 h-6 flex items-center justify-center text-[#D4D4D4] hover:bg-[#3C3C3C] rounded-button"
//                         onClick={()=>{
//                             addFile();
//                         }}
//                     >
//                         <i className="ri-file-add-line"></i>
//                     </button>
//                     <button className="w-6 h-6 flex items-center justify-center text-[#D4D4D4] hover:bg-[#3C3C3C] rounded-button"
//                         onClick={()=>{
//                             addFolder();
//                         }}
//                     >
//                         <i className="ri-folder-add-line"></i>
//                     </button>
//                     <button className="w-6 h-6 flex items-center justify-center text-[#D4D4D4] hover:bg-[#3C3C3C] rounded-button"
//                         onClick={()=>{
//                             reload();
//                         }}
//                     >
//                         <i className="ri-refresh-line"></i>
//                     </button>
//                 </div>
//             </div>

//             {/* 프로젝트 부분 */}
//             <div className="flex-1 overflow-y-auto p-1">
//                 <div className="mb-1">
//                     <div className="flex items-center py-1 px-2 hover:bg-[#37373D] rounded cursor-pointer">
//                         <div className="w-4 h-4 flex items-center justify-center mr-1">
//                             <i className="ri-folder-open-line text-[#CCCC29]"></i>
//                         </div>
//                         <span>프로젝트</span>
//                     </div>
//                     <div className="ml-4">
//                         {renderFile(1)}
//                         {renderFile(2)}
//                         {renderFile(3)}
//                     </div>
//                 </div>
//                 <div className="flex items-center py-1 px-2 hover:bg-[#37373D] rounded cursor-pointer">
//                 <div className="w-4 h-4 flex items-center justify-center mr-1">
//                 <i className="ri-folder-line text-[#CCCC29]"></i>
//                 </div>
//                 <span>라이브러리</span>
//             </div>

//           </div>
//         </div>

//     )
// }
import { useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addFile } from "../../store/projectSlice";
import { openFile } from "../../store/openPageSlice";

function makeFileId() {
    return `file-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function TreeNode({ node, depth = 0, onOpenFile }) {
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
                onClick={handleClick}
                className="flex items-center py-1 px-2 hover:bg-[#37373D] rounded cursor-pointer text-white select-none"
                style={{ paddingLeft: `${depth * 12 + 8}px` }}
            >
                <div className="w-4 h-4 flex items-center justify-center mr-1">
                    {isFolder ? (
                        <i
                            className={`${expanded ? "ri-arrow-down-s-line" : "ri-arrow-right-s-line"} text-gray-400`}
                        ></i>
                    ) : (
                        <i className="ri-file-code-line text-[#519ABA]"></i>
                    )}
                </div>

                <span>{node.name || "root"}</span>
            </div>

            {isFolder && expanded && node.children?.length > 0 && (
                <div>
                    {node.children.map((child) => (
                        <TreeNode
                            key={child.id}
                            node={child}
                            depth={depth + 1}
                            onOpenFile={onOpenFile}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

export default function Sidebar() {
    const dispatch = useDispatch();
    const tree = useSelector((s) => s.project.tree);
    const fileMap = useSelector((s) => s.project.files);

    const fileNames = useMemo(
        () => new Set(Object.values(fileMap).map((file) => file.name)),
        [fileMap]
    );

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

    function openPage(fileId) {
        dispatch(openFile(fileId));
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
                <TreeNode node={tree} onOpenFile={openPage} />
            </div>
        </div>
    );
}