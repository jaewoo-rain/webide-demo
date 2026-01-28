import asyncio
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException, Depends
from kubernetes import client, config
from kubernetes.stream import stream
from fastapi.middleware.cors import CORSMiddleware
from utils.util_exec_run import exec_run
from utils.util_create_file import create_file
from response.run_response import RunResponse
from request.run_request import RunRequest
import os
from fastapi import Query
from typing import Optional, Dict, List
from starlette.websockets import WebSocketState
from response.create_container_response import CreateContainerResponse
from request.create_container_request import CreateContainerRequest
from config import (CONTAINER_ENV_DEFAULT, INTERNAL_NOVNC_PORT, ALLOWED_NOVNC_PORTS, VNC_APP_LABEL, NAMESPACE, WORKSPACE)
from kubernetes.client.rest import ApiException
from utils.util_create_project import (slug, create_pvc, create_deployment, create_service_nodeport, get_any_running_pod_name)
from response.delete_container_response import DeleteContainerResponse
from dto.save_file import (SaveFileRequest, SaveFileResponse)
from repository.db import get_db
from sqlalchemy.orm import Session
from sqlalchemy import text
from config import settings
from repository import projectRepository as crud
from repository.db import Base, engine
from repository.models.project import Project # 지우면 안됨
from dto import project_dto as projectDto

app = FastAPI()

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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
    Base.metadata.create_all(bind=engine)

# 실행
@app.post("/run", response_model=RunResponse)
async def run(req: RunRequest):
    try:
        # 터미널 연결 시험
        resp = SESSION.get(req.pod_name)
        if not resp or not resp.is_open():
             raise HTTPException(400, detail="터미널 연결 안됨.")
    
        # 파일 만들기
        exec_path = await create_file(req.pod_name, req.code, file_name="main.py", base_path=WORKSPACE)

        # 파일 실행하기
        await exec_run(req.pod_name, ["bash", "-c", f"pkill -f '{exec_path}' || true"])
        resp.write_stdin(f"/bin/python3 '{exec_path}'\n")

        # cli, gui 구분하기
        for _ in range(5):
            check = await exec_run(req.pod_name, ["bash", "-c", "DISPLAY=:1 xwininfo -root -tree | grep -E '\"[^ ]+\"' && echo yes || echo no"])
            if "yes" in check: return {"mode": "gui"}
            await asyncio.sleep(0.2)
        return {"mode": "cli"}
    
    except Exception as e: 
        raise HTTPException(500, detail=str(e))

# 생성
# kubectl apply -f https://raw.githubusercontent.com/rancher/local-path-provisioner/master/deploy/local-path-storage.yaml
# get_db=요청 하나당 DB 세션을 하나 자동으로 만들어서 주입해달라
@app.post("/containers", response_model=CreateContainerResponse)
async def create_container(req: CreateContainerRequest, db: Session = Depends(get_db)):

    owner = slug(req.user_name)
    project = slug(req.project_name)

    # 밑에 모두 중복 안돼, 장애 발생시 파드가 생성되므로 deploy는 하나만 생성됨
    key = f"{owner}-{project}"
    deploy_name = f"novnc-{key}"
    pvc_name = f"{deploy_name}-pvc"
    svc_name = f"{deploy_name}-svc"

    image = req.image or "jaewoo6257/vnc:1.0.0"
    env = dict(CONTAINER_ENV_DEFAULT)

    # 쿠버네티스의 가장 기본 리소스들
    # Pod, Service, ConfigMap, Secret, Namespace, Node, PVC, Event
    v1 = client.CoreV1Api()

    # 애플리케이션 실행/관리용 리소스
    # Deployment, StatefulSet, DaemonSet, ReplicaSet
    apps = client.AppsV1Api()


    labels = {
        "app": "novnc",
        "owner": owner,
        "project": project,
        "key": key, # selector가 이거 보고 pod 찾아감
    }


    existed = crud.get_alive_by_key(db, key)
    if existed:
        # existed여도 런타임 값은 다시 구해서 CreateContainerResponse로 반환
        novnc_port = create_service_nodeport(v1, NAMESPACE, svc_name, labels, ALLOWED_NOVNC_PORTS)
        pod_name = get_any_running_pod_name(v1, NAMESPACE, key)

        return CreateContainerResponse(
            pod_name=pod_name,
            novnc_port=novnc_port,
            namespace=NAMESPACE,
            deploy_name=existed.deploy_name,
            svc_name=existed.svc_name,
            pvc_name=existed.pvc_name,
        )

    # 1. PVC 만들기
    create_pvc(v1, NAMESPACE, pvc_name, labels)

    # 2. Deployment 만들기 (replicas=1)
    create_deployment(apps, NAMESPACE, deploy_name, labels, image, env, pvc_name)

    # 3. Service 만들기 (이미 존재하면 재사용, 없으면 포트 스캔 생성)
    novnc_port = create_service_nodeport(v1, NAMESPACE, svc_name, labels, ALLOWED_NOVNC_PORTS)

    # pod_name 찾기
    pod_name = get_any_running_pod_name(v1, NAMESPACE, key)

    # DB 저장하기
    obj = crud.create_project(db, {
        "user_name_raw": req.user_name,
        "project_name_raw": req.project_name,
        "owner_slug": owner,
        "project_slug": project,
        "key": key,
        "namespace": NAMESPACE,
        "deploy_name": deploy_name,
        "svc_name": svc_name,
        "pvc_name": pvc_name,
        "image": req.image,
    })

    return CreateContainerResponse(
        pod_name=pod_name,
        novnc_port=novnc_port,
        namespace=NAMESPACE,
        deploy_name=obj.deploy_name,
        svc_name=obj.svc_name,
        pvc_name=obj.pvc_name,
    )

