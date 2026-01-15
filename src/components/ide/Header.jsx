import axios from "axios"
import config from "../../config";

export default function Header() {
    // api = config.server

    const runCode = async () => {
        // e.preventDefault();
        console.log("실행버튼 클릭")
        try {
            const res = await axios.post(
                `http://localhost:30080/run`,
                {
                    code: 'print("ss")',
                    pod_name: "vnc-test",
                }, {
                headers: { "Content-Type": "application/json" },
            }
            );

            if (!res.ok) {
                const errData = await res.json();
                console.error("RUN failed:", res.status, errData);
                alert(`실행 실패 (${res.status})`);
                return;
            }

            const data = await res.json();
            console.log(data)


        } catch (e) {
            console.log(`에러발생 ${e}`)
        }
    }

    function onSave() {
        console.log("저장버튼 클릭")
    }

    function onBack() {
        console.log("목록으로 이동")
    }

    return (
        <header className="bg-[#252526] h-12 flex items-center px-4 border-b border-[#333]">

            {/* 이름 */}
            <div className="flex items-center">
                <span className="font-['Pacifico'] text-xl text-white mr-4 shrink-0 whitespace-nowrap">Web-IDE</span>
            </div>

            {/* 프로젝트 */}
            <div className="flex-1 flex justify-center">
                <div className="relative w-48">
                    <select className="bg-[#3c3c3c] text-white w-full py-1.5 px-3 rounded-button border border-[#555] focus:outline-none focus:border-primary pr-8">
                        <option key={1}>1번 프로젝트</option>
                        <option key={2}>2번 프로젝트</option>
                        <option key={3}>3번 프로젝트</option>
                    </select>
                </div>
            </div>

            {/* 실행/저장버튼 */}
            <div className="flex items-center space-x-2 shrink-0">
                <button
                    onClick={() => { runCode() }}
                    disabled={false}
                    className="flex items-center bg-[#3C3C3C] hover:bg-opacity-80 text-white px-3 py-1.5 rounded-button whitespace-nowrap disabled:opacity-50"
                >
                    <span>실행</span>
                </button>

                <button
                    disabled={false}
                    onClick={() => { onSave() }}
                    className="flex items-center bg-[#3C3C3C] hover:bg-opacity-80 text-white px-3 py-1.5 rounded-button whitespace-nowrap disabled:opacity-50"
                >
                    <span>저장</span>
                </button>

                <button
                    onClick={() => { onBack() }}
                    disabled={true}
                    className="flex items-center bg-[#3C3C3C] hover:bg-opacity-80 text-white px-3 py-1.5 rounded-button whitespace-nowrap disabled:opacity-50"
                >
                    <span>목록으로</span>
                </button>
            </div>
        </header>
    );
}