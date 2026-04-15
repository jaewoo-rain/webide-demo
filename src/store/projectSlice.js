import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  projectName: "",
  podName: "",
  VNCSrc: "",
  tree: {
    id: "root",
    name: "",
    type: "folder",
    children: [],
  },
  files: {},
};

const projectSlice = createSlice({
  name: "project",
  initialState,
  reducers: {
    initProject(state, action) {
      const { projectName, podName = "", port = null, vncUrl = "" } = action.payload;
      state.projectName = projectName;
      state.podName = podName;

      if (vncUrl) {
        state.VNCSrc = vncUrl;
      } else if (port) {
        state.VNCSrc = `http://210.117.181.56:${port}/vnc.html?autoconnect=true&password=jaewoo`;
      }
    },

    setProjectFiles(state, action) {
      const { tree, fileMap } = action.payload;
      state.tree = tree;
      state.files = fileMap;
    },

    clearProject(state) {
      state.projectName = "";
      state.podName = "";
      state.VNCSrc = "";
      state.tree = {
        id: "root",
        name: "",
        type: "folder",
        children: [],
      };
      state.files = {};
    },

    addFile(state, action) {
      const { id, name, path, relative_path, code = "" } = action.payload;
      if (state.files[id]) return;

      state.files[id] = {
        id,
        name,
        type: "file",
        path,
        relative_path,
        content: code,
      };

      state.tree.children.push({
        id,
        name,
        type: "file",
        children: [],
      });
    },

    setCode(state, action) {
      const { fileId, newContent } = action.payload;
      if (!state.files[fileId]) return;
      state.files[fileId].content = newContent;
    },

    renameFile(state, action) {
      const { fileId, newName } = action.payload;
      const file = state.files[fileId];
      if (!file) return;

      const oldRelativePath = file.relative_path;
      const parts = oldRelativePath.split("/");
      parts[parts.length - 1] = newName;

      const newRelativePath = parts.join("/");
      const newPath = `/opt/workspace/${newRelativePath}`;

      file.name = newName;
      file.relative_path = newRelativePath;
      file.path = newPath;

      const updateNodeName = (node) => {
        if (node.id === fileId) {
          node.name = newName;
          return true;
        }

        if (!node.children) return false;

        for (const child of node.children) {
          if (updateNodeName(child)) return true;
        }
        return false;
      };

      updateNodeName(state.tree);
    },

    deleteFile(state, action) {
      const fileId = action.payload;
      delete state.files[fileId];

      const removeNode = (node) => {
        if (!node.children) return;

        node.children = node.children.filter((child) => child.id !== fileId);

        for (const child of node.children) {
          removeNode(child);
        }
      };

      removeNode(state.tree);
    },

    setVncUrl(state, action) {
      state.VNCSrc = action.payload;
    },
  },
});

export const {
  initProject,
  setProjectFiles,
  clearProject,
  addFile,
  setCode,
  renameFile,
  deleteFile,
  setVncUrl,
} = projectSlice.actions;

export default projectSlice.reducer;