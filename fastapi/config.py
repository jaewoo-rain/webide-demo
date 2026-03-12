import os
from pydantic import BaseModel

CONTAINER_ENV_DEFAULT= {
    "VNC_PORT": "5901",
    "NOVNC_PORT": "6081",
    "VNC_GEOMETRY": "1024x768",
    "VNC_DEPTH": "24",
}
INTERNAL_NOVNC_PORT = 6081  # 컨테이너 내부 noVNC 포트는 그대로
ALLOWED_NOVNC_PORTS = list(range(31000, 31101))  # NodePort용 포트 범위 (31000~31100)
VNC_APP_LABEL = "vnc-session" 
NAMESPACE = "webide-net"
DEFAULT_STORAGE = "10Gi"
WORKSPACE_MOUNT_PATH = "/workspace" # 컨테이너 안에서 파일 저장할 경로
VOLUME_NAME = "workspace"
WORKSPACE = "/opt/workspace"

# class Settings:
#     DATABASE_URL: str = os.getenv("DATABASE_URL")  # K8s Secret로 주입

#     # NAMESPACE: str = os.getenv("NAMESPACE", "webide-net")

# settings = Settings()

class Settings(BaseModel):
    DATABASE_URL: str = os.getenv("DATABASE_URL")  # K8s Secret로 주입
    SECRET_KEY: str = "jcolabjcolabjcolabjcolabjcolabjcolabjcolabjcolab1234"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

settings = Settings()