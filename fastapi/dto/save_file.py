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

class SaveProjectFileItem(BaseModel):
    name: Optional[str] = None
    path: Optional[List[str]] = None
    relative_path: Optional[str] = None
    code: str = ""

class SaveProjectRequest(BaseModel):
    key: str
    base_path: str = "/opt/workspace"
    files: List[SaveProjectFileItem]


class SaveProjectResponse(BaseModel):
    saved_files: List[str] = Field(default_factory=list)