# 삭제
@app.delete("/containers", response_model=DeleteContainerResponse)
async def delete_container(
    user_name: str = Query(...),
    project_name: str = Query(...),
    db: Session = Depends(get_db)
):
    v1 = client.CoreV1Api()
    apps = client.AppsV1Api()

    owner = slug(user_name)
    project = slug(project_name)
    key = f"{owner}-{project}"
    deploy_name = f"novnc-{key}"
    pvc_name = f"{deploy_name}-pvc"
    svc_name = f"{deploy_name}-svc"

    # key = f"{user_name}-{project_name}"
    # deploy_name = f"novnc-{key}"
    # svc_name = f"{deploy_name}-svc"
    # pvc_name = f"{deploy_name}-pvc"

    # Service
    v1.delete_namespaced_service(svc_name, NAMESPACE)

    # Deployment
    apps.delete_namespaced_deployment(deploy_name, NAMESPACE)

    # PVC
    v1.delete_namespaced_persistent_volume_claim(pvc_name, NAMESPACE)

    # DB 삭제
    crud.hard_delete_by_key(db, key)

    return DeleteContainerResponse(
        deploy_name=deploy_name,
        svc_name=svc_name,
        pvc_name=pvc_name
    )

# 프로젝트 목록 조회
@app.get("/containers", response_model=List[projectDto.ProjectSimpleOut])
def list_containers(
    user_name: str = Query(...), 
    db: Session = Depends(get_db)
):
    owner = slug(user_name)
    result = crud.list_by_owner(db, owner)

    return result

# 이름 수정

# 새로고침

# 파일 저장
# 코드랑 pod name 받아서create_file() 실행
@app.post("/save", response_model=SaveFileResponse)
async def save_file(req: SaveFileRequest):
    exec_path = await create_file(req.pod_name, req.code, file_name=req.file_name, base_path=WORKSPACE)
    return SaveFileResponse(exec_path=exec_path)

# 파일 불러오기

# 프로젝트 불러오

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
        venv_path = "/tmp/user_venv" 
        # venv 설정
        ensure_venv = f"""
        set -e
        if [ ! -x '{venv_path}/bin/python3' ]; then
            python3 -m venv '{venv_path}'
            '{venv_path}/bin/python3' -m pip install --upgrade pip
        fi
        """
        await exec_run(pod_name, ["bash","-lc", ensure_venv])

        # tty=True면 bash가 “터미널처럼” 동작
        # _preload_content 안끊기기 위해서 중요함 True인 경우 일회용임 
        resp = stream(
            v1.connect_get_namespaced_pod_exec,
            name=pod_name,
            namespace=NAMESPACE,
            command=["bash"],
            stderr=True, stdin=True, stdout=True, tty=True, 
            _preload_content=False, 
            container=CONTAINER_NAME
        )

        resp.write_stdin("source /tmp/user_venv/bin/activate")

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
                    # 이미 WS 닫혔으면 더 보내지 말고 종료
                    if websocket.client_state != WebSocketState.CONNECTED:
                        break
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
