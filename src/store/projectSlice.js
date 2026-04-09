import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  projectName: "my-project",
  podName: "vnc-test",
  VNCSrc: "http://210.117.181.56:3607/vnc.html?autoconnect=true&password=jaewoo",

  files: {
    "main.py": {
      name: "main.py",
      code: 'print("hello")',
    },
  },
};

const projectSlice = createSlice({
  name: "project",
  initialState,
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
        state.files[fileName] = {
          name: fileName,
          code,
        };
      }
    },

    deleteFile(state, action) {
      const fileName = action.payload;
      delete state.files[fileName];
    },

    renameFile(state, action) {
      const { oldFileName, newFileName } = action.payload;
      if (!state.files[oldFileName] || state.files[newFileName]) return;

      state.files[newFileName] = {
        ...state.files[oldFileName],
        name: newFileName,
      };
      delete state.files[oldFileName];
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

export const {
  initProject,
  addFile,
  deleteFile,
  renameFile,
  setCode,
  setVncPort,
} = projectSlice.actions;

export default projectSlice.reducer;