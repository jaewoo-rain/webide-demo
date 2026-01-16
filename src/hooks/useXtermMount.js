import { useEffect, useRef, useState } from "react";
import { Terminal as XTerm } from "xterm";
import { FitAddon } from "xterm-addon-fit";
import "xterm/css/xterm.css";

export function useXtermMount({ terminalRef, termInstanceRef }) {
    const fitAddonRef = useRef(null);
    const [termReady, setTermReady] = useState(false);

    // 1) xterm mount
    useEffect(() => {

        // DOM 아직 안붙었으면 패스
        if (!terminalRef?.current) return;

        // 중복 생성 방지
        if (termInstanceRef.current) {
            setTermReady(true);
            return;
        }

        // xterm 인스턴스 생성
        const term = new XTerm({
            cursorBlink: true,
            fontSize: 13,
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

        // 저장
        termInstanceRef.current = term;
        fitAddonRef.current = fitAddon;
        setTermReady(true);

        // 정리
        return () => {
            try { term.dispose(); } catch { }
            termInstanceRef.current = null;
            fitAddonRef.current = null;
            setTermReady(false);
        };
    }, []);

    return termReady;
}