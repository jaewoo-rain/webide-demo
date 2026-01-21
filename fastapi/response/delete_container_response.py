from pydantic import BaseModel

# 컨테이너 만들 때 사용되는 Response
class DeleteContainerResponse(BaseModel):
    deploy_name: str
    svc_name: str
    pvc_name: str