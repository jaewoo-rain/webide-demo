import { useEffect, useRef } from "react"
import "./Editor.css"

import CodeMirror from "codemirror";
import "codemirror/lib/codemirror.css";
import "codemirror/theme/darcula.css";
import "codemirror/addon/edit/closebrackets";
// 언어 모드 (필요한 것만)
// import "codemirror/mode/javascript/javascript";
import "codemirror/mode/python/python";
import "codemirror/addon/edit/matchbrackets";
import "codemirror/addon/selection/active-line";
import "codemirror/addon/fold/foldgutter";
import "codemirror/addon/fold/foldcode";
import "codemirror/addon/fold/brace-fold";
import "codemirror/addon/fold/comment-fold";
import "codemirror/addon/fold/indent-fold";
import "codemirror/addon/fold/foldgutter.css";

export default function Editor(){

    const textareaRef = useRef(null);
    const editorRef = useRef(null);

    function onClickTab(page){
        console.log(`${page}탭 클릭`);
    }

    function onCloseTab(page){
        console.log(`${page}탭 닫음`);

    }

    function addTab(){
        console.log("페이지 추가 탭 클릭")
    }
    function saveCode() {
        const cm = editorRef.current;
        if (!cm) return;

        cm.focus();
        cm.getInputField().blur();
        cm.focus();

        const code = cm.getValue();
        console.log("저장됨:", code);

        // 여기서 API 호출!
        // fetch("/api/save", { method: "POST", body: JSON.stringify({ code }) })
        }


    useEffect(()=>{
        if(editorRef.current) return;

        editorRef.current = CodeMirror.fromTextArea(textareaRef.current,{
            value: "코드미러 시작",
            mode: "python",
            theme: "darcula",
            lineNumbers: true, // 왼쪽 라인 넘버 표시
            styleActiveLine: true, // 현재 라인 강조
            foldGutter: true, // 코드 접기 UI 활성화
            gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"],
            tabSize: 4, // 탭 하나의 공백 수
            lineWrapping: false, // 자동 줄바꿈
            inputStyle: "contenteditable", // 한글 IME 안정화
            autoCloseBrackets: true, // 괄호 자동 완성
            matchBrackets: true, // 짝 괄호 강조
            scrollbarStyle: "native"
        });

        // Ctrl+S 저장 코드
        editorRef.current.on("keydown", (cm, e) => {
            const isSave = (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s";
            
            // IME 조합 중이면 저장 타이밍 꼬일 수 있어서 방지
            if (e.isComposing) return;

            if (isSave) {
                e.preventDefault(); // 브라우저 기본 저장 막기
                saveCode(); 
            }
        });
    },[])

    return(
        <>
         <div className="bg-[#2D2D2D] flex text-sm">
            <div key={1}
            onClick={()=>{
                    onClickTab(1);
                }}
            className="file-tab px-3 py-2 flex items-center hover:bg-[#37373D] cursor-pointer active"
            >
                <div className="w-4 h-4 flex items-center justify-center mr-1">
                    <i className="ri-file-code-line text-[#519ABA]"/>
                </div>
                <span>파일1</span>
                <button className="ml-2 w-4 h-4 flex items-center justify-center opacity-50 hover:opacity-100"
                onClick={(e)=>{
                    e.stopPropagation();
                    onCloseTab(1);
                }}>
                    <i className="ri-close-line"/>
                </button>
            </div>

            <div key={2}
            onClick={()=>{
                    onClickTab(2);
                }}
            className="file-tab px-3 py-2 flex items-center hover:bg-[#37373D] cursor-pointer"
            >
                <div className="w-4 h-4 flex items-center justify-center mr-1">
                    <i className="ri-file-code-line text-[#519ABA]"/>
                </div>
                <span>파일2</span>
                <button className="ml-2 w-4 h-4 flex items-center justify-center opacity-50 hover:opacity-100"
                onClick={(e)=>{
                    e.stopPropagation();
                    onCloseTab(2);
                }}>
                    <i className="ri-close-line"/>
                </button>
            </div>

            {/* 페이지 추가 버튼 */}
            <button className="px-3 py-2 flex items-center"
                onClick={()=>{
                    addTab();
                }}
            >
                <i className="ri-add-line"/>
            </button>

        </div>
            <div className="flex-1 overflow-auto code-editor h-full w-full">
                <div className="h-full w-full">
                    <textarea
                    ref={textareaRef}
                    />
                </div>
            </div>
        </>
    )
}