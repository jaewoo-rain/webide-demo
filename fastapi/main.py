import asyncio
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from kubernetes import client, config
from kubernetes.stream import stream
from utils.util_exec_run import exec_run
from utils.util_create_file import create_file
from response.run_response import RunResponse
from request.run_request import RunRequest
import os
from fastapi import Query
from typing import Optional, Dict
import time

app = FastAPI()

NAMESPACE = "webide-net"
# POD_NAME  = "vnc-test" # 일단 하나 고정
CONTAINER_NAME = None # pod에 컨테이너가 1개면 None, 여러 개면 이름 지정
SESSION : Dict = {}

@app.on_event("startup")
def _startup():
    # 클러스터 안에서 돌면 load_incluster_config()
    # 로컬에서 테스트하면 config.load_kube_config()
    if os.getenv("KUBERNETES_SERVICE_HOST"):
        config.load_incluster_config()
    else:
        config.load_kube_config()

# 실행
@app.post("/run", response_model=RunResponse)
async def run(req: RunRequest):
    WORKSPACE = "/opt/workspace"
    try:
        # 터미널 연결 시험
        resp = SESSION.get(req.pod_name)
        if not resp or not resp.is_open():
             raise HTTPException(400, detail="터미널 연결 안됨.")
    
        # out = await exec_run(req.pod_name, ["ls", "-al"])
        # 파일 만들기
        exec_path = await create_file(req.pod_name, req.code,file_name="main.py", base_path=WORKSPACE)

        # 파일 실행하기
        await exec_run(req.pod_name, ["bash", "-c", f"pkill -f '{exec_path}' || true"])
        resp.write_stdin(f"/bin/python '{exec_path}'\n")

        # cli, gui 구분하기
        for _ in range(5):
            check = await exec_run(req.pod_name, ["bash", "-c", "DISPLAY=:1 xwininfo -root -tree | grep -E '\"[^ ]+\"' && echo yes || echo no"])
            if "yes" in check: return {"mode": "gui"}
            await asyncio.sleep(0.2)
        return {"mode": "cli"}
    
    except Exception as e: 
        raise HTTPException(500, detail=str(e))
 

    

    

# 삭제

# 이름 수정

# 새로고침

# 연결
@app.websocket("/ws/terminal")
async def ws_terminal(websocket: WebSocket, pod_name: str = Query(..., alias="pod_name"), client_sid: Optional[str] = Query(None, alias="sid")):

    # WebSocket 연결을 "수락"한다.
    await websocket.accept()
    # 접속 성공 알림
    await websocket.send_text("✅ WS connected. attaching to pod...\r\n")

    v1 = client.CoreV1Api()

    resp = None
    try:
        # tty=True면 bash가 “터미널처럼” 동작
        # _preload_content 안끊기기 위해서 중요함 True인 경우 일회용임 
        resp = stream(
            v1.connect_get_namespaced_pod_exec,
            name=pod_name,
            namespace=NAMESPACE,
            command=["/bin/bash"],
            stderr=True, stdin=True, stdout=True, tty=True, 
            _preload_content=False, 
            container=CONTAINER_NAME
        )

        SESSION[pod_name] = resp

        # 가능한 것 들
        # resp.write_stdin("ls\n")     # bash에 타이핑
        # resp.read_stdout()           # bash 출력 읽기
        # resp.is_open()               # 아직 살아있는 세션인가?
        # resp.close()                 # 터미널 세션 종료

        # 프롬프트 깨우기
        resp.write_stdin("\n")

        async def pod_to_ws():
            try:
                while resp.is_open():
                    # stdout
                    if resp.peek_stdout():
                        data = resp.read_stdout()
                        if data:
                            await websocket.send_text(data)
                    # stderr (tty면 stderr가 stdout에 섞일 수 있지만 안전하게)
                    if resp.peek_stderr():
                        err = resp.read_stderr()
                        if err:
                            await websocket.send_text(err)
                    await asyncio.sleep(0.01)
            except Exception as e:
                # 끊겨도 조용히 종료
                print(f"[pod_to_ws] {e}")

        async def ws_to_pod():
            try:
                while resp.is_open():
                    msg = await websocket.receive_text()
                    resp.write_stdin(msg)
            except WebSocketDisconnect:
                pass
            except Exception as e:
                print(f"[ws_to_pod] {e}")

        await asyncio.gather(pod_to_ws(), ws_to_pod())

    except Exception as e:
        print(f"❌ [WS MAIN ERROR] {e}")
        try:
            await websocket.send_text(f"\r\n❌ server error: {e}\r\n")
        except Exception:
            raise HTTPException(500, detail=f"[WS MAIN ERROR] {e}")
    finally:
        try:
            if resp:
                resp.close()
                SESSION.pop(pod_name, None)
        except Exception:
            pass
