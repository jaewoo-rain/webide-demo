// import { useEffect, useRef } from "react"
// import "./Editor.css"

// import CodeMirror from "codemirror";
// import "codemirror/lib/codemirror.css";
// import "codemirror/theme/darcula.css";
// import "codemirror/addon/edit/closebrackets";
// // 언어 모드 (필요한 것만)
// // import "codemirror/mode/javascript/javascript";
// import "codemirror/mode/python/python";
// import "codemirror/addon/edit/matchbrackets";
// import "codemirror/addon/selection/active-line";
// import "codemirror/addon/fold/foldgutter";
// import "codemirror/addon/fold/foldcode";
// import "codemirror/addon/fold/brace-fold";
// import "codemirror/addon/fold/comment-fold";
// import "codemirror/addon/fold/indent-fold";
// import "codemirror/addon/fold/foldgutter.css";

// import { useDispatch } from "react-redux";
// import { setCode } from "../../store/projectSlice";
// import { saveCodeApi } from "../../service/saveService";

// export default function Editor() {
//     const dispatch = useDispatch();

//     const textareaRef = useRef(null);
//     const editorRef = useRef(null);

//     function onClickTab(page) {
//         console.log(`${page}탭 클릭`);
//     }

//     function onCloseTab(page) {
//         console.log(`${page}탭 닫음`);

//     }

//     function addTab() {
//         console.log("페이지 추가 탭 클릭")
//     }
//     const saveCode = async () => {
//         const cm = editorRef.current;
//         if (!cm) return;

//         cm.focus();
//         cm.getInputField().blur();
//         cm.focus();

//         const code = cm.getValue();
//         console.log("저장됨:", code);

//         // 여기서 API 호출!
//         await saveCodeApi({
//             code: code,
//         })
//     }


//     useEffect(() => {
//         if (editorRef.current) return;

//         editorRef.current = CodeMirror.fromTextArea(textareaRef.current, {
//             value: "코드미러 시작",
//             mode: "python",
//             theme: "darcula",
//             lineNumbers: true, // 왼쪽 라인 넘버 표시
//             styleActiveLine: true, // 현재 라인 강조
//             foldGutter: true, // 코드 접기 UI 활성화
//             gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"],
//             tabSize: 4, // 탭 하나의 공백 수
//             lineWrapping: false, // 자동 줄바꿈
//             inputStyle: "contenteditable", // 한글 IME 안정화
//             autoCloseBrackets: true, // 괄호 자동 완성
//             matchBrackets: true, // 짝 괄호 강조
//             scrollbarStyle: "native"
//         });

//         // Ctrl+S 저장 코드
//         editorRef.current.on("keydown", (cm, e) => {
//             const isSave = (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s";

//             // IME 조합 중이면 저장 타이밍 꼬일 수 있어서 방지
//             if (e.isComposing) return;

//             if (isSave) {
//                 e.preventDefault(); // 브라우저 기본 저장 막기
//                 saveCode();
//             }
//         });

//         // 코드 변경 감지
//         editorRef.current.on("change", (instance) => {
//             const code = instance.getValue();
//             dispatch(setCode(code));
//             // 변경될때마다 로컬 스토리지에 유저-프로젝트이름:코드 이런식으로
//             // 저장하는것도 괜찮을 듯
//         });

//     }, [])

//     return (
//         <>
//             <div className="bg-[#2D2D2D] flex text-sm">
//                 <div key={1}
//                     onClick={() => {
//                         onClickTab(1);
//                     }}
//                     className="file-tab px-3 py-2 flex items-center hover:bg-[#37373D] cursor-pointer active"
//                 >
//                     <div className="w-4 h-4 flex items-center justify-center mr-1">
//                         <i className="ri-file-code-line text-[#519ABA]" />
//                     </div>
//                     <span>파일1</span>
//                     <button className="ml-2 w-4 h-4 flex items-center justify-center opacity-50 hover:opacity-100"
//                         onClick={(e) => {
//                             e.stopPropagation();
//                             onCloseTab(1);
//                         }}>
//                         <i className="ri-close-line" />
//                     </button>
//                 </div>

