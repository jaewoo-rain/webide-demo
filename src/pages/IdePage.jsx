import Header from "../components/ide/Header";
import Sidebar from "../components/ide/Slidebar";

export default function IdePage(){
    return (
    <div className="flex flex-col h-screen bg-[#252526]">
      <Header />

      {/* body (sidebar + main) */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* sidebar */}
        <aside className="w-64 shrink-0">
          <Sidebar />
        </aside>

        {/* divider */}
        <div className="w-1 bg-[#333]" />

        {/* main */}
        <main className="flex-1 flex flex-col min-h-0">
          {/* editor zone */}
          <div className="flex-1 min-h-0 overflow-hidden">
            <p className="text-white p-2">파일탭</p>
            <p className="text-white p-2">에디터</p>
          </div>

          {/* resize bar */}
          <div className="h-1 bg-[#333] cursor-row-resize" />

          {/* terminal */}
          <div className="h-[200px] overflow-hidden">
            <p className="text-white p-2">터미널 창</p>
          </div>
        </main>
      </div>
    </div>
  );
}