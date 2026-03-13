import { useState } from "react";
import Editor from "../components/ide/Editor";
import Header from "../components/ide/Header";
import Sidebar from "../components/ide/Slidebar";
import Terminal from "../components/ide/Terminal";
import { GuiModal } from "../components/ide/GuiModal";
import { useParams } from "react-router-dom";

export default function IdePage() {
  const [runMode, setRunMode] = useState("cli");
  const [isReady, setReady] = useState(false);
  const { projectKey } = useParams();

  return (
    <div className="flex flex-col h-screen bg-[#252526]">
      {runMode === "gui" && <GuiModal onClose={() => setRunMode("cli")} />}
      <Header
        setRunMode={setRunMode}
        projectKey={projectKey}
      />

      <div className="relative flex flex-1 min-h-0 overflow-hidden">
        {/* Ready 전 오버레이 */}
        {!isReady && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60">
            <div className="px-4 py-3 rounded-lg bg-[#1E1E1E] border border-[#333] text-white/80 text-sm">
              터미널 연결 중...
            </div>
          </div>
        )}

        <div className="w-64 shrink-0">
          <Sidebar />
        </div>

        <div className="w-1 bg-[#333] cursor-col-resize" />

        <div className="flex-1 flex flex-col min-h-0">
          <Editor />
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
