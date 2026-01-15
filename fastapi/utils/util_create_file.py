from .util_exec_run import _exec_run

# 파일 만들기
def _create_file(pod_name: str, code: str, file_name, base_path, path):
    # 파일 만들 위치 만들기
    _exec_run(pod_name, ["mkdir", "-p", base_path])

    # 파일 만들기
    if path is None:
        path = []
    full_path = base_path + "/" + "/".join(path + [file_name])
    safe_code = code.replace("'", "'\"'\"'")
    cmd = ["bash", "-c", f"echo '{safe_code}' > '{full_path}'"]
    _exec_run(pod_name, cmd)

    return full_path

import asyncio

async def create_file(pod_name: str, code: str, file_name="test_file.py", base_path="/opt", path=None) -> str:
    return await asyncio.to_thread(
        _create_file,
        pod_name,
        code,
        file_name,
        base_path,
        path
    )