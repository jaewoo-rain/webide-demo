from typing import Dict, Tuple, List, Optional
from kubernetes import client, config
from kubernetes.stream import stream
import time

# kubectl exec로 한 번 명령 실행하고 결과만 문자열로 받아오기
def _exec_run(pod_name: str, command: List[str], timeout_sec: int = 10) -> str:
    
    v1 = client.CoreV1Api()
    resp = None
    start = time.time()
    output = ""
    try:
        resp = stream(
            v1.connect_get_namespaced_pod_exec,
            name = pod_name,
            namespace = "webide-net",
            command = command,
            stderr=True, stdin=False, stdout=True, tty=False, 
            _preload_content = False,
        )

        while resp.is_open():
            
            if time.time() - start > timeout_sec:
                output += f"\n[timeout] exceeded {timeout_sec}s\n"
                break
    
            # 스트림 업데이트 (수신 폴링) 새 데이터 들어온 거 반영
            resp.update(timeout=1)

            # stdout 버퍼에 읽을 게 있는지 확인
            if resp.peek_stdout():
                output += resp.read_stdout()
            # 에러 있는 경우 넣기
            if resp.peek_stderr():
                output += resp.read_stderr()
    except Exception as e:
        print(f"[exec_run ERROR] {pod_name}: {e}")
        output = f"오류: {e}"
    finally:

        # None이면 close필요 없음
        if resp:
            resp.close()
        return output



import asyncio

async def exec_run(pod_name: str, command: list[str]) -> str:
    return await asyncio.to_thread(
        _exec_run,
        pod_name,
        command
    )