import asyncio
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException, Depends
from kubernetes import client, config
from kubernetes.stream import stream
from fastapi.middleware.cors import CORSMiddleware
from utils.util_exec_run import exec_run
from utils.util_create_file import create_file, save_project
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
from utils.util_create_project import (slug, create_pvc, create_deployment, create_service_nodeport, get_any_running_pod_name, get_service_nodeport)
from response.delete_container_response import DeleteContainerResponse
from dto.save_file import (
    SaveFileRequest,
    SaveFileResponse,
    SaveProjectRequest,
    SaveProjectResponse,
)
from repository.db import get_db
from sqlalchemy.orm import Session
from sqlalchemy import text
from config import settings
from repository import projectRepository as crud
from repository.db import Base, engine
from repository.models.project import Project # 지우면 안됨
from dto import project_dto as projectDto
from dto.load_file import (LoadProjectFilesResponse, FileMapItem, FileNode)
from pathlib import Path
import uuid
from routers.auth import router as auth_router
from repository.models.user import User
from core.auth import get_current_user

app = FastAPI()

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://210.117.181.234:5173","http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 로그인 관련 api
app.include_router(auth_router)

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
        v1 = client.CoreV1Api()

        key = req.projectKey
        pod_name = get_any_running_pod_name(v1, NAMESPACE, key)


        # 터미널 연결 시험
        resp = SESSION.get(pod_name)
        if not resp or not resp.is_open():
             raise HTTPException(400, detail="터미널 연결 안됨.")
    
        # 1. 프로젝트 전체 파일 저장
        # req.files: List[FileItem]
        # 각 FileItem은 name, code 를 가진다고 가정
        saved_files = await save_project(
            pod_name=pod_name,
            files=[file.model_dump() for file in req.files],
            base_path=WORKSPACE,
        )
        
        # 2. 실행할 파일 경로 찾기
        # entryFile: "main.py" 또는 "src/main.py"
        exec_path = os.path.join(WORKSPACE, req.entryFile)

        # 3. 실행 전 기존 동일 프로세스 종료
        await exec_run(pod_name, ["bash", "-c", f"pkill -f '{exec_path}' || true"])

        # 4. 실행하기
        resp.write_stdin(f"/bin/python3 '{exec_path}'\n")

        # cli, gui 구분하기
        for _ in range(5):
            check = await exec_run(
                pod_name, ["bash", "-c", 
                               "DISPLAY=:1 xwininfo -root -tree | grep -E "
                               "'\"[^ ]+\"' && echo yes || echo no"])
            if "yes" in check: return {"mode": "gui"}
            await asyncio.sleep(0.2)
        return {"mode": "cli"}
    
    except Exception as e: 
        raise HTTPException(500, detail=str(e))