//                 <div key={2}
//                     onClick={() => {
//                         onClickTab(2);
//                     }}
//                     className="file-tab px-3 py-2 flex items-center hover:bg-[#37373D] cursor-pointer"
//                 >
//                     <div className="w-4 h-4 flex items-center justify-center mr-1">
//                         <i className="ri-file-code-line text-[#519ABA]" />
//                     </div>
//                     <span>파일2</span>
//                     <button className="ml-2 w-4 h-4 flex items-center justify-center opacity-50 hover:opacity-100"
//                         onClick={(e) => {
//                             e.stopPropagation();
//                             onCloseTab(2);
//                         }}>
//                         <i className="ri-close-line" />
//                     </button>
//                 </div>

//                 {/* 페이지 추가 버튼 */}
//                 <button className="px-3 py-2 flex items-center"
//                     onClick={() => {
//                         addTab();
//                     }}
//                 >
//                     <i className="ri-add-line" />
//                 </button>

//             </div>
//             <div className="flex-1 overflow-auto code-editor h-full w-full">
//                 <div className="h-full w-full">
//                     <textarea
//                         ref={textareaRef}
//                     />
//                 </div>
//             </div>
//         </>
//     )
// }

import { useEffect, useRef } from "react";
import "./Editor.css";

import CodeMirror from "codemirror";
import "codemirror/lib/codemirror.css";
import "codemirror/theme/darcula.css";

import "codemirror/addon/edit/closebrackets";
import "codemirror/mode/python/python";
import "codemirror/addon/edit/matchbrackets";
import "codemirror/addon/selection/active-line";

import "codemirror/addon/fold/foldgutter";
import "codemirror/addon/fold/foldcode";
import "codemirror/addon/fold/brace-fold";
import "codemirror/addon/fold/comment-fold";
import "codemirror/addon/fold/indent-fold";
import "codemirror/addon/fold/foldgutter.css";

// ✅ 자동완성(Hint) 애드온
import "codemirror/addon/hint/show-hint";
import "codemirror/addon/hint/show-hint.css";
import "codemirror/addon/hint/anyword-hint";

import { useDispatch } from "react-redux";
import { setCode } from "../../store/projectSlice";
import { saveCodeApi } from "../../service/saveService";

