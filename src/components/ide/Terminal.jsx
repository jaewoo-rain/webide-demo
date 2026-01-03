import { useEffect, useRef, useState } from "react";
import { Terminal as XTerm } from "xterm";
import { FitAddon } from "xterm-addon-fit";
import "xterm/css/xterm.css";
import { useTerminalWs } from "../../hooks/useTerminalWs";

export default function Terminal({terminalRef}){
    const termInstanceRef = useRef(null);
    const fitAddonRef = useRef(null);
    const [termReady, setTermReady] = useState(false);
    // 1) xterm mount
    useEffect(()=>{
        if(!terminalRef?.current) return;

        // xterm 인스턴스 생성
        const term = new XTerm({
            cursorBlink: true,
            fontSize:13,
            convertEol: true,
            scrollback: 5000,
        });

        // fit addon
        const fitAddon = new FitAddon();
        term.loadAddon(fitAddon);

        // 화면에 붙이기
        term.open(terminalRef.current);
        fitAddon.fit();

        // 텍스트 출력
        term.writeln("✅ xterm mounted");

        setTermReady(true);

        // 저장
        termInstanceRef.current = term;
        fitAddonRef.current = fitAddon;

        // 정리
        return () =>{
            try { term.dispose(); } catch {}
            termInstanceRef.current = null;
            fitAddonRef.current = null;
            setTermReady(false);
        };
    }, [terminalRef]);

    const protocol = window.location.protocol === "https:" ? "wss://" : "ws://";
    const wsUrl = `${protocol}${window.location.host}/fastapi/ws/terminal`;
    // const wsUrl = "ws://localhost:8000/ws/terminal";
    wsUrl = "ws://localhost:30080/ws/terminal";
    const {status} = useTerminalWs({
        term: termReady ? termInstanceRef.current : null,
        wsUrl,
        enabled: true,
    });

    const isClick = 0;


    return(
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