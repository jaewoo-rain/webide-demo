# from fastapi import FastAPI, WebSocket, WebSocketDisconnect

# app = FastAPI()

# @app.websocket("/ws/terminal")
# async def ws_terminal(websocket: WebSocket):
#     await websocket.accept()
#     await websocket.send_text("✅ FastAPI WS connected (echo mode)\r\n")

#     try:
#         while True:
#             data = await websocket.receive_text()
#             # 입력 받은 걸 그대로 돌려줌
#             await websocket.send_text(f"echo: {data}\r\n")
#     except WebSocketDisconnect:
#         pass

import asyncio
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from kubernetes import client, config
from kubernetes.stream import stream

app = FastAPI()

NAMESPACE = "webide-net"
POD_NAME  = "vnc-test" # 일단 하나 고정
CONTAINER_NAME = None # pod에 컨테이너가 1개면 None, 여러 개면 이름 지정

@app.on_event("startup")
def _startup():
    # 클러스터 안에서 돌면 이게 맞음
    # 로컬에서 테스트하면 config.load_kube_config()를 써야 함
    config.load_incluster_config()

@app.websocket("/ws/terminal")
async def ws_terminal(websocket: WebSocket):
    await websocket.accept()
    await websocket.send_text("✅ WS connected. attaching to pod...\r\n")

    v1 = client.CoreV1Api()

    resp = None
    try:
        # tty=True면 bash가 “터미널처럼” 동작
        resp = stream(
            v1.connect_get_namespaced_pod_exec,
            POD_NAME,
            NAMESPACE,
            command=["/bin/bash"],
            stderr=True,
            stdin=True,
            stdout=True,
            tty=True,
            _preload_content=False,
            container=CONTAINER_NAME
        )

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
            pass
    finally:
        try:
            if resp:
                resp.close()
        except Exception:
            pass
