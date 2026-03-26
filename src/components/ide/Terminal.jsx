
import { useEffect, useRef } from "react";
import "xterm/css/xterm.css";
import { useTerminalWs } from "../../hooks/useTerminalWs";
import config from "../../config";
import { useXtermMount } from "../../hooks/useXtermMount";

export default function Terminal({
    projectKey,
    setReady = () => { },
    podName = null }
) {
    const termInstanceRef = useRef(null);
    const terminalRef = useRef(null);

    const wsUrl = config.wsUrl + `?key=${projectKey}&pod_name=${podName}`;
    let termReady = useXtermMount({ terminalRef, termInstanceRef })


    let { status } = useTerminalWs({
        termRef: termInstanceRef,
        wsUrl,
        enabled: termReady,
    });

    console.log("status:", status)

    useEffect(() => {
        if (status === "open") {
            console.log("opensss")
            setReady(true);
        } else {
            setReady(false)
        }
    }, [status, setReady]);

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