export default function Editor() {
    const dispatch = useDispatch();

    const textareaRef = useRef(null);
    const editorRef = useRef(null);

    function onClickTab(page) {
        console.log(`${page}탭 클릭`);
    }

    function onCloseTab(page) {
        console.log(`${page}탭 닫음`);
    }

    function addTab() {
        console.log("페이지 추가 탭 클릭");
    }

    const saveCode = async () => {
        const cm = editorRef.current;
        if (!cm) return;

        // IME/조합 이슈 완화용 포커스 토글 (기존 유지)
        cm.focus();
        cm.getInputField().blur();
        cm.focus();

        const code = cm.getValue();
        console.log("저장됨:", code);

        await saveCodeApi({ code });
    };

    useEffect(() => {
        if (editorRef.current) return;
        if (!textareaRef.current) return;

        const cm = CodeMirror.fromTextArea(textareaRef.current, {
            value: "코드미러 시작",
            mode: "python",
            theme: "darcula",
            lineNumbers: true,
            styleActiveLine: true,
            foldGutter: true,
            gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"],
            tabSize: 4,
            lineWrapping: false,

            // ✅ 기존 유지: 한글 IME 안정화 (환경에 따라 힌트 팝업 영향 줄 수 있음)
            inputStyle: "contenteditable",

            autoCloseBrackets: true,
            matchBrackets: true,
            scrollbarStyle: "native",

            // ✅ Ctrl+Space로 자동완성
            extraKeys: {
                "Ctrl-Space": "autocomplete",
            },

            // ✅ 자동완성 옵션
            hintOptions: {
                completeSingle: false,
            },
        });

        editorRef.current = cm;

        // ✅ Ctrl+S 저장 (기존 유지)
        cm.on("keydown", (cmInstance, e) => {
            const isSave =
                (e.ctrlKey || e.metaKey) && e.key && e.key.toLowerCase() === "s";

            // IME 조합 중이면 저장 타이밍 꼬일 수 있어서 방지
            if (e.isComposing) return;

            if (isSave) {
                e.preventDefault();
                saveCode();
            }
        });

        // ✅ 코드 변경 감지 (기존 유지)
        cm.on("change", (instance) => {
            const code = instance.getValue();
            dispatch(setCode(code));
            // 여기서 localStorage 저장 등 추가 가능
        });

        // ✅ 타이핑 중 자동완성 팝업 (추가)
        cm.on("inputRead", (instance, changeObj) => {
            // 입력(+input)일 때만
            if (!changeObj || changeObj.origin !== "+input") return;

            // 자동완성 이미 떠있으면 중복 호출 방지
            if (instance.state && instance.state.completionActive) return;

            // 한글 IME 조합중일 때는 팝업 안 띄우는 게 안정적
            // (inputStyle: contenteditable 환경에서 특히)
            // CodeMirror 이벤트에 isComposing이 항상 있진 않아서,
            // 저장 키처럼 e.isComposing 체크는 못하고, 보수적으로 토큰 길이로 제어
            const cur = instance.getCursor();
            const token = instance.getTokenAt(cur);

            // 2글자 이상일 때만 (원하면 1로 낮춰)
            if (!token || !token.string || token.string.length < 2) return;

            instance.showHint({ completeSingle: false });
        });

        // ✅ 언마운트/리로드 시 정리 (StrictMode/라우팅 대비)
        return () => {
            if (editorRef.current) {
                editorRef.current.toTextArea();
                editorRef.current = null;
            }
        };
    }, [dispatch]);

    return (
        <>
            <div className="bg-[#2D2D2D] flex text-sm">
                <div
                    key={1}
                    onClick={() => onClickTab(1)}
                    className="file-tab px-3 py-2 flex items-center hover:bg-[#37373D] cursor-pointer active"
                >
                    <div className="w-4 h-4 flex items-center justify-center mr-1">
                        <i className="ri-file-code-line text-[#519ABA]" />
                    </div>
                    <span>파일1</span>
                    <button
                        className="ml-2 w-4 h-4 flex items-center justify-center opacity-50 hover:opacity-100"
                        onClick={(e) => {
                            e.stopPropagation();
                            onCloseTab(1);
                        }}
                    >
                        <i className="ri-close-line" />
                    </button>
                </div>

                <div
                    key={2}
                    onClick={() => onClickTab(2)}
                    className="file-tab px-3 py-2 flex items-center hover:bg-[#37373D] cursor-pointer"
                >
                    <div className="w-4 h-4 flex items-center justify-center mr-1">
                        <i className="ri-file-code-line text-[#519ABA]" />
                    </div>
                    <span>파일2</span>
                    <button
                        className="ml-2 w-4 h-4 flex items-center justify-center opacity-50 hover:opacity-100"
                        onClick={(e) => {
                            e.stopPropagation();
                            onCloseTab(2);
                        }}
                    >
                        <i className="ri-close-line" />
                    </button>
                </div>

                {/* 페이지 추가 버튼 */}
                <button className="px-3 py-2 flex items-center" onClick={addTab}>
                    <i className="ri-add-line" />
                </button>
            </div>

            <div className="flex-1 overflow-auto code-editor h-full w-full">
                <div className="h-full w-full">
                    <textarea ref={textareaRef} />
                </div>
            </div>
        </>
    );
}
