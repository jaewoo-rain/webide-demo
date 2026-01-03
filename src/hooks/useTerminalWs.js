import { useEffect, useRef, useState } from "react";

/**
 * xterm 인스턴스(term)와 wsUrl을 받아서
 * - ws 연결
 * - ws 수신 -> term.write
 * - term 입력 -> ws.send
 */

export function useTerminalWs({ term, wsUrl, enabled = true }) {
    const wsRef = useRef(null);
    const disposerRef = useRef(null);
    const [status, setStatus] = useState("idle"); // idle|connecting|open|closed|error

    useEffect(() => {
        if (!enabled || !term || !wsUrl) return;

        setStatus("connecting");
        term.writeln("🔌 WebSocket connecting...");

        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onopen = () => {
            setStatus("open");
            term.writeln("🟢 WebSocket connected");

            // 터미널 입력 -> 서버 전송
            disposerRef.current = term.onData((data) => {
                if (ws.readyState === WebSocket.OPEN) ws.send(data);
            });

            // 프롬프트 깨우기
            try { ws.send("\r"); } catch { }
        };

        // 서버에서 받는 문자열
        ws.onmessage = (evt) => {
            term.write(typeof evt.data === "string" ? evt.data : "");
        };


        // 오류 나는 경우
        ws.onerror = () => {
            setStatus("error");
            term.writeln("\r\n🔴 WebSocket error");
        };

        ws.onclose = () => {
            setStatus("closed");
            term.writeln("\r\n🟡 WebSocket closed");
        };

        return () => {
            if (disposerRef.current) {
                try { disposerRef.current.dispose(); } catch { }
                disposerRef.current = null;
            }
            // ws 종료
            if (wsRef.current) {
                try { wsRef.current.close(); } catch { }
                wsRef.current = null;
            }
        };
    }, [term, wsUrl, enabled]);

    return { status };
}