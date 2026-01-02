import Editor from "../components/ide/Editor";
import Header from "../components/ide/Header";
import Sidebar from "../components/ide/Slidebar";

export default function IdePage(){
    return (
    <div className="flex flex-col h-screen bg-[#252526]">
      <Header />

      <div className="flex flex-1 min-h-0 overflow-hidden">
        <div className="w-64 shrink-0">
          <Sidebar />
        </div>

        <div className="w-1 bg-[#333] cursor-col-resize" />

        <div className="flex-1 flex flex-col min-h-0">
          <Editor/>
          {/* resize 바 */}
          <div className="h-1 bg-[#333] cursor-row-resize" />

          <div className="h-[200px] overflow-hidden">
            <p className="text-white p-2">터미널 창</p>
          </div>
        </div>
        
      </div>
    </div>
  );
}