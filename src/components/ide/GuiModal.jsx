// export function GuiModal() {
//     return (
//         <div>
//             모달창
//         </div>
//     )
// }

import { createPortal } from "react-dom";
import { useEffect } from "react";

export function GuiModal({ onClose }) {
    // ESC 키로 닫기
    useEffect(() => {
        const onKeyDown = (e) => {
            if (e.key === "Escape") onClose?.();
        };
        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [onClose]);

    return createPortal(
        <div className="fixed inset-0 z-[9999]">
            {/* 배경 오버레이 */}
            <div
                className="absolute inset-0 bg-black/60"
                onClick={onClose}
            />

            {/* 모달 본체 */}
            <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-[#1e1e1e] text-white w-[800px] h-[600px] rounded shadow-lg">
                    <div className="p-3 border-b border-[#333] flex justify-between">
                        <span>GUI 실행 화면</span>
                        <button onClick={onClose}>✕</button>
                    </div>

                    <div className="p-4">
                        GUI 내용 (VNC / iframe / canvas 등)
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
}
