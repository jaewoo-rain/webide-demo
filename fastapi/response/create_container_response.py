from pydantic import BaseModel

# 컨테이너 만들 때 사용되는 Response
class CreateContainerResponse(BaseModel):
    pod_name: str
    novnc_port: int
    namespace: str
    deploy_name: str
    svc_name: str
    pvc_name: str
    # id: str
    # name: str
    # image: str
    # owner: str
    # role: str
    # limited_by_quota: bool
    # projectName: str
    # vnc_url: str
    # ws_url: str