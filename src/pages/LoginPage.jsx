
export default function HomePage() {

    function loadData() {
        // 로컬 스토리지 내부 jwt 존재하는지 확인
        const jwt = checkStorage()

        // jwt존재하면 서버에 보내서 확인하기

    }

    function checkStorage() {
        // 로컬 스토리지 내부 jwt 존재하는지 확인
    }

    return (
        <div>
            <h1>로그인</h1>
            <LoginComponent />

        </div>
    )
}