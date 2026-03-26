import { createSlice } from "@reduxjs/toolkit";

const projectSlice = createSlice({
  name: "project",
  initialState: {
    projectName: "my-project",
    podName: "vnc-test",
    VNCSrc: "http://210.117.181.56:3607/vnc.html?autoconnect=true&password=jaewoo",
    activeFile: "main.py",
    files: {
      "main.py": {
        code: "",
      },
    },
  },

  reducers: {
    initProject(state, action) {
      const { projectName, podName, port } = action.payload;
      state.projectName = projectName;
      state.podName = podName;
      state.VNCSrc = `http://210.117.181.56:${port}/vnc.html?autoconnect=true&password=jaewoo`;
    },

    addFile(state, action) {
      const { fileName, code = "" } = action.payload;
      if (!state.files[fileName]) {
        state.files[fileName] = { code };
      }
    },
    // 파일 선택
    setActiveFile(state, action) {
      state.activeFile = action.payload;
    },

    setCode(state, action) {
      const { fileName, code } = action.payload;
      if (!state.files[fileName]) return;
      state.files[fileName].code = code;
    },

    setVncPort(state, action) {
      const port = action.payload;
      state.VNCSrc = `http://210.117.181.56:${port}/vnc.html?autoconnect=true&password=jaewoo`;
    },
  },
});

export const { initProject, addFile, setActiveFile, setCode, setVncPort } =
  projectSlice.actions;

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