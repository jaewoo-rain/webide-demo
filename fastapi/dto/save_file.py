from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Union


class SaveFileRequest(BaseModel):
    key: str
    code: str
    file_name: Optional[str] = None
    path: Optional[List[str]] = None
    relative_path: Optional[str] = None
    base_path: str = "/opt/workspace"


class SaveFileResponse(BaseModel):
    exec_path: str


class ProjectFileItem(BaseModel):
    code: str
    name: Optional[str] = None
    path: Optional[List[str]] = None
    relative_path: Optional[str] = None


class SaveProjectRequest(BaseModel):
    key: str
    base_path: str = "/opt/workspace"
    # 예시:
    # {
    #   "main.py": { "code": "print(1)" },
    #   "src/app.py": { "code": "print(2)", "relative_path": "src/app.py" }
    # }
    files: Dict[str, Union[str, ProjectFileItem]]


class SaveProjectResponse(BaseModel):
    saved_files: List[str] = Field(default_factory=list)