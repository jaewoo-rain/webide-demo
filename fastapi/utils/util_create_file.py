import asyncio
import base64
import posixpath
from typing import Optional, List, Dict, Union

from .util_exec_run import _exec_run


def _normalize_full_path(
    base_path: str,
    file_name: Optional[str] = None,
    path: Optional[List[str]] = None,
    relative_path: Optional[str] = None,
) -> str:
    """
    저장할 최종 절대 경로를 만든다.
    """
    if relative_path:
        rel = relative_path.strip("/")
        full_path = posixpath.join(base_path, rel)
    else:
        if not file_name:
            raise ValueError("file_name 또는 relative_path 중 하나는 필요합니다.")
        path = path or []
        full_path = posixpath.join(base_path, *path, file_name)

    normalized = posixpath.normpath(full_path)

    # base_path 밖으로 탈출하는 경로 차단
    normalized_base = posixpath.normpath(base_path)
    if not normalized.startswith(normalized_base):
        raise ValueError("허용되지 않은 경로입니다.")

    return normalized


def _write_file_to_pod(pod_name: str, full_path: str, code: str) -> str:
    """
    pod 내부에 파일을 실제로 저장한다.
    """
    dir_path = posixpath.dirname(full_path)

    # 중첩 폴더까지 생성
    _exec_run(pod_name, ["mkdir", "-p", dir_path])

    # echo 대신 base64 사용
    encoded = base64.b64encode(code.encode("utf-8")).decode("ascii")
    cmd = [
        "bash",
        "-c",
        f"printf '%s' '{encoded}' | base64 -d > '{full_path}'"
    ]
    _exec_run(pod_name, cmd)

    return full_path


def _create_file(
    pod_name: str,
    code: str,
    file_name: Optional[str] = None,
    base_path: str = "/workspace",
    path: Optional[List[str]] = None,
    relative_path: Optional[str] = None,
) -> str:
    full_path = _normalize_full_path(
        base_path=base_path,
        file_name=file_name,
        path=path,
        relative_path=relative_path,
    )
    return _write_file_to_pod(pod_name, full_path, code)


async def create_file(
    pod_name: str,
    code: str,
    file_name: Optional[str] = None,
    base_path: str = "/workspace",
    path: Optional[List[str]] = None,
    relative_path: Optional[str] = None,
) -> str:
    return await asyncio.to_thread(
        _create_file,
        pod_name,
        code,
        file_name,
        base_path,
        path,
        relative_path,
    )


def _extract_file_info(key: str, value: Union[str, dict]) -> tuple[str, str]:
    """
    SaveProjectRequest.files 항목을
    (relative_path, code) 형태로 통일한다.
    """
    if isinstance(value, str):
        return key, value

    code = value.get("code", "")
    relative_path = value.get("relative_path")

    if relative_path:
        return relative_path, code

    name = value.get("name")
    path = value.get("path") or []

    if name:
        rel = posixpath.join(*path, name) if path else name
        return rel, code

    # 마지막 fallback: key 자체를 경로로 사용
    return key, code


def _save_project(
    pod_name: str,
    files: Dict[str, Union[str, dict]],
    base_path: str = "/workspace",
) -> list[str]:
    saved_files = []

    for key, value in files.items():
        relative_path, code = _extract_file_info(key, value)

        full_path = _normalize_full_path(
            base_path=base_path,
            relative_path=relative_path,
        )
        _write_file_to_pod(pod_name, full_path, code)
        saved_files.append(full_path)

    return saved_files


async def save_project(
    pod_name: str,
    files: Dict[str, Union[str, dict]],
    base_path: str = "/workspace",
) -> list[str]:
    return await asyncio.to_thread(
        _save_project,
        pod_name,
        files,
        base_path,
    )