import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import Editor from "../components/ide/Editor";
import Header from "../components/ide/Header";
import Sidebar from "../components/ide/Slidebar";
import Terminal from "../components/ide/Terminal";
import { GuiModal } from "../components/ide/GuiModal";
import { useLocation, useParams } from "react-router-dom";
import FileTabs from "../components/ide/FileTabs";
import { loadProjectFilesApi } from "../api/projectService";
import { initProject, setProjectFiles } from "../store/projectSlice";
import { openFile, resetOpenPages } from "../store/openPageSlice";

// IDE
export default function IdePage() {
  const [runMode, setRunMode] = useState("cli");
  const [isReady, setReady] = useState(false);

  const { projectKey } = useParams();
  const location = useLocation();
  const dispatch = useDispatch();

  const vncUrl = location.state?.vncUrl;

  useEffect(() => {
    let mounted = true;

    const loadProject = async () => {
      try {
        dispatch(resetOpenPages());

        dispatch(
          initProject({
            projectName: projectKey,
            vncUrl: vncUrl ?? "",
          })
        );

        const result = await loadProjectFilesApi({ key: projectKey });
        if (!mounted) return;

        dispatch(
          setProjectFiles({
            tree: result.tree,
            fileMap: result.fileMap,
          })
        );

        const firstFileId = Object.values(result.fileMap).find(
          (item) => item.type === "file"
        )?.id;

        if (firstFileId) {
          dispatch(openFile(firstFileId));
        }
      } catch (error) {
        console.error("프로젝트 로드 실패:", error);
        alert(error.message);
      }
    };

    loadProject();

    return () => {
      mounted = false;
    };
  }, [dispatch, projectKey, vncUrl]);

  return (
    <div className="flex flex-col h-screen bg-[#252526]">
      {runMode === "gui" && (
        <GuiModal
          onClose={() => setRunMode("cli")}
          vncUrl={vncUrl}
        />
      )}

      <Header
        setRunMode={setRunMode}
        projectKey={projectKey}
      />

      <div className="relative flex flex-1 min-h-0 overflow-hidden">
        {!isReady && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60">
            <div className="px-4 py-3 rounded-lg bg-[#1E1E1E] border border-[#333] text-white/80 text-sm">
              터미널 연결 중...
            </div>
          </div>
        )}

        <div className="w-64 shrink-0">
          <Sidebar projectKey={projectKey} />
        </div>

        <div className="w-1 bg-[#333] cursor-col-resize" />

        <div className="flex-1 flex flex-col min-h-0">
          <FileTabs />
          <Editor projectKey={projectKey} />

          <div className="h-1 bg-[#333] cursor-row-resize" />

          <div className="h-[200px] overflow-hidden">
            <Terminal
              projectKey={projectKey}
              setReady={setReady}
            />
          </div>
        </div>
      </div>
    </div>
  );
}