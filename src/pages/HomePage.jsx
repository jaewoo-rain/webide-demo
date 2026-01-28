import { useNavigate } from "react-router-dom"

export default function HomePage() {
    const navigate = useNavigate()
    const userName = "test-user"
    const projectName = "test-project"

    return (
        <div>
            홈화면
            목록들
            <div>
                카드 구역
            </div>

            <button
                onClick={() => {
                    navigate(`/ide/${userName}/${projectName}`);
                }}
            >
                이동
            </button>
        </div>
    )
}