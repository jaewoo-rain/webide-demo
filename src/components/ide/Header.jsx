import { useSelector } from "react-redux";
import { runCodeApi } from "../../api/runService";
import { saveProjectApi } from "../../api/saveService";
import { useNavigate } from "react-router-dom";

export default function Header({ setRunMode, projectKey }) {
    const currentFileId = useSelector((s) => s.openPage.current);
    const files = useSelector((s) => s.project.files);

    const navigator = useNavigate();

    const runCode = async () => {
        try {
            await runCodeApi({
                files,
                currentFile: currentFileId,
                setRunMode,
                projectKey,
            });
        } catch (e) {
            console.error("실행 실패", e);
            alert(e.message);
        }
    };

    async function onSave() {
        try {
            await saveProjectApi({
                projectKey,
                files,
            });

            console.log("전체 프로젝트 저장 완료");
        } catch (e) {
            console.error("프로젝트 저장 실패", e);
            alert(e.message || "저장 실패");
        }
    }

    function onBack() {
        navigator("/");
    }

    return (
        <header className="bg-[#252526] h-12 flex items-center px-4 border-b border-[#333]">
            <div className="flex items-center">
                <span className="font-['Pacifico'] text-xl text-white mr-4 shrink-0 whitespace-nowrap">
                    Web-IDE
                </span>
            </div>

            <div className="flex-1 flex justify-center">
                <div className="relative w-48">
                    <select className="bg-[#3c3c3c] text-white w-full py-1.5 px-3 rounded-button border border-[#555] focus:outline-none focus:border-primary pr-8">
                        <option>{projectKey}</option>
                    </select>
                </div>
            </div>

            <div className="flex items-center space-x-2 shrink-0">
                <button
                    onClick={runCode}
                    disabled={!currentFileId}
                    className="flex items-center bg-[#3C3C3C] hover:bg-opacity-80 text-white px-3 py-1.5 rounded-button whitespace-nowrap disabled:opacity-50"
                >
                    실행
                </button>

                <button
                    onClick={onSave}
                    className="flex items-center bg-[#3C3C3C] hover:bg-opacity-80 text-white px-3 py-1.5 rounded-button whitespace-nowrap"
                >
                    저장
                </button>

                <button
                    onClick={onBack}
                    className="flex items-center bg-[#3C3C3C] hover:bg-opacity-80 text-white px-3 py-1.5 rounded-button whitespace-nowrap"
                >
                    목록으로
                </button>
            </div>
        </header>
    );
}