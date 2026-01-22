from pydantic import BaseModel
from typing import Dict, List, Optional


# 컨테이너 만들 때 사용되는 Request
class SaveFileRequest(BaseModel):
    pod_name: str
    code: str
    file_name: str

class SaveFileResponse(BaseModel):
    exec_path: str
