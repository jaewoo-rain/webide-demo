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

function insertNodeIntoTree(node, parentId, newNode) {
  if (node.id === parentId) {
    if (!node.children) node.children = [];
    node.children.push(newNode);
    return true;
  }

  if (!node.children) return false;

  for (const child of node.children) {
    if (insertNodeIntoTree(child, parentId, newNode)) {
      return true;
    }
  }

  return false;
}

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

    addFolder(state, action) {
      const { id, name, path, relative_path, parentId = "root" } = action.payload;
      if (state.files[id]) return;

      state.files[id] = {
        id,
        name,
        type: "folder",
        path,
        relative_path,
        content: null,
      };

      const newNode = {
        id,
        name,
        type: "folder",
        children: [],
      };

      insertNodeIntoTree(state.tree, parentId, newNode);
    },

    addFile(state, action) {
      const { id, name, path, relative_path, code = "", parentId = "root" } = action.payload;
      if (state.files[id]) return;

      state.files[id] = {
        id,
        name,
        type: "file",
        path,
        relative_path,
        content: code,
      };

      const newNode = {
        id,
        name,
        type: "file",
        children: [],
      };

      insertNodeIntoTree(state.tree, parentId, newNode);
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

    renameFolder(state, action) {
      const { folderId, newName } = action.payload;
      const folder = state.files[folderId];
      if (!folder) return;

      const oldBase = folder.relative_path;

      const parts = oldBase.split("/");
      parts[parts.length - 1] = newName;

      const newBase = parts.join("/");

      // 모든 하위 경로 변경
      for (const id in state.files) {
        const file = state.files[id];

        if (file.relative_path.startsWith(oldBase)) {
          file.relative_path = file.relative_path.replace(oldBase, newBase);
          file.path = `/opt/workspace/${file.relative_path}`;
        }
      }

      // 트리 이름 변경
      const updateNodeName = (node) => {
        if (node.id === folderId) {
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

      const collectIds = (node, targetId) => {
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

        if (!node.children) return null;

        for (const child of node.children) {
          const result = collectIds(child, targetId);
          if (result) return result;
        }

        return null;
      };

      const idsToDelete = collectIds(state.tree, fileId) ?? [fileId];

      for (const id of idsToDelete) {
        delete state.files[id];
      }

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
  addFolder,
  addFile,
  setCode,
  renameFile,
  deleteFile,
  setVncUrl,
  renameFolder,
} = projectSlice.actions;

export default projectSlice.reducer;