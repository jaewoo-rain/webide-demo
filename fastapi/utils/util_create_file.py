import asyncio
import base64
import posixpath
from typing import Optional, List, Dict, Union, Any

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
    if not (
        normalized == normalized_base
        or normalized.startswith(normalized_base + "/")
    ):
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


def _extract_file_info_from_item(item: Any) -> tuple[str, str]:
    """
    배열 기반 files의 각 항목을 (relative_path, code) 형태

    지원 형태 예시:
    1) {"name": "main.py", "code": "..."}
    2) {"name": "main.py", "path": ["src"], "code": "..."}
    3) {"relative_path": "src/main.py", "code": "..."}
    """
    if not isinstance(item, dict):
        raise ValueError("files의 각 항목은 dict 형태여야 합니다.")

    code = item.get("code", "")
    relative_path = item.get("relative_path")

    if relative_path:
        return relative_path, code

    name = item.get("name")
    path = item.get("path") or []

    if not name:
        raise ValueError("파일 항목에는 name 또는 relative_path가 필요합니다.")

    rel = posixpath.join(*path, name) if path else name
    return rel, code


def _extract_file_info_from_legacy_dict(key: str, value: Union[str, dict]) -> tuple[str, str]:
    """
    이전 dict 기반 구조 호환용.
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

    return key, code


def _save_project(
    pod_name: str,
    files: Union[List[dict], Dict[str, Union[str, dict]]],
    base_path: str = "/workspace",
) -> list[str]:
    saved_files = []

    # ✅ 새로운 배열 구조
    if isinstance(files, list):
        for item in files:
            relative_path, code = _extract_file_info_from_item(item)

            full_path = _normalize_full_path(
                base_path=base_path,
                relative_path=relative_path,
            )
            _write_file_to_pod(pod_name, full_path, code)
            saved_files.append(full_path)

        return saved_files

    # ✅ 이전 dict 구조도 호환
    if isinstance(files, dict):
        for key, value in files.items():
            relative_path, code = _extract_file_info_from_legacy_dict(key, value)

            full_path = _normalize_full_path(
                base_path=base_path,
                relative_path=relative_path,
            )
            _write_file_to_pod(pod_name, full_path, code)
            saved_files.append(full_path)

        return saved_files

    raise ValueError("files는 list 또는 dict 형태여야 합니다.")


async def save_project(
    pod_name: str,
    files: Union[List[dict], Dict[str, Union[str, dict]]],
    base_path: str = "/workspace",
) -> list[str]:
    return await asyncio.to_thread(
        _save_project,
        pod_name,
        files,
        base_path,
    )