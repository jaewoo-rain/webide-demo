import { useEffect, useRef } from "react";
import "./Editor.css";

import CodeMirror from "codemirror";
import "codemirror/lib/codemirror.css";
import "codemirror/theme/darcula.css";

import "codemirror/mode/python/python";
import "codemirror/mode/javascript/javascript";
import "codemirror/mode/xml/xml";
import "codemirror/mode/css/css";
import "codemirror/mode/markdown/markdown";
import "codemirror/mode/shell/shell";

import "codemirror/addon/edit/closebrackets";
import "codemirror/addon/edit/matchbrackets";
import "codemirror/addon/selection/active-line";

import "codemirror/addon/fold/foldgutter";
import "codemirror/addon/fold/foldcode";
import "codemirror/addon/fold/brace-fold";
import "codemirror/addon/fold/comment-fold";
import "codemirror/addon/fold/indent-fold";
import "codemirror/addon/fold/xml-fold";
import "codemirror/addon/fold/foldgutter.css";

import "codemirror/addon/hint/show-hint";
import "codemirror/addon/hint/show-hint.css";
import "codemirror/addon/hint/anyword-hint";

import { useDispatch, useSelector } from "react-redux";
import { setCode } from "../../store/projectSlice";
import { saveCodeApi } from "../../api/saveService";

function getEditorMode(fileName = "") {
    if (fileName.endsWith(".py")) return "python";
    if (fileName.endsWith(".js")) return "javascript";
    if (fileName.endsWith(".ts")) return "javascript";
    if (fileName.endsWith(".json")) return { name: "javascript", json: true };
    if (fileName.endsWith(".html")) return "xml";
    if (fileName.endsWith(".css")) return "css";
    if (fileName.endsWith(".md")) return "markdown";
    if (fileName.endsWith(".sh")) return "shell";
    return "python";
}

export default function Editor({ projectKey }) {
    const dispatch = useDispatch();

    const textareaRef = useRef(null);
    const editorRef = useRef(null);
    const docsRef = useRef(new Map());
    const changeHandlerRef = useRef(null);

    const currentFileId = useSelector((s) => s.openPage.current);
    const fileMap = useSelector((s) => s.project.files);

    const currentFile = currentFileId ? fileMap[currentFileId] : null;
    const currentContent = currentFile?.content ?? "";

    const saveCurrentFile = async () => {
        const cm = editorRef.current;
        if (!cm || !currentFile) return;

        try {
            const code = cm.getValue();

            await saveCodeApi({
                code,
                fileName: currentFile.name,
                relativePath: currentFile.relative_path,
                key: projectKey,
            });

            console.log("저장 성공:", currentFile.name);
        } catch (error) {
            console.error("저장 실패:", error);
        }
    };

    // CodeMirror는 textarea가 항상 렌더되므로 반드시 생성됨
    useEffect(() => {
        if (editorRef.current) return;
        if (!textareaRef.current) return;

        const cm = CodeMirror.fromTextArea(textareaRef.current, {
            mode: "python",
            theme: "darcula",
            lineNumbers: true,
            styleActiveLine: true,
            foldGutter: true,
            gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"],
            tabSize: 4,
            indentUnit: 4,
            lineWrapping: false,
            inputStyle: "contenteditable",
            autoCloseBrackets: true,
            matchBrackets: true,
            scrollbarStyle: "native",
            extraKeys: {
                "Ctrl-Space": "autocomplete",
                Tab: (cmInstance) => {
                    if (cmInstance.somethingSelected()) {
                        cmInstance.indentSelection("add");
                    } else {
                        cmInstance.replaceSelection("    ", "end");
                    }
                },
            },
            hintOptions: {
                completeSingle: false,
            },
        });

        editorRef.current = cm;

        cm.on("keydown", (cmInstance, e) => {
            const isSave =
                (e.ctrlKey || e.metaKey) &&
                e.key &&
                e.key.toLowerCase() === "s";

            if (e.isComposing) return;

            if (isSave) {
                e.preventDefault();
                saveCurrentFile();
            }
        });

        cm.on("inputRead", (instance, changeObj) => {
            if (!changeObj || changeObj.origin !== "+input") return;
            if (instance.state?.completionActive) return;

            const cur = instance.getCursor();
            const token = instance.getTokenAt(cur);

            if (!token?.string || token.string.length < 2) return;

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

    useEffect(() => {
        const cm = editorRef.current;
        if (!cm) return;

        if (!currentFileId || !currentFile) {
            if (changeHandlerRef.current) {
                cm.off("change", changeHandlerRef.current);
                changeHandlerRef.current = null;
            }

            const emptyDoc = new CodeMirror.Doc("", "python");
            cm.swapDoc(emptyDoc);
            cm.setOption("mode", "python");
            return;
        }

        let doc = docsRef.current.get(currentFileId);

        if (!doc) {
            doc = new CodeMirror.Doc(
                currentContent,
                getEditorMode(currentFile.name)
            );
            docsRef.current.set(currentFileId, doc);
        }

        if (cm.getDoc() !== doc) {
            if (changeHandlerRef.current) {
                cm.off("change", changeHandlerRef.current);
                changeHandlerRef.current = null;
            }

            cm.swapDoc(doc);
            cm.setOption("mode", getEditorMode(currentFile.name));

            const onChange = () => {
                const value = cm.getDoc().getValue();

                dispatch(
                    setCode({
                        fileId: currentFileId,
                        newContent: value,
                    })
                );
            };

            cm.on("change", onChange);
            changeHandlerRef.current = onChange;
        }
    }, [currentFileId, currentFile, currentContent, dispatch]);

    useEffect(() => {
        const cm = editorRef.current;
        if (!cm || !currentFileId || !currentFile) return;

        const doc = docsRef.current.get(currentFileId);
        if (!doc) return;

        const editorValue = doc.getValue();
        const reduxValue = currentContent ?? "";

        if (editorValue !== reduxValue) {
            const cursor = doc.getCursor();
            doc.setValue(reduxValue);

            try {
                doc.setCursor(cursor);
            } catch { }
        }
    }, [currentFileId, currentFile, currentContent]);

    useEffect(() => {
        const existingIds = new Set(Object.keys(fileMap));

        for (const fileId of docsRef.current.keys()) {
            if (!existingIds.has(fileId)) {
                docsRef.current.delete(fileId);
            }
        }
    }, [fileMap]);

    return (
        <div className="relative flex-1 overflow-hidden code-editor h-full w-full bg-[#1E1E1E]">
            <div className="h-full w-full">
                <textarea ref={textareaRef} />
            </div>

            {!currentFile && (
                <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-sm pointer-events-none bg-[#1E1E1E]">
                    파일을 선택해주세요.
                </div>
            )}
        </div>
    );
}