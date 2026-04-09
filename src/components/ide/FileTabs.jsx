import { useDispatch, useSelector } from "react-redux";
import { closePage, setCurrentPage } from "../../store/openPageSlice";

export default function FileTabs() {
    const dispatch = useDispatch();
    const openTabs = useSelector((s) => s.openPage.open);
    const current = useSelector((s) => s.openPage.current);

    return (
        <div className="bg-[#2D2D2D] flex text-sm">
            {openTabs.map((fileName) => (
                <div
                    key={fileName}
                    onClick={() => dispatch(setCurrentPage(fileName))}
                    className={`px-3 py-2 flex items-center hover:bg-[#37373D] cursor-pointer ${fileName === current ? "bg-[#1E1E1E]" : ""
                        }`}
                >
                    <div className="w-4 h-4 flex items-center justify-center mr-1">
                        <i className="ri-file-code-line text-[#519ABA]"></i>
                    </div>

                    <span>{fileName}</span>

                    <button
                        className="ml-2 w-4 h-4 flex items-center justify-center opacity-50 hover:opacity-100"
                        onClick={(e) => {
                            e.stopPropagation();
                            dispatch(closePage(fileName));
                        }}
                    >
                        <i className="ri-close-line"></i>
                    </button>
                </div>
            ))}
        </div>
    );
}