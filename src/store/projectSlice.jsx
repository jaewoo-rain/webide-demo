import { createSlice, nanoid, createAsyncThunk } from "@reduxjs/toolkit";
import { newPageOpen } from "./openPageSlice";
import config from "./config";

const fastBase = config.fastapiUrl

// export const initializeProject = createAsyncThunk(
//     'project/initialize',
//     async ({ cid, token }, { dispatch }) => {
//         const res = await fetch(`${fastBase}/files/${cid}`, {
//             headers: { Authorization: `Bearer ${token}` },
//         });
//         if (!res.ok) {
//             throw new Error(`Failed to fetch files: ${res.statusText}`);
//         }
//         const data = await res.json();
//         dispatch(setProjectStructure(data));

//         const { fileMap } = data;
//         if (Object.keys(fileMap).length > 1) {
//             const lastOpenFileId = localStorage.getItem("lastOpenFileId");
//             if (lastOpenFileId && fileMap[lastOpenFileId]) {
//                 dispatch(newPageOpen(lastOpenFileId));
//             } else {
//                 const firstFile = Object.keys(fileMap).find(fileId => fileId !== 'root' && fileMap[fileId].type === 'file');
//                 if (firstFile) {
//                     dispatch(newPageOpen(firstFile));
//                 }
//             }
//         }
//         return data;
//     }
// );

// let project = createSlice({
//     name: "project",
//     initialState: {
//         tree: {
//             id: "root",
//             type: "folder",
//             children: [] // 초기 상태 비워두기
//         },
//         fileMap: {
//             root: { name: "", type: "folder" } // 초기 상태 비워두기
//         },
//         isShow:{
//             state: false,
//         },
//         isLoaded: false, // 로딩 상태 플래그 추가
//     },
//     reducers:{
//         // 서버 데이터로 상태를 설정하는 리듀서 추가
//         setProjectStructure(state, action) {
//             const { tree, fileMap } = action.payload;
//             state.tree = tree;
//             state.fileMap = fileMap;
//             state.isLoaded = true; // 로딩 완료로 상태 변경
//         },

//         addFile(state, action) {
//             let { fileName, parentId, newId } = action.payload;
//             if (!fileName || fileName.trim() === "") return;

//             // ✅ 동일 폴더 내 이름 중복 방지
//             if (hasNameInFolder(state, parentId, fileName)) {
//                 // 필요하면 에러 상태 저장 or 토스트용 플래그 세팅
//                 return;
//             }

//             state.fileMap[newId] = { name: fileName, content: "", type: "file" };

//             const parentNode = findNode(state.tree, parentId);
//             if (parentNode && parentNode.type === "folder") {
//                 parentNode.children.push({ id: newId, type: "file" });
//             }
//             },

//             addFolder(state, action) {
//             let { folderName, parentId } = action.payload;
//             if (!folderName || folderName.trim() === "") return;

//             // 동일 폴더 내 이름 중복 방지
//             if (hasNameInFolder(state, parentId, folderName)) {
//                 // 필요하면 에러 상태 저장 or 토스트용 플래그 세팅
//                 return;
//             }

//             const newId = nanoid();
//             state.fileMap[newId] = { name: folderName, type: "folder" };

//             const parentNode = findNode(state.tree, parentId);
//             if (parentNode && parentNode.type === "folder") {
//                 if (!parentNode.children) parentNode.children = [];
//                 parentNode.children.push({ id: newId, type: "folder", children: [] });
//             }
//         },
//         setCode(state, action){
//             let {fileId, newContent} = action.payload;
//             if (state.fileMap[fileId] && state.fileMap[fileId].type === "file") {
//                 state.fileMap[fileId].content = newContent;
//             }
//         },
//         // 파일 추가 시 이름 지정하는 필드 보여주기
//         changeState(state){
//             state.isShow.state = !state.isShow.state;
//         },
//         deleteFile(state, action) {
//             const fileIdToDelete = action.payload;
//             if (!fileIdToDelete || !state.fileMap[fileIdToDelete]) return;

//             // 부모 노드 찾기 및 children 배열에서 삭제
//             const parentNode = findParentNode(state.tree, fileIdToDelete);
//             if (parentNode && parentNode.children) {
//                 parentNode.children = parentNode.children.filter(child => child.id !== fileIdToDelete);
//             }

//             // fileMap에서 삭제
//             delete state.fileMap[fileIdToDelete];
//         },
//         renameNode(state, action) {
//             const { nodeId, newName } = action.payload;
//             if (state.fileMap[nodeId]) {
//                 state.fileMap[nodeId].name = newName;
//             }
//         },
//         updateNodePath(state, action) {
//             const { nodeId, newPath } = action.payload;
//             if (state.fileMap[nodeId]) {
//                 state.fileMap[nodeId].path = newPath;
//             }
//         },
//         resetProject(state) {
//             state.tree = { id: "root", type: "folder", children: [] };
//             state.fileMap = { root: { name: "", type: "folder" } };
//             state.isLoaded = false;
//         }
//         // todo:파일 & 폴더 삭제
//         // todo:파일 & 폴더 이름 바꾸기
//         // todo:코드 수정

//     }
// })


// // 이름 중복 검사 (같은 폴더 내, 파일/폴더 구분 없이, 대소문자 무시)
// function hasNameInFolder(state, parentId, name) {
//   const parent = findNode(state.tree, parentId);
//   if (!parent || parent.type !== "folder") return false;

//   const target = name.trim().toLowerCase();
//   if (!parent.children) return false;

//   return parent.children.some(child => {
//     const node = state.fileMap[child.id];
//     if (!node) return false;
//     const childName = (node.name || "").trim().toLowerCase();
//     return childName === target;
//   });
// }



// // DFS 깊이 우선 탐색
// function findNode(current, targetId){
//     if(current.id == targetId) {
//         return current;
//     }
//     if(!current.children) return null;

//     for(let child of current.children){
//         let result = findNode(child, targetId);
//         if(result){
//             return result;
//         }
//     }
//     return null;
// }

// function findParentNode(current, targetId) {
//     if (current.children) {
//         for (const child of current.children) {
//             if (child.id === targetId) {
//                 return current;
//             }
//             const found = findParentNode(child, targetId);
//             if (found) {
//                 return found;
//             }
//         }
//     }
//     return null;
// }

let project = createSlice({
    name:"project",
    initialState: {
        project : {
            code: "",
        }
    },
    reducers:{
        setCode(state, action){
            const code = action.payload;
            state.project.content = code;
        }
    }
})

export let {setCode} = project.actions
export default project

/**
 * tree 구조1
 * {
  "src": {
    "main.py": "print('hello')",
    "components": {
      "header.js": "console.log('header')"
    }
  },
  "README.md": "# 프로젝트 설명"
}
 */

/** 
 * tree 구조2 구조/내용 분리하기
{
  mode: 'cli',
  tree: {
    id: 'root',
    type:"folder"
    children: [
      { id: 'file1', type:"file" },
      { id: 'folder1' type:"folder", children: [{ id: 'file2', type:"file"}] }
    ]
  },
  fileMap: {
    file1: { name: 'README.md', type: 'file', content: '# Hello' },
    file2: { name: 'App.js', type: 'file', content: 'console.log()' },
    folder1: { name: 'src', type: 'folder' },
  }
}

 */