# 생성
# kubectl apply -f https://raw.githubusercontent.com/rancher/local-path-provisioner/master/deploy/local-path-storage.yaml
# get_db=요청 하나당 DB 세션을 하나 자동으로 만들어서 주입해달라
@app.post("/containers", response_model=CreateContainerResponse)
async def create_container(
    req: CreateContainerRequest, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
    ):

    owner = slug(current_user.username)
    project = slug(req.project_name)

    # 밑에 모두 중복 안돼, 장애 발생시 파드가 생성되므로 deploy는 하나만 생성됨
    key = f"{owner}-{project}"
    deploy_name = f"novnc-{key}"
    pvc_name = f"{deploy_name}-pvc"
    svc_name = f"{deploy_name}-svc"

    image = req.image or "jaewoo6257/vnc:1.0.0"
    env = dict(CONTAINER_ENV_DEFAULT)

    # 기존에 존재하는지 확인 후 리턴하기
    

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

    # vncUrl 찾기
    port = get_service_nodeport(v1, NAMESPACE, svc_name)
    vncUrl = f"http://210.117.181.56:${port}/vnc.html?autoconnect=true&password=jaewoo"

    # DB 저장하기
    obj = crud.create_project(db, {
        "user_name_raw": current_user.username,
        "project_name_raw": req.project_name,
        "owner_slug": owner,
        "project_slug": project,
        "key": key,
        "namespace": NAMESPACE,
        "deploy_name": deploy_name,
        "svc_name": svc_name,
        "pvc_name": pvc_name,
        "image": req.image,
        "vncUrl": vncUrl,
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
    key: str = Query(...),
    db: Session = Depends(get_db)
):
    v1 = client.CoreV1Api()
    apps = client.AppsV1Api()

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

# 프로젝트 리스트 반환
@app.get("/containers")
def read_protected_data(
    db: Session = Depends(get_db),
    # current_user: User = Depends(get_current_user)
):

    # projectList = crud.list_by_owner(db, current_user.username)
    projectList = crud.list_by_owner(db, "jaewoo")

    projectList = [
        {
            "owner_slug": p.owner_slug,
            "project_name_raw": p.project_name_raw,
            "key": p.key,
            "vncUrl": p.vncUrl
        }
        for p in projectList
    ]


    return projectList
# 이름 수정

# 새로고침

# 현재 파일 저장
@app.post("/save", response_model=SaveFileResponse)
async def save_file(req: SaveFileRequest):

    v1 = client.CoreV1Api()
    pod_name = get_any_running_pod_name(v1, NAMESPACE, req.key)

    exec_path = await create_file(
        pod_name=pod_name,
        code=req.code,
        file_name=req.file_name,
        base_path=req.base_path,
        path=req.path,
        relative_path=req.relative_path,
    )
    return SaveFileResponse(exec_path=exec_path)


# 전체 프로젝트 저장
@app.post("/saveProject", response_model=SaveProjectResponse)
async def save_project_api(req: SaveProjectRequest):

    v1 = client.CoreV1Api()
    pod_name = get_any_running_pod_name(v1, NAMESPACE, req.key)

    saved_files = await save_project(
        pod_name=pod_name,
        files=[file.model_dump() for file in req.files],
        base_path=req.base_path,
    )
    return SaveProjectResponse(saved_files=saved_files)


# 프로젝트 불러오기
@app.get("/projects/{key}/files", response_model=LoadProjectFilesResponse)
async def load_project_files(
    key: str,
    db: Session = Depends(get_db),
):
    try:
        v1 = client.CoreV1Api()

        # DB에 프로젝트가 있는지 확인
        project = crud.get_alive_by_key(db, key)
        if not project:
            raise HTTPException(status_code=404, detail="프로젝트를 찾을 수 없습니다.")

        pod_name = get_any_running_pod_name(v1, NAMESPACE, key)
        if not pod_name:
            raise HTTPException(status_code=404, detail="실행 중인 pod가 없습니다.")

        base_path = WORKSPACE

        # 1) 전체 경로 수집
        raw_paths = await exec_run(
            pod_name,
            ["bash", "-lc", f"find '{base_path}' -mindepth 1 -print0"]
        )

        if not raw_paths:
            return LoadProjectFilesResponse(
                tree=FileNode(id="root", name="", type="folder", children=[]),
                fileMap={}
            )

        paths = [p for p in raw_paths.split("\0") if p]

        # 2) 파일만 수집
        raw_file_paths = await exec_run(
            pod_name,
            ["bash", "-lc", f"find '{base_path}' -type f -print0"]
        )
        file_paths = [p for p in raw_file_paths.split("\0") if p] if raw_file_paths else []
        file_paths_set = set(file_paths)

        # 3) 파일 내용 읽기
        contents: dict[str, str] = {}
        if file_paths:
            delimiter = "__FILE_BOUNDARY_9f3c2a1b__"
            quoted_paths = " ".join([f'"{p}"' for p in file_paths])
            cmd = (
                f"for f in {quoted_paths}; do "
                f"cat \"$f\" 2>/dev/null || true; "
                f"printf '\\n{delimiter}\\n'; "
                f"done"
            )
            blob = await exec_run(pod_name, ["bash", "-lc", cmd])
            split_contents = blob.split(f"\n{delimiter}\n")

            for idx, path_str in enumerate(file_paths):
                if idx < len(split_contents):
                    contents[path_str] = split_contents[idx]

        # 4) 트리 구성
        root = {"id": "root", "name": "", "type": "folder", "children": [], "path": base_path}
        nodes_by_path = {base_path: root}
        file_map = {}

        for abs_path in sorted(paths):
            p = Path(abs_path)
            name = p.name
            parent_path = str(p.parent)

            parent_node = nodes_by_path.get(parent_path)
            if parent_node is None:
                # 혹시 부모가 누락된 경우 방어
                continue

            node_id = str(uuid.uuid4())
            node_type = "file" if abs_path in file_paths_set else "folder"

            new_node = {
                "id": node_id,
                "name": name,
                "type": node_type,
                "children": [],
                "path": abs_path,
            }

            parent_node["children"].append(new_node)
            nodes_by_path[abs_path] = new_node

            relative_path = str(Path(abs_path).relative_to(base_path))

            file_map[node_id] = {
                "id": node_id,
                "name": name,
                "type": node_type,
                "path": abs_path,
                "relative_path": relative_path,
                "content": contents.get(abs_path) if node_type == "file" else None,
            }

        # 5) path 제거
        def strip_path(node: dict):
            node.pop("path", None)
            for child in node.get("children", []):
                strip_path(child)

        strip_path(root)

        return LoadProjectFilesResponse(
            tree=FileNode(**root),
            fileMap={k: FileMapItem(**v) for k, v in file_map.items()}
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))



# 연결
@app.websocket("/ws/terminal")
async def ws_terminal(
    websocket: WebSocket,
    # user_name: str = Query(..., alias="user_name"),
    # project_name: str = Query(..., alias="project_name"),
    key: str = Query(..., alias="key"),
    pod_name: Optional[str] = Query(None, alias="pod_name"),
    ):

    # WebSocket 연결을 "수락"한다.
    await websocket.accept()
    # 접속 성공 알림
    await websocket.send_text("✅ WS connected. attaching to pod...\r\n")

    v1 = client.CoreV1Api()

    if pod_name is None or pod_name.strip() in ("", "null", "None"):
        # owner = slug(user_name)
        # project = slug(project_name)
        # key = f"{owner}-{project}"

        pod_name = get_any_running_pod_name(v1, NAMESPACE, key)
        if not pod_name:
            await websocket.send_text(f"\r\n❌ no running pod for key={key}\r\n")
            await websocket.close(code=1011)
            return
    

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
