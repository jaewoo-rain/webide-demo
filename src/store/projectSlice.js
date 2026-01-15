import { createSlice } from "@reduxjs/toolkit";


let projectSlice = createSlice({
  name: "project",
  initialState: {
    code: ""
  },
  reducers: {
    setCode(state, action) {
      const code = action.payload;
      state.code = code;
    },
  }
})

export const { setCode } = projectSlice.actions;
export default projectSlice.reducer;

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