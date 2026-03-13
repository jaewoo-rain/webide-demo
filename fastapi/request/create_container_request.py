from pydantic import BaseModel
from typing import Dict, List, Optional


# 컨테이너 만들 때 사용되는 Request
class CreateContainerRequest(BaseModel):
    project_name: str
    image: Optional[str] = "jaewoo6257/vnc:1.0.0"
    # cmd: Optional[List[str]] = None
