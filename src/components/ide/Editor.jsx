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

import "codemirror/addon/hint/show-hint";
import "codemirror/addon/hint/show-hint.css";
import "codemirror/addon/hint/anyword-hint";

import { useDispatch, useSelector } from "react-redux";
import { setCode } from "../../store/projectSlice";
import { saveProjectApi, saveCodeApi } from "../../api/saveService";

export default function Editor({ projectKey }) {
    const dispatch = useDispatch();

    const textareaRef = useRef(null);
    const editorRef = useRef(null);
    const docsRef = useRef(new Map());
    const changeHandlerRef = useRef(null);

    const currentFile = useSelector((s) => s.openPage.current);
    const currentCode = useSelector(
        (s) => (currentFile ? s.project.files[currentFile]?.code ?? "" : "")
    );

    const files = useSelector((s) => s.project.files);

    const saveCode = async () => {
        const cm = editorRef.current;
        if (!cm) return;

        // 기존 IME 안정화 흐름 유지
        cm.focus();
        cm.getInputField().blur();
        cm.focus();

        const code = cm.getValue();
        console.log("저장됨:", code);

        await saveCodeApi({
            code,
            fileName: currentFile,
            key: projectKey
        });

        // await saveProjectApi({
        //     files: files
        // });
    };

    // CodeMirror 1회 생성
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
            inputStyle: "contenteditable",
            autoCloseBrackets: true,
            matchBrackets: true,
            scrollbarStyle: "native",
            extraKeys: {
                "Ctrl-Space": "autocomplete",
            },
            hintOptions: {
                completeSingle: false,
            },
        });

        editorRef.current = cm;

        // Ctrl+S 저장
        cm.on("keydown", (cmInstance, e) => {
            const isSave =
                (e.ctrlKey || e.metaKey) && e.key && e.key.toLowerCase() === "s";

            if (e.isComposing) return;

            if (isSave) {
                e.preventDefault();
                saveCode();
            }
        });

        // 자동완성
        cm.on("inputRead", (instance, changeObj) => {
            // 붙여넣기, 삭제, 포맷팅 제외 타이핑만 대상
            if (!changeObj || changeObj.origin !== "+input") return;

            // 자동완성 이미 떠있으면 중복 호출 방지
            if (instance.state && instance.state.completionActive) return;

            // CodeMirror 이벤트에 isComposing이 항상 있진 않아서
            // 저장 키처럼 e.isComposing 체크는 못하고, 보수적으로 토큰 길이로 제어
            const cur = instance.getCursor();
            const token = instance.getTokenAt(cur);

            // 2글자 이상일 때만 (원하면 1로 낮추기 가능)
            if (!token || !token.string || token.string.length < 2) return;

            instance.showHint({ completeSingle: false });
        });

        return () => {
            if (editorRef.current && changeHandlerRef.current) {
                editorRef.current.off("change", changeHandlerRef.current);
                changeHandlerRef.current = null;
            }

            if (editorRef.current) {
                editorRef.current.toTextArea();
                editorRef.current = null;
            }

            docsRef.current.clear();
        };
    }, []);

    // 탭 전환 시 문서 바꾸기
    useEffect(() => {
        const cm = editorRef.current;
        if (!cm || !currentFile) return;

        let doc = docsRef.current.get(currentFile);

        if (!doc) {
            doc = new CodeMirror.Doc(currentCode, "python");
            docsRef.current.set(currentFile, doc);
        }

        // 이미 현재 editor가 같은 doc를 쓰고 있으면 swapDoc 금지
        if (cm.getDoc() !== doc) {
            if (changeHandlerRef.current) {
                cm.off("change", changeHandlerRef.current);
                changeHandlerRef.current = null;
            }

            cm.swapDoc(doc);

            const onChange = () => {
                const value = cm.getDoc().getValue();
                dispatch(setCode({ fileName: currentFile, code: value }));
            };

            cm.on("change", onChange);
            changeHandlerRef.current = onChange;
        }
    }, [currentFile, currentCode, dispatch]);

    // 현재 파일 코드가 외부에서 바뀌었을 때 현재 doc에 반영
    useEffect(() => {
        const cm = editorRef.current;
        if (!cm || !currentFile) return;

        const doc = docsRef.current.get(currentFile);
        if (!doc) return;

        // 현재 문서 내용과 redux 값이 다를 때만 반영
        if (doc.getValue() !== currentCode) {
            const cursor = doc.getCursor();
            doc.setValue(currentCode);
            doc.setCursor(cursor);
        }
    }, [currentFile, currentCode]);

    return (
        <div className="flex-1 overflow-auto code-editor h-full w-full">
            <div className="h-full w-full">
                <textarea ref={textareaRef} />
            </div>
        </div>
    );
}