
import { useEffect, useRef, useState } from "react";
import { Terminal as XTerm } from "xterm";
import { FitAddon } from "xterm-addon-fit";
import "xterm/css/xterm.css";
import { useTerminalWs } from "../../hooks/useTerminalWs";
import config from "../../config";
import { useXtermMount } from "../../hooks/useXtermMount";

export default function Terminal({ }) {
    const termInstanceRef = useRef(null);
    // const fitAddonRef = useRef(null);
    const terminalRef = useRef(null);
    // const [termReady, setTermReady] = useState(false);

    // let wsUrl = "ws://localhost:30080/ws/terminal?pod_name=vnc-test";
    // const wsUrl = `ws://${window.location.host}/fastapi/ws/terminal?pod_name=vnc-test`;

    // const wsUrl = `ws://${window.location.host}/fastapi/ws/terminal?pod_name=vnc-test`;
    const wsUrl = config.wsUrl + 'vnc-test';

    let termReady = useXtermMount({ terminalRef, termInstanceRef })


    const { status } = useTerminalWs({
        term: termReady ? termInstanceRef.current : null,
        wsUrl,
        enabled: true,
    });

    const isClick = 0;


    return (
        <div id="terminal" className="h-full w-full bg-black flex flex-col">
            {/* 상단 탭바 */}
            <div className="flex bg-[#2D2D2D] text-sm border-b border-[#333] shrink-0">
                <div className={`px-3 py-1 border-r border-[#333] ${isClick === 0 ? "bg-[#1E1E1E]" : ""} hover:bg-[#37373D] cursor-pointer`}>
                    <span>터미널</span>
                </div>
                <div className={`px-3 py-1 border-r border-[#333] ${isClick === 1 ? "bg-[#1E1E1E]" : ""} hover:bg-[#37373D] cursor-pointer`}>
                    <span>문제</span>
                </div>
                <div className={`px-3 py-1 border-r border-[#333] ${isClick === 2 ? "bg-[#1E1E1E]" : ""} hover:bg-[#37373D] cursor-pointer`}>
                    <span>출력</span>
                </div>
                {/* 지우기 창과 공간 확보 */}
                <div className="flex-1" />
                <div className="flex items-center px-2 gap-1">
                    <button className="w-6 h-6 hover:bg-[#3C3C3C] rounded">🗑️</button>
                    <button className="w-6 h-6 hover:bg-[#3C3C3C] rounded">＋</button>
                </div>
            </div>
            <div
                ref={terminalRef}
                className="flex-1 min-h-0 w-full overflow-auto"
                style={{
                    background: "#000",
                    paddingLeft: 15,
                    paddingTop: 2,
                }}

            />
        </div>
    )

